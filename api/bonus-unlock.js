const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const signedUrlTtlSeconds = 5 * 60;

const requestLog = new Map();

function json(res, statusCode, body) {
  res.status(statusCode).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function isRateLimited(ip) {
  const now = Date.now();

  for (const [key, info] of requestLog.entries()) {
    if (now - info.windowStart > RATE_LIMIT_WINDOW_MS) {
      requestLog.delete(key);
    }
  }

  const current = requestLog.get(ip);
  if (!current) {
    requestLog.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  if (now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestLog.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  current.count += 1;
  requestLog.set(ip, current);

  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

async function sendLeadWebhook(email, ip) {
  const webhookUrl = process.env.BONUS_LEAD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        ip,
        source: "landing-bonus",
        ts: new Date().toISOString()
      })
    });
  } catch (error) {
    // Falha no webhook nao deve bloquear a entrega do bonus.
  }
}

function buildS3Client() {
  const endpoint = process.env.BONUS_S3_ENDPOINT;
  const region = process.env.BONUS_S3_REGION || "us-east-1";
  const accessKeyId = process.env.BONUS_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BONUS_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing object storage credentials");
  }

  const forcePathStyle = process.env.BONUS_S3_FORCE_PATH_STYLE
    ? process.env.BONUS_S3_FORCE_PATH_STYLE === "true"
    : Boolean(endpoint);

  return new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return json(res, 429, { error: "Too many requests. Try again in a few minutes." });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return json(res, 400, { error: "Invalid request body" });
    }
  }

  const email = String(body.email || "").trim().toLowerCase();
  const company = String(body.company || "").trim();

  if (company) {
    return json(res, 200, { ok: true });
  }

  if (!isValidEmail(email)) {
    return json(res, 400, { error: "Enter a valid email address" });
  }

  const bucket = process.env.BONUS_S3_BUCKET;
  const key = process.env.BONUS_S3_KEY;

  if (!bucket || !key) {
    return json(res, 500, { error: "Bonus delivery is not configured" });
  }

  try {
    const s3 = buildS3Client();
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: signedUrlTtlSeconds });

    await sendLeadWebhook(email, ip);

    return json(res, 200, {
      ok: true,
      downloadUrl,
      expiresIn: signedUrlTtlSeconds
    });
  } catch (error) {
    return json(res, 500, { error: "Could not generate secure download link" });
  }
};
