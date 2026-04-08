import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { DateTime } from "luxon";

function ensureDirectory(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function startOfCurrentMonth(timeZone) {
  return DateTime.now().setZone(timeZone).startOf("month");
}

export function createStatsStore(config) {
  ensureDirectory(config.statsDbPath);

  const db = new Database(config.statsDbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS translation_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      extraction_mode TEXT NOT NULL,
      original_filename TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_translation_events_created_at
      ON translation_events(created_at);

    CREATE TABLE IF NOT EXISTS feedback_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      locale TEXT NOT NULL,
      author_name TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_at TEXT,
      reviewed_by TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_entries_status_created_at
      ON feedback_entries(status, created_at DESC);
  `);

  const insertEventStmt = db.prepare(`
    INSERT INTO translation_events (created_at, mime_type, extraction_mode, original_filename)
    VALUES (@created_at, @mime_type, @extraction_mode, @original_filename)
  `);

  const countBetweenStmt = db.prepare(`
    SELECT COUNT(*) AS total
    FROM translation_events
    WHERE created_at >= ? AND created_at < ?
  `);

  const countTotalStmt = db.prepare(`
    SELECT COUNT(*) AS total
    FROM translation_events
  `);

  const breakdownStmt = db.prepare(`
    SELECT mime_type, COUNT(*) AS total
    FROM translation_events
    WHERE created_at >= ? AND created_at < ?
    GROUP BY mime_type
    ORDER BY total DESC, mime_type ASC
  `);

  const insertFeedbackStmt = db.prepare(`
    INSERT INTO feedback_entries (created_at, locale, author_name, message, status)
    VALUES (@created_at, @locale, @author_name, @message, 'pending')
  `);

  const approvedFeedbackStmt = db.prepare(`
    SELECT id, created_at, locale, author_name, message
    FROM feedback_entries
    WHERE status = 'approved'
    ORDER BY created_at DESC
    LIMIT ?
  `);

  const feedbackCountsStmt = db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
    FROM feedback_entries
  `);

  const feedbackModerationStmt = db.prepare(`
    SELECT id, created_at, locale, author_name, message, status, reviewed_at, reviewed_by
    FROM feedback_entries
    WHERE (@status IS NULL OR status = @status)
    ORDER BY
      CASE status
        WHEN 'pending' THEN 0
        WHEN 'approved' THEN 1
        ELSE 2
      END,
      created_at DESC
    LIMIT @limit
  `);

  const feedbackByIdStmt = db.prepare(`
    SELECT id, created_at, locale, author_name, message, status, reviewed_at, reviewed_by
    FROM feedback_entries
    WHERE id = ?
  `);

  const updateFeedbackStatusStmt = db.prepare(`
    UPDATE feedback_entries
    SET status = @status,
        reviewed_at = @reviewed_at,
        reviewed_by = @reviewed_by
    WHERE id = @id
  `);

  return {
    recordTranslationEvent({ mimeType, extractionMode, originalFilename }) {
      insertEventStmt.run({
        created_at: new Date().toISOString(),
        mime_type: mimeType,
        extraction_mode: extractionMode,
        original_filename: originalFilename
      });
    },

    getQuickStats() {
      const now = DateTime.now().setZone(config.adminTimeZone);
      const hourStart = now.minus({ hours: 1 }).toUTC().toISO();
      const dayStart = now.minus({ days: 1 }).toUTC().toISO();
      const weekStart = now.minus({ days: 7 }).toUTC().toISO();
      const monthStart = startOfCurrentMonth(config.adminTimeZone).toUTC().toISO();
      const end = now.toUTC().toISO();

      return {
        lastHour: countBetweenStmt.get(hourStart, end).total,
        lastDay: countBetweenStmt.get(dayStart, end).total,
        lastWeek: countBetweenStmt.get(weekStart, end).total,
        monthToDate: countBetweenStmt.get(monthStart, end).total,
        total: countTotalStmt.get().total
      };
    },

    getReport({ startUtcIso, endUtcIso }) {
      return {
        total: countBetweenStmt.get(startUtcIso, endUtcIso).total,
        breakdownByMimeType: breakdownStmt.all(startUtcIso, endUtcIso)
      };
    },

    createFeedbackEntry({ locale, authorName, message }) {
      const result = insertFeedbackStmt.run({
        created_at: new Date().toISOString(),
        locale,
        author_name: authorName,
        message
      });

      return feedbackByIdStmt.get(result.lastInsertRowid);
    },

    getApprovedFeedback(limit = 6) {
      return approvedFeedbackStmt.all(limit);
    },

    getFeedbackModeration({ limit = 50, status = null } = {}) {
      return {
        counts: feedbackCountsStmt.get(),
        entries: feedbackModerationStmt.all({ status, limit })
      };
    },

    updateFeedbackStatus({ id, status, reviewedBy }) {
      updateFeedbackStatusStmt.run({
        id,
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy
      });

      return feedbackByIdStmt.get(id);
    }
  };
}

export function getDefaultReportRange(timeZone) {
  const endLocal = DateTime.now().setZone(timeZone);
  const startLocal = endLocal.minus({ days: 7 });

  return {
    startLocal,
    endLocal,
    startUtcIso: startLocal.toUTC().toISO(),
    endUtcIso: endLocal.toUTC().toISO()
  };
}

export function parseAdminDateRange({ startLocalRaw, endLocalRaw, timeZone }) {
  const startLocal = DateTime.fromISO(startLocalRaw || "", { zone: timeZone });
  const endLocal = DateTime.fromISO(endLocalRaw || "", { zone: timeZone });

  if (!startLocal.isValid || !endLocal.isValid) {
    return {
      ok: false,
      error: "Вкажіть коректні дату та час початку і завершення звіту."
    };
  }

  if (endLocal <= startLocal) {
    return {
      ok: false,
      error: "Дата завершення має бути пізнішою за дату початку."
    };
  }

  return {
    ok: true,
    startLocal,
    endLocal,
    startUtcIso: startLocal.toUTC().toISO(),
    endUtcIso: endLocal.toUTC().toISO()
  };
}
