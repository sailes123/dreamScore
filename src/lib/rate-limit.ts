import { ApiError } from '@/lib/api';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * A small per-instance guard for abusive public endpoints. Deployments with
 * multiple instances should replace this with a shared Redis-backed limiter.
 */
export function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const forwarded = request.headers.get('x-forwarded-for');
  const client = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const key = `${scope}:${client}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new ApiError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
  }
}
