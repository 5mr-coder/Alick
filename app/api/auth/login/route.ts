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

const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required').max(150),
  password: z.string().min(1, 'Password is required').max(200),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid credentials.' },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const ip = await getClientIp();

  const [ipAllowed, emailAllowed] = await Promise.all([
    enforceRateLimit(`login:ip:${ip}`, 10, 300),
    enforceRateLimit(`login:email:${email}`, 8, 300),
  ]);

  if (!ipAllowed || !emailAllowed) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please wait 5 minutes and try again.' },
      { status: 429 }
    );
  }

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return jsonWithCookies({ error: 'Invalid email or password.' }, 401);
  }

  // Check admin role using service_role while the session is still at AAL1
  // (RLS on public.user_roles requires private.is_admin() / AAL2).
  const admin = createAdminClient();
  const { data: roleRow, error: roleError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleError) {
    console.error('[auth/login] user_roles lookup error:', roleError.message);
    await supabase.auth.signOut();
    return jsonWithCookies(
      { error: 'Unable to verify admin role. Check server configuration.' },
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

  const [{ data: aalData }, { data: factorsData }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  const verifiedTotp = factorsData?.totp?.find((f) => f.status === 'verified');

  return jsonWithCookies({
    ok: true,
    currentLevel: aalData?.currentLevel ?? 'aal1',
    nextLevel: aalData?.nextLevel ?? 'aal1',
    verifiedFactorId: verifiedTotp?.id ?? null,
  });
}
