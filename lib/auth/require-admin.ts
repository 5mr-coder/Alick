import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Verifies the current request holds an authenticated user with AAL2 (TOTP MFA)
 * AND an `admin` row in `public.user_roles` — matching `private.is_admin()` in
 * `0002_rls_grants_rpc_storage.sql`.
 *
 * Returns the RLS-enforced `server.ts` Supabase client (`authenticated` role)
 * so callers always execute reads/mutations through `private.is_admin()` RLS.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAuthError('UNAUTHENTICATED');
  }

  const { data: aalData, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError || aalData?.currentLevel !== 'aal2') {
    throw new AdminAuthError('MFA_REQUIRED');
  }

  // public.user_roles has zero grants to anon/authenticated by design (0002),
  // so role membership is checked narrowly with service_role here.
  const admin = createAdminClient();
  const { data: roleRow, error: roleError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleError) {
    console.error('[requireAdmin] user_roles query error:', roleError.message);
    // Fallback to Postgres private.is_admin() via RLS-protected site_settings
    // at AAL2 so a transient/key error does not misreport a valid admin.
    const { data: settingsRow, error: settingsError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', true)
      .maybeSingle();

    if (settingsError || settingsRow?.id !== true) {
      throw new AdminAuthError('FORBIDDEN');
    }

    return { supabase, user };
  }

  if (roleRow?.role !== 'admin') {
    throw new AdminAuthError('FORBIDDEN');
  }

  return { supabase, user };
}

/**
 * Server Component guard for `/admin` layouts and pages: redirects to `/login`
 * when the caller is not an AAL2 admin.
 */
export async function requireAdminPage(nextPath = '/admin') {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError && error.message === 'FORBIDDEN') {
      redirect('/login?error=forbidden');
    }
    const safeNext =
      nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/admin';
    redirect(`/login?next=${encodeURIComponent(safeNext)}`);
  }
}
