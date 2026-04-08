import crypto from "node:crypto";

function decodeCookieValue(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function signPayload(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function parseCookies(headerValue = "") {
  return headerValue
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1);
      cookies[key] = decodeCookieValue(value);
      return cookies;
    }, {});
}

export function createAdminSession(config) {
  const expiresAt = Date.now() + config.adminSessionMaxAgeMs;
  const payload = `${config.adminUsername}|${expiresAt}`;
  const signature = signPayload(payload, config.adminSessionSecret);
  return `${payload}|${signature}`;
}

export function verifyAdminSession(sessionToken, config) {
  if (!sessionToken || !config.adminUsername || !config.adminSessionSecret) {
    return false;
  }

  const parts = sessionToken.split("|");
  if (parts.length !== 3) {
    return false;
  }

  const [username, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!username || !expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedPayload = `${username}|${expiresAt}`;
  const expectedSignature = signPayload(expectedPayload, config.adminSessionSecret);
  return username === config.adminUsername && safeEqual(signature, expectedSignature);
}

export function buildAdminCookie(sessionToken, config) {
  return `${config.adminCookieName}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(config.adminSessionMaxAgeMs / 1000)}`;
}

export function buildAdminLogoutCookie(config) {
  return `${config.adminCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function createFeedbackAccessToken(config) {
  const expiresAt = Date.now() + config.feedbackAccessMaxAgeMs;
  const payload = `feedback|${expiresAt}`;
  const signature = signPayload(payload, config.adminSessionSecret);
  return `${payload}|${signature}`;
}

export function verifyFeedbackAccessToken(token, config) {
  if (!token || !config.adminSessionSecret) {
    return false;
  }

  const parts = token.split("|");
  if (parts.length !== 3) {
    return false;
  }

  const [scope, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (scope !== "feedback" || !expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedPayload = `${scope}|${expiresAt}`;
  const expectedSignature = signPayload(expectedPayload, config.adminSessionSecret);
  return safeEqual(signature, expectedSignature);
}

export function buildFeedbackAccessCookie(token, config) {
  return `${config.feedbackAccessCookieName}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${Math.floor(config.feedbackAccessMaxAgeMs / 1000)}`;
}
