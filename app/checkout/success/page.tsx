'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/utils';

type VerifyResponse = {
  status?: string;
  error?: string;
  order?: {
    order_number: string;
    payment_status: string;
    fulfillment_status: string;
    total_amount: number;
    currency: string;
  };
};

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const reference =
    searchParams.get('reference') || searchParams.get('trxref') || '';

  const [state, setState] = useState<'loading' | 'confirmed' | 'review' | 'failed'>(
    reference ? 'loading' : 'failed'
  );
  const [order, setOrder] = useState<VerifyResponse['order'] | null>(null);
  const [message, setMessage] = useState<string>(
    reference
      ? 'Verifying your payment with Paystack...'
      : 'Missing payment reference. If you paid, track your order below.'
  );
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!reference) {
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(
          `/api/checkout/verify?reference=${encodeURIComponent(reference)}`,
          { cache: 'no-store' }
        );
        const data = (await res.json()) as VerifyResponse;

        if (cancelled) return;

        if (!res.ok) {
          setState('failed');
          setMessage(
            data.error ||
              'Could not verify payment right now. Please check your order status.'
          );
          return;
        }

        if (data.order) setOrder(data.order);

        const confirmedPaid =
          data.status === 'paid' ||
          data.status === 'already_paid' ||
          data.order?.payment_status === 'paid';
        const needsReview =
          data.status === 'paid_needs_review' ||
          data.order?.payment_status === 'paid_needs_review';

        if (confirmedPaid || needsReview) {
          if (!clearedRef.current) {
            clearCart();
            clearedRef.current = true;
          }
          if (needsReview) {
            setState('review');
            setMessage(
              'Your payment was received and flagged for quick manual confirmation by our team.'
            );
          } else {
            setState('confirmed');
            setMessage('Payment confirmed! Your order is now being processed.');
          }
        } else {
          setState('failed');
          setMessage(
            `Payment status: ${data.status || 'unconfirmed'}. Your cart has not been cleared.`
          );
        }
      } catch {
        if (!cancelled) {
          setState('failed');
          setMessage(
            'Network error verifying payment. Please refresh or track your order.'
          );
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [reference, clearCart]);

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'grid',
        placeItems: 'center',
        padding: '4rem 1.25rem',
        background: 'var(--ash-950)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}
      >
        {state === 'loading' && (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--gold-400)',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--heading)',
                marginBottom: '0.75rem',
              }}
            >
              Confirming Payment
            </h1>
            <p style={{ color: 'var(--ash-400)' }}>{message}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {(state === 'confirmed' || state === 'review') && (
          <>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background:
                  state === 'confirmed'
                    ? 'rgba(34, 197, 94, 0.14)'
                    : 'rgba(245, 200, 66, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.75rem',
              }}
            >
              {state === 'confirmed' ? (
                <Check size={28} color="#4ade80" aria-hidden="true" />
              ) : (
                <AlertTriangle size={28} color="var(--gold-400)" aria-hidden="true" />
              )}
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                color: 'var(--heading)',
                marginBottom: '0.75rem',
              }}
            >
              {state === 'confirmed' ? 'Order Confirmed!' : 'Payment Received'}
            </h1>
            <p
              style={{
                color: 'var(--ash-300)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              {message}
            </p>
            {order && (
              <div
                style={{
                  background: 'var(--ash-900)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  textAlign: 'left',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ash-400)' }}>Order Number</span>
                  <strong style={{ color: 'var(--gold-400)' }}>
                    {order.order_number}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ash-400)' }}>Total Paid</span>
                  <strong style={{ color: 'var(--heading)' }}>
                    {formatNaira(order.total_amount)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ash-400)' }}>Status</span>
                  <span style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/orders/track"
                style={{
                  padding: '0.8rem 1.4rem',
                  borderRadius: '8px',
                  background: 'var(--gold-400)',
                  color: 'var(--on-gold)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Track Order
              </Link>
              <Link
                href="/products"
                style={{
                  padding: '0.8rem 1.4rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  color: 'var(--heading)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {state === 'failed' && (
          <>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--heading)',
                marginBottom: '0.75rem',
              }}
            >
              Verification Incomplete
            </h1>
            <p
              style={{
                color: 'var(--ash-300)',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
              }}
            >
              {message}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/checkout"
                style={{
                  padding: '0.8rem 1.4rem',
                  borderRadius: '8px',
                  background: 'var(--gold-400)',
                  color: 'var(--on-gold)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Return to Checkout
              </Link>
              <Link
                href="/orders/track"
                style={{
                  padding: '0.8rem 1.4rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  color: 'var(--heading)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Track Order
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '75vh', background: 'var(--ash-950)' }} />
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  );
}
