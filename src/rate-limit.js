function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket.remoteAddress || "unknown";
}

export function createRateLimiter({ windowMs, maxRequests }) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const ip = getClientIp(req);
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: "Забагато запитів. Спробуйте ще раз трохи пізніше."
      });
    }

    entry.count += 1;
    return next();
  };
}
