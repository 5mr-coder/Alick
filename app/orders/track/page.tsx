'use client';

import { useState } from 'react';
import { formatNaira } from '@/lib/utils';

type TrackedOrder = {
  order_number: string;
  payment_status: string;
  fulfillment_status: string;
  tracking_code: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = (await res.json()) as {
        order?: TrackedOrder;
        error?: string;
      };

      if (!res.ok || !data.order) {
        setError(data.error || 'No matching order found.');
        return;
      }

      setOrder(data.order);
    } catch {
      setError('Network error looking up your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        background: 'var(--ash-950)',
        padding: '4rem 1.25rem',
      }}
    >
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="section-label">Order Status</div>
        <h1 className="section-heading" style={{ marginBottom: '0.75rem' }}>
          Track Your Order
        </h1>
        <p style={{ color: 'var(--ash-400)', marginBottom: '2rem' }}>
          Enter your order number (e.g. ALK-...) and the email address used at
          checkout.
        </p>

        <form
          onSubmit={handleTrack}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
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
              Order Number *
            </label>
            <input
              required
              placeholder="ALK-XXXXXXXXXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'var(--ash-900)',
                border: '1px solid var(--border)',
                color: 'var(--heading)',
                textTransform: 'uppercase',
              }}
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
              Checkout Email *
            </label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'var(--ash-900)',
                border: '1px solid var(--border)',
                color: 'var(--heading)',
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
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
            }}
          >
            {loading ? 'Searching...' : 'Look Up Order'}
          </button>
        </form>

        {order && (
          <div
            style={{
              marginTop: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border-gold)',
              borderRadius: '14px',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                  Order Number
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--gold-400)',
                  }}
                >
                  {order.order_number}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                  Placed On
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--heading)' }}>
                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                  Payment Status
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--cyan-400)',
                    textTransform: 'capitalize',
                  }}
                >
                  {order.payment_status.replace(/_/g, ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                  Fulfillment
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--heading)',
                    textTransform: 'capitalize',
                  }}
                >
                  {order.fulfillment_status}
                </div>
              </div>
              {order.tracking_code && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                    Tracking Code
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--gold-400)' }}>
                    {order.tracking_code}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {order.items.map((item, idx) => (
                <div
                  key={`${item.product_name}-${idx}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ color: 'var(--ash-300)' }}>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span style={{ color: 'var(--heading)', fontWeight: 600 }}>
                    {formatNaira(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed var(--border)',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: 'var(--heading)' }}>Total</span>
                <span style={{ color: 'var(--gold-400)', fontSize: '1.1rem' }}>
                  {formatNaira(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
