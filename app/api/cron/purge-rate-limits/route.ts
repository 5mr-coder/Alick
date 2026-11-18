import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(authHeader, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handlePurge(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('purge_rate_limits');

  if (error) {
    console.error('[cron/purge-rate-limits] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to purge rate limits.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deleted: Number(data ?? 0) });
}

export async function GET(req: NextRequest) {
  return handlePurge(req);
}

export async function POST(req: NextRequest) {
  return handlePurge(req);
}
