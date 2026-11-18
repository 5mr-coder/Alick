import 'server-only';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = h.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 64);
  return 'unknown';
}

export async function enforceRateLimit(
  key: string,
  maxHits: number,
  windowSeconds: number
): Promise<boolean> {
  const sanitizedKey = key.trim().slice(0, 200);
  if (!sanitizedKey) return false;

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('check_rate_limit', {
    p_key: sanitizedKey,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error('[rate-limit] check_rate_limit error:', error.message);
    return false;
  }

  return Boolean(data);
}
