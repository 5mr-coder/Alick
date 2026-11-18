'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Lock, KeyRound, LogOut } from 'lucide-react';

type LoginStep = 'credentials' | 'enroll' | 'verify' | 'forbidden';

export default function LoginClient({
  safeNext,
  initialStep,
  initialFactorId,
  initialEmail,
  initialError = null,
}: {
  safeNext: string;
  initialStep: LoginStep;
  initialFactorId: string | null;
  initialEmail: string | null;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [factorId, setFactorId] = useState<string | null>(initialFactorId);
  const [qrCodeSrc, setQrCodeSrc] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const enrollingRef = useRef(false);

  useEffect(() => {
    if (initialStep === 'forbidden') {
      void createClient().auth.signOut();
    }
  }, [initialStep]);

  useEffect(() => {
    if (step !== 'enroll' || qrCodeSrc || factorId) return;
    let cancelled = false;

    const run = async () => {
      if (enrollingRef.current) return;
      enrollingRef.current = true;
      try {
        const supabase = createClient();
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const allTotp = (factorsData?.all ?? []).filter(
          (f) => f.factor_type === 'totp'
        );
        const alreadyVerified = allTotp.find((f) => f.status === 'verified');
        if (alreadyVerified) {
          if (!cancelled) {
            setFactorId(alreadyVerified.id);
            setStep('verify');
          }
          return;
        }

        const unverifiedTotp = allTotp.filter((f) => f.status !== 'verified');
        for (const stale of unverifiedTotp) {
          await supabase.auth.mfa.unenroll({ factorId: stale.id });
        }

        const { data, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'Alick Admin Authenticator',
        });

        if (cancelled) return;

        if (enrollError || !data) {
          setError(enrollError?.message || 'Failed to initialize TOTP setup.');
          return;
        }

        setFactorId(data.id);
        const rawQr = data.totp.qr_code;
        setQrCodeSrc(
          rawQr.startsWith('data:')
            ? rawQr
            : `data:image/svg+xml;utf-8,${encodeURIComponent(rawQr)}`
        );
        setTotpSecret(data.totp.secret);
      } catch {
        if (!cancelled) {
          setError('Could not initialize authenticator enrollment.');
        }
      } finally {
        enrollingRef.current = false;
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [step, qrCodeSrc, factorId]);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        currentLevel?: string;
        nextLevel?: string;
        verifiedFactorId?: string | null;
      };

      if (res.status === 403) {
        setStep('forbidden');
        return;
      }

      if (!res.ok || !data.ok) {
        setError(data.error || 'Invalid credentials.');
        return;
      }

      if (data.currentLevel === 'aal2') {
        window.location.assign(safeNext);
        return;
      }

      if (data.verifiedFactorId) {
        setFactorId(data.verifiedFactorId);
        setCode('');
        setStep('verify');
        return;
      }

      if (data.nextLevel === 'aal2') {
        const supabase = createClient();
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const verified = factorsData?.totp?.find((f) => f.status === 'verified');
        if (verified) {
          setFactorId(verified.id);
          setCode('');
          setStep('verify');
          return;
        }
      }

      setCode('');
      setQrCodeSrc(null);
      setFactorId(null);
      setStep('enroll');
    } catch {
      setError('Network error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) {
      setError('Authenticator factor is missing. Reload and try again.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId, code: code.trim() }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (res.status === 403) {
        setStep('forbidden');
        return;
      }

      if (!res.ok || !data.ok) {
        setError(data.error || 'Invalid verification code.');
        return;
      }

      window.location.assign(safeNext);
    } catch {
      setError('Network error verifying authenticator code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setPassword('');
    setCode('');
    setFactorId(null);
    setQrCodeSrc(null);
    setTotpSecret(null);
    setError(null);
    setStep('credentials');
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: 'var(--ash-900)',
    border: '1px solid var(--border)',
    color: 'var(--heading)',
    fontSize: '0.95rem',
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--ash-950)',
        padding: '2rem 1.25rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.25rem 2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(245, 200, 66, 0.12)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-400)',
            }}
          >
            {step === 'credentials' ? (
              <Lock size={20} />
            ) : step === 'forbidden' ? (
              <ShieldCheck size={20} />
            ) : (
              <KeyRound size={20} />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gold-400)',
              }}
            >
              Alick Admin Portal
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: 'var(--heading)',
                lineHeight: 1.2,
              }}
            >
              {step === 'credentials'
                ? 'Admin Sign In'
                : step === 'enroll'
                  ? 'Set Up Authenticator'
                  : step === 'verify'
                    ? 'Two-Factor Verification'
                    : 'Access Denied'}
            </h1>
          </div>
        </div>

        {step === 'forbidden' && (
          <div>
            <p
              style={{
                color: 'var(--ash-300)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              Your account ({email || 'signed-in user'}) is authenticated, but
              it does not have an admin role in Alick System Services.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--gold-400)',
                  color: 'var(--on-gold)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
              <Link
                href="/"
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  color: 'var(--heading)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Storefront
              </Link>
            </div>
          </div>
        )}

        {step === 'credentials' && (
          <form
            onSubmit={handlePasswordSignIn}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--ash-300)',
                  marginBottom: '0.35rem',
                }}
              >
                Admin Email
              </label>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--ash-300)',
                  marginBottom: '0.35rem',
                }}
              >
                Password
              </label>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gold-400)',
                color: 'var(--on-gold)',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.25rem',
              }}
            >
              {loading ? 'Signing in...' : 'Continue to 2FA'}
            </button>

            <Link
              href="/"
              style={{
                textAlign: 'center',
                fontSize: '0.825rem',
                color: 'var(--ash-400)',
                textDecoration: 'none',
                marginTop: '0.5rem',
              }}
            >
              ← Return to Storefront
            </Link>
          </form>
        )}

        {step === 'enroll' && (
          <form
            onSubmit={handleVerifyCode}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--ash-300)',
                lineHeight: 1.6,
              }}
            >
              Mandatory two-factor authentication is required for admin access.
              Scan this QR code with Google Authenticator, 1Password, or Authy,
              then enter the 6-digit code below.
            </p>

            {qrCodeSrc ? (
              <div
                style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '12px',
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                <img
                  src={qrCodeSrc}
                  alt="TOTP Enrollment QR Code"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--ash-400)',
                  fontSize: '0.875rem',
                }}
              >
                Generating QR code...
              </div>
            )}

            {totpSecret && (
              <div
                style={{
                  background: 'var(--ash-900)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.78rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: showSecret ? '0.4rem' : 0,
                  }}
                >
                  <span style={{ color: 'var(--ash-400)' }}>
                    Can&apos;t scan QR? Manual key:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSecret((s) => !s)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold-400)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                    }}
                  >
                    {showSecret ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                {showSecret && (
                  <code
                    style={{
                      color: 'var(--heading)',
                      wordBreak: 'break-all',
                      userSelect: 'all',
                    }}
                  >
                    {totpSecret}
                  </code>
                )}
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--ash-300)',
                  marginBottom: '0.35rem',
                }}
              >
                6-Digit Authenticator Code
              </label>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  letterSpacing: '0.35em',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
                placeholder="000000"
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gold-400)',
                color: 'var(--on-gold)',
                fontWeight: 700,
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
                opacity: loading || code.length !== 6 ? 0.7 : 1,
              }}
            >
              {loading ? 'Verifying...' : 'Enable 2FA & Enter Admin'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ash-400)',
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Sign out / use a different account
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form
            onSubmit={handleVerifyCode}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--ash-300)',
                lineHeight: 1.6,
              }}
            >
              Enter the 6-digit code from your authenticator app to upgrade your
              session to AAL2.
            </p>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--ash-300)',
                  marginBottom: '0.35rem',
                }}
              >
                6-Digit Authenticator Code
              </label>
              <input
                required
                autoFocus
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  letterSpacing: '0.35em',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
                placeholder="000000"
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gold-400)',
                color: 'var(--on-gold)',
                fontWeight: 700,
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
                opacity: loading || code.length !== 6 ? 0.7 : 1,
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ash-400)',
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              Sign out / use a different account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
