// lib/rate-limiter.ts
// Prefer higher limits in dev to avoid noisy 429s locally
const DEV = process.env.NODE_ENV !== "production"
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || (DEV ? 100 : 20))

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

/**
 * Extract a stable client key for rate limiting.
 * - Prefer x-forwarded-for (first IP), then x-real-ip, then cf-connecting-ip.
 * - Fall back to req.ip or "unknown".
 */
export function getClientKeyFromRequest(req: Request & { headers: Headers; ip?: string | null }) {
  const xf = req.headers.get("x-forwarded-for")
  if (xf) {
    const first = xf.split(",")[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get("x-real-ip")
  if (real) return real
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf
  return (req as any)?.ip || "unknown"
}

export function rateLimitOk(ip: string | null | undefined) {
  const key = ip || "unknown"
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false
  bucket.count += 1
  return true
}

export function rateLimitRemaining(ip: string | null | undefined) {
  const key = ip || "unknown"
  const bucket = buckets.get(key)
  if (!bucket) return Math.max(0, RATE_LIMIT_MAX - 1)
  return Math.max(0, RATE_LIMIT_MAX - bucket.count)
}

export function rateLimitResetIn(ip: string | null | undefined) {
  const key = ip || "unknown"
  const bucket = buckets.get(key)
  if (!bucket) return RATE_LIMIT_WINDOW_MS
  return Math.max(0, bucket.resetAt - Date.now())
}

/** Helper to attach standard rate-limit headers */
export function rateLimitHeaders(ip: string | null | undefined) {
  return {
    "x-ratelimit-limit": String(RATE_LIMIT_MAX),
    "x-ratelimit-remaining": String(rateLimitRemaining(ip)),
    "x-ratelimit-reset": String(Math.ceil(rateLimitResetIn(ip) / 1000)), // seconds
  }
}
