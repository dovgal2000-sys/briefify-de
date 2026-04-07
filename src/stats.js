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

