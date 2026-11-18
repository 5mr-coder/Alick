'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types';
import { updateOrderAction } from '@/lib/actions/orders';
import { formatNaira } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function OrdersManager({
  initialOrders,
  initialFilter = 'all',
}: {
  initialOrders: Order[];
  initialFilter?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialOrders.map((o) => [o.id, o.tracking_code ?? ''])
      )
  );
  const [fulfillmentDrafts, setFulfillmentDrafts] = useState<
    Record<string, Order['fulfillment_status']>
  >(() =>
    Object.fromEntries(initialOrders.map((o) => [o.id, o.fulfillment_status]))
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = initialOrders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'requires_review') return o.requires_review;
    return o.payment_status === filter;
  });

  const handleUpdate = async (
    orderId: string,
    patch: Parameters<typeof updateOrderAction>[0]
  ) => {
    setBusyId(orderId);
    setFeedback(null);
    const res = await updateOrderAction(patch);
    setBusyId(null);
    if (!res.ok) {
      setFeedback(res.error || 'Order update failed.');
      return;
    }
    setFeedback('Order updated.');
    router.refresh();
  };

  const handleReverifyPaystack = async (order: Order) => {
    if (!order.payment_reference) {
      setFeedback('This order has no payment reference to verify.');
      return;
    }
    setBusyId(order.id);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/checkout/verify?reference=${encodeURIComponent(
          order.payment_reference
        )}`,
        { cache: 'no-store' }
      );
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) {
        setFeedback(data.error || 'Paystack verification failed.');
      } else {
        setFeedback(
          `Paystack verify for ${order.order_number}: ${data.status || 'checked'}`
        );
      }
      router.refresh();
    } catch {
      setFeedback('Network error verifying with Paystack.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="section-label">Fulfillment & Payments</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Orders ({initialOrders.length})
        </h1>
      </div>

      <div
        style={{
          background: 'rgba(245, 200, 66, 0.08)',
          border: '1px solid var(--border-gold)',
          borderRadius: '10px',
          padding: '0.85rem 1.1rem',
          fontSize: '0.85rem',
          color: 'var(--ash-200)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <AlertTriangle size={18} color="var(--gold-400)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Inventory Note:</strong> Manually resolving{' '}
          <code>paid_needs_review → paid</code> does <strong>not</strong>{' '}
          automatically decrement stock. Always verify and adjust product{' '}
          <code>stock_quantity</code> manually in Products.
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'paid_needs_review', label: 'Paid Needs Review' },
          { key: 'requires_review', label: 'High-Value Review' },
          { key: 'pending', label: 'Pending' },
          { key: 'paid', label: 'Paid' },
          { key: 'failed', label: 'Failed' },
          { key: 'refunded', label: 'Refunded' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: `1px solid ${
                filter === tab.key ? 'var(--gold-400)' : 'var(--border)'
              }`,
              background:
                filter === tab.key ? 'rgba(245,200,66,0.14)' : 'var(--surface)',
              color:
                filter === tab.key ? 'var(--gold-400)' : 'var(--ash-300)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-gold)',
            background: 'var(--surface)',
            color: 'var(--gold-400)',
            fontSize: '0.875rem',
          }}
        >
          {feedback}
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--ash-400)' }}>
          No orders match this filter.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((order) => {
            const isBusy = busyId === order.id;
            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${
                    order.payment_status === 'paid_needs_review'
                      ? 'var(--danger)'
                      : order.requires_review
                        ? 'var(--border-gold)'
                        : 'var(--border)'
                  }`,
                  borderRadius: '14px',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong
                        style={{ color: 'var(--gold-400)', fontSize: '1.05rem' }}
                      >
                        {order.order_number}
                      </strong>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'rgba(34,211,238,0.12)',
                          color: 'var(--cyan-400)',
                        }}
                      >
                        {order.payment_status}
                      </span>
                      {order.requires_review && (
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(245,200,66,0.16)',
                            color: 'var(--gold-400)',
                          }}
                        >
                          High-Value Review Needed
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--ash-400)',
                        marginTop: '0.25rem',
                      }}
                    >
                      {new Date(order.created_at).toLocaleString()} · Mode:{' '}
                      {order.sales_mode} · Zone: {order.shipping_zone}
                      {order.payment_reference
                        ? ` · Ref: ${order.payment_reference}`
                        : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--heading)',
                      }}
                    >
                      {formatNaira(order.total_amount)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                      Subtotal {formatNaira(order.subtotal)} + Shipping{' '}
                      {formatNaira(order.shipping_fee)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--ash-400)', fontSize: '0.75rem' }}>
                      Customer
                    </div>
                    <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                    <div style={{ color: 'var(--ash-300)' }}>
                      {order.customer_email}
                    </div>
                    <div style={{ color: 'var(--ash-300)' }}>
                      {order.customer_phone}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--ash-400)', fontSize: '0.75rem' }}>
                      Shipping Address
                    </div>
                    <div style={{ color: 'var(--ash-200)' }}>
                      {Object.values(order.shipping_address || {})
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </div>
                    {order.notes && (
                      <div
                        style={{
                          color: 'var(--gold-400)',
                          marginTop: '0.35rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        Note: {order.notes}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ash-400)', fontSize: '0.75rem' }}>
                      Items
                    </div>
                    {(order.items ?? []).map((it) => (
                      <div key={it.id} style={{ color: 'var(--ash-200)' }}>
                        {it.quantity}× {it.product_name} (
                        {formatNaira(it.unit_price)})
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <select
                    value={fulfillmentDrafts[order.id] ?? order.fulfillment_status}
                    onChange={(e) =>
                      setFulfillmentDrafts((prev) => ({
                        ...prev,
                        [order.id]: e.target
                          .value as Order['fulfillment_status'],
                      }))
                    }
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      background: 'var(--ash-900)',
                      border: '1px solid var(--border)',
                      color: 'var(--heading)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>

                  <input
                    placeholder="Tracking code..."
                    value={trackingDrafts[order.id] ?? ''}
                    onChange={(e) =>
                      setTrackingDrafts((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      background: 'var(--ash-900)',
                      border: '1px solid var(--border)',
                      color: 'var(--heading)',
                      fontSize: '0.825rem',
                      minWidth: '180px',
                    }}
                  />

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      handleUpdate(order.id, {
                        orderId: order.id,
                        fulfillmentStatus: fulfillmentDrafts[order.id],
                        trackingCode: trackingDrafts[order.id] ?? '',
                      })
                    }
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--gold-400)',
                      color: 'var(--on-gold)',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                    }}
                  >
                    Save Fulfillment
                  </button>

                  {order.requires_review && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleUpdate(order.id, {
                          orderId: order.id,
                          requiresReview: false,
                        })
                      }
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-gold)',
                        background: 'rgba(245,200,66,0.1)',
                        color: 'var(--gold-400)',
                        fontWeight: 600,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Approve High-Value Dispatch
                    </button>
                  )}

                  {order.payment_status === 'pending' &&
                    order.payment_reference && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleReverifyPaystack(order)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          border: '1px solid var(--cyan-glow)',
                          background: 'rgba(34,211,238,0.1)',
                          color: 'var(--cyan-400)',
                          fontWeight: 600,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <RefreshCw size={14} /> Re-verify with Paystack
                      </button>
                    )}

                  {order.payment_status === 'pending' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleUpdate(order.id, {
                          orderId: order.id,
                          paymentStatus: 'failed',
                        })
                      }
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(248,113,113,0.4)',
                        background: 'transparent',
                        color: 'var(--danger)',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Mark Failed
                    </button>
                  )}

                  {order.payment_status === 'paid_needs_review' && (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          if (
                            !confirm(
                              'Confirm resolving paid_needs_review -> paid? Remember to update product stock_quantity manually in Products.'
                            )
                          ) {
                            return;
                          }
                          handleUpdate(order.id, {
                            orderId: order.id,
                            paymentStatus: 'paid',
                          });
                        }}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #22c55e',
                          background: 'rgba(34,197,94,0.14)',
                          color: '#4ade80',
                          fontWeight: 600,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                        }}
                      >
                        Resolve as Paid (Manual Stock)
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleUpdate(order.id, {
                            orderId: order.id,
                            paymentStatus: 'refunded',
                          })
                        }
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(248,113,113,0.4)',
                          background: 'transparent',
                          color: 'var(--danger)',
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                        }}
                      >
                        Mark Refunded
                      </button>
                    </>
                  )}

                  {order.payment_status === 'paid' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        if (!confirm(`Mark ${order.order_number} as refunded?`)) {
                          return;
                        }
                        handleUpdate(order.id, {
                          orderId: order.id,
                          paymentStatus: 'refunded',
                        });
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(248,113,113,0.4)',
                        background: 'transparent',
                        color: 'var(--danger)',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Mark Refunded
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
