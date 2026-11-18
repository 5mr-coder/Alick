import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

type CookieEntry = {
  name: string;
  value: string;
  options?: Parameters<NextResponse['cookies']['set']>[2];
};

const mfaVerifySchema = z.object({
  factorId: z.string().uuid('Invalid MFA factor ID'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app'),
});

export async function POST(req: NextRequest) {
  const pendingCookies = new Map<string, CookieEntry>();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.set(name, { name, value, options });
          });
        },
      },
    }
  );

  const jsonWithCookies = (payload: unknown, status = 200) => {
    const res = NextResponse.json(payload, { status });
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonWithCookies(
      { error: 'Session expired. Sign in again.' },
      401
    );
  }

  const admin = createAdminClient();
  const { data: roleRow, error: roleError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleError) {
    console.error('[auth/mfa-verify] user_roles lookup error:', roleError.message);
    return jsonWithCookies(
      { error: 'Unable to verify admin role.' },
      500
    );
  }

  if (roleRow?.role !== 'admin') {
    await supabase.auth.signOut();
    return jsonWithCookies(
      { error: 'This account does not have an admin role.' },
      403
    );
  }

  const ip = await getClientIp();
  const [ipAllowed, userAllowed] = await Promise.all([
    enforceRateLimit(`mfa:ip:${ip}`, 12, 300),
    enforceRateLimit(`mfa:user:${user.id}`, 8, 300),
  ]);

  if (!ipAllowed || !userAllowed) {
    return jsonWithCookies(
      { error: 'Too many verification attempts. Please wait 5 minutes.' },
      429
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWithCookies({ error: 'Invalid request body.' }, 400);
  }

  const parsed = mfaVerifySchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCookies(
      {
        error:
          parsed.error.issues[0]?.message || 'Invalid verification code.',
      },
      400
    );
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: parsed.data.factorId,
    code: parsed.data.code,
  });

  if (error) {
    return jsonWithCookies(
      { error: 'Invalid or expired authenticator code. Please try again.' },
      400
    );
  }

  return jsonWithCookies({ ok: true });
}
