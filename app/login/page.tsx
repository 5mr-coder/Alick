import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function getSafeNext(rawNext: string | undefined): string {
  if (!rawNext) return '/admin';
  return rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/admin';
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const safeNext = getSafeNext(params.next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialStep: 'credentials' | 'enroll' | 'verify' | 'forbidden' =
    'credentials';
  let initialFactorId: string | null = null;
  let initialError: string | null = null;

  if (user) {
    // Check public.user_roles via service_role while session may still be AAL1.
    const admin = createAdminClient();
    const { data: roleRow, error: roleError } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('[login/page] user_roles lookup error:', roleError.message);
      initialError =
        'Unable to verify admin permissions right now. Please try again.';
      initialStep = 'credentials';
    } else if (roleRow?.role !== 'admin') {
      try {
        await supabase.auth.signOut();
      } catch {
        // Cookie clearing in Server Components may be a no-op; LoginClient signs out cleanly.
      }
      initialStep = 'forbidden';
    } else {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel === 'aal2') {
        redirect(safeNext);
      }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === 'verified');

      if (aalData?.nextLevel === 'aal2' || verified) {
        if (verified) {
          initialStep = 'verify';
          initialFactorId = verified.id;
        } else {
          initialStep = 'enroll';
        }
      } else {
        initialStep = 'enroll';
      }
    }
  }

  return (
    <LoginClient
      safeNext={safeNext}
      initialStep={initialStep}
      initialFactorId={initialFactorId}
      initialEmail={user?.email ?? null}
      initialError={initialError}
    />
  );
}
