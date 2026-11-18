'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Order } from '@/types';
import { updateOrderAction } from '@/lib/actions/orders';
import { formatNaira } from '@/lib/utils';
import { CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';

const PAYMENT_STATUS_META: Record<
  Order['payment_status'],
  { label: string; bg: string; color: string; hint: string }
> = {
  paid: {
    label: 'Paid & Confirmed',
    bg: 'rgba(34,197,94,0.16)',
    color: '#4ade80',
    hint: 'Payment verified and inventory reserved.',
  },
  pending: {
    label: 'Awaiting Payment',
    bg: 'rgba(245,200,66,0.16)',
    color: 'var(--gold-400)',
    hint: 'Customer started checkout; payment not confirmed yet.',
  },
  paid_needs_review: {
    label: 'Paid — Stock Check Required',
    bg: 'rgba(248,113,113,0.18)',
    color: 'var(--danger)',
    hint: 'Customer paid, but item stock, order window, or amount needs manual verification.',
  },
  failed: {
    label: 'Payment Failed',
    bg: 'rgba(248,113,113,0.1)',
    color: 'var(--danger)',
    hint: 'Order closed without payment.',
  },
  refunded: {
    label: 'Refunded',
    bg: 'rgba(157,176,210,0.16)',
    color: 'var(--ash-300)',
    hint: 'Order marked refunded.',
  },
};

const ZONE_LABELS: Record<string, string> = {
  ikeja_pickup: 'Ikeja Store Pickup',
  lagos_delivery: 'Lagos Delivery',
  interstate_delivery: 'Interstate Delivery',
};

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
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const filtered = initialOrders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'requires_review') return o.requires_review;
    return o.payment_status === filter;
  });

  const handleUpdate = async (
    orderId: string,
    patch: Parameters<typeof updateOrderAction>[0],
    successText = 'Order updated.'
  ) => {
    setBusyId(orderId);
    setFeedback(null);
    const res = await updateOrderAction(patch);
    setBusyId(null);
    if (!res.ok) {
      setFeedback({ ok: false, text: res.error || 'Order update failed.' });
      return;
    }
    setFeedback({ ok: true, text: successText });
    router.refresh();
  };

  const handleReverifyPaystack = async (order: Order) => {
    if (!order.payment_reference) {
      setFeedback({
        ok: false,
        text: 'This order does not have a Paystack payment reference yet.',
      });
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
        setFeedback({
          ok: false,
          text: data.error || 'Paystack check failed.',
        });
      } else {
        setFeedback({
          ok: true,
          text: `Checked ${order.order_number} with Paystack — result: ${
            data.status || 'checked'
          }`,
        });
      }
      router.refresh();
    } catch {
      setFeedback({
        ok: false,
        text: 'Network error contacting Paystack. Please try again.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="section-label">Order Desk</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Orders ({initialOrders.length})
        </h1>
        <p style={{ color: 'var(--ash-400)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Confirm payments, approve high-value orders before shipping, and
          update delivery progress with courier tracking codes.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'paid_needs_review', label: 'Stock Check Required' },
          { key: 'requires_review', label: 'High-Value Approval' },
          { key: 'pending', label: 'Awaiting Payment' },
          { key: 'paid', label: 'Paid & Confirmed' },
          { key: 'failed', label: 'Payment Failed' },
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
          role="status"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: `1px solid ${
              feedback.ok ? 'rgba(34,197,94,0.45)' : 'var(--danger)'
            }`,
            background: feedback.ok
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(248,113,113,0.08)',
            color: feedback.ok ? '#4ade80' : 'var(--danger)',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {feedback.ok && <CheckCircle2 size={17} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            borderRadius: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            textAlign: 'center',
            color: 'var(--ash-400)',
          }}
        >
          No orders in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((order) => {
            const isBusy = busyId === order.id;
            const statusMeta = PAYMENT_STATUS_META[order.payment_status];

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
                    paddingBottom: '0.85rem',
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
                        style={{ color: 'var(--gold-400)', fontSize: '1.08rem' }}
                      >
                        {order.order_number}
                      </strong>
                      <span
                        title={statusMeta.hint}
                        style={{
                          padding: '0.22rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: statusMeta.bg,
                          color: statusMeta.color,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                      {order.requires_review && (
                        <span
                          style={{
                            padding: '0.22rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: 'rgba(245,200,66,0.16)',
                            color: 'var(--gold-400)',
                            border: '1px solid var(--border-gold)',
                          }}
                        >
                          High-Value Order — Approve Before Dispatch
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--ash-400)',
                        marginTop: '0.3rem',
                      }}
                    >
                      {new Date(order.created_at).toLocaleString()} ·{' '}
                      {order.sales_mode === 'retail'
                        ? 'Bulk / Retail Order'
                        : 'Personal Order'}{' '}
                      · {ZONE_LABELS[order.shipping_zone] ?? order.shipping_zone}
                      {order.payment_reference
                        ? ` · Ref: ${order.payment_reference}`
                        : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: 'var(--heading)',
                      }}
                    >
                      {formatNaira(order.total_amount)}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--ash-400)' }}>
                      Items {formatNaira(order.subtotal)} + Delivery{' '}
                      {formatNaira(order.shipping_fee)}
                    </div>
                  </div>
                </div>

                {order.payment_status === 'paid_needs_review' && (
                  <div
                    style={{
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid var(--danger)',
                      borderRadius: '10px',
                      padding: '0.9rem 1rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <ShieldAlert
                      size={20}
                      color="var(--danger)"
                      style={{ flexShrink: 0, marginTop: '0.1rem' }}
                    />
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--ash-200)' }}>
                      <strong style={{ color: 'var(--heading)', display: 'block' }}>
                        Action Needed: Verify Stock Before Confirming
                      </strong>
                      This payment succeeded on Paystack, but an item ran out of
                      stock (or the 30-minute checkout window expired) while the
                      customer was paying.
                      <ol style={{ margin: '0.35rem 0 0 1.2rem', padding: 0 }}>
                        <li>
                          Check physical stock in the shop and update stock
                          numbers under{' '}
                          <Link
                            href="/admin/products"
                            style={{ color: 'var(--gold-400)', fontWeight: 600 }}
                          >
                            Products
                          </Link>{' '}
                          manually (confirming this order will not auto-deduct
                          stock).
                        </li>
                        <li>
                          If items are available, click{' '}
                          <strong>Confirm Payment (Stock Checked)</strong>. If
                          unavailable, refund the customer in Paystack and click{' '}
                          <strong>Mark Refunded</strong>.
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

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
                      Customer Details
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--heading)' }}>
                      {order.customer_name}
                    </div>
                    <div style={{ color: 'var(--ash-300)' }}>
                      {order.customer_email}
                    </div>
                    <div style={{ color: 'var(--ash-300)' }}>
                      {order.customer_phone}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--ash-400)', fontSize: '0.75rem' }}>
                      Delivery Address
                    </div>
                    <div style={{ color: 'var(--ash-200)' }}>
                      {Object.values(order.shipping_address || {})
                        .filter(Boolean)
                        .join(', ') || 'Store pickup'}
                    </div>
                    {order.notes && (
                      <div
                        style={{
                          color: 'var(--gold-400)',
                          marginTop: '0.35rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        Customer Note: {order.notes}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ash-400)', fontSize: '0.75rem' }}>
                      Items Ordered
                    </div>
                    {(order.items ?? []).map((it) => (
                      <div key={it.id} style={{ color: 'var(--ash-200)' }}>
                        <strong>{it.quantity}×</strong> {it.product_name} (
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
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.6rem',
                      alignItems: 'center',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--ash-400)',
                      }}
                    >
                      Delivery Progress:
                    </label>
                    <select
                      value={
                        fulfillmentDrafts[order.id] ?? order.fulfillment_status
                      }
                      onChange={(e) =>
                        setFulfillmentDrafts((prev) => ({
                          ...prev,
                          [order.id]: e.target
                            .value as Order['fulfillment_status'],
                        }))
                      }
                      style={{
                        padding: '0.48rem 0.75rem',
                        borderRadius: '8px',
                        background: 'var(--ash-900)',
                        border: '1px solid var(--border)',
                        color: 'var(--heading)',
                        fontSize: '0.825rem',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing / Packing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                      placeholder="Courier tracking code..."
                      value={trackingDrafts[order.id] ?? ''}
                      onChange={(e) =>
                        setTrackingDrafts((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                      style={{
                        padding: '0.48rem 0.75rem',
                        borderRadius: '8px',
                        background: 'var(--ash-900)',
                        border: '1px solid var(--border)',
                        color: 'var(--heading)',
                        fontSize: '0.825rem',
                        minWidth: '190px',
                      }}
                    />

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleUpdate(
                          order.id,
                          {
                            orderId: order.id,
                            fulfillmentStatus: fulfillmentDrafts[order.id],
                            trackingCode: trackingDrafts[order.id] ?? '',
                          },
                          `Saved delivery update for ${order.order_number}.`
                        )
                      }
                      style={{
                        padding: '0.5rem 0.95rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--gold-400)',
                        color: 'var(--on-gold)',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Save Delivery
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.55rem',
                      alignItems: 'center',
                    }}
                  >
                    {order.requires_review && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleUpdate(
                            order.id,
                            {
                              orderId: order.id,
                              requiresReview: false,
                            },
                            `Approved ${order.order_number} for dispatch.`
                          )
                        }
                        style={{
                          padding: '0.48rem 0.9rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-gold)',
                          background: 'rgba(245,200,66,0.12)',
                          color: 'var(--gold-400)',
                          fontWeight: 700,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                        }}
                      >
                        Approve for Dispatch
                      </button>
                    )}

                    {order.payment_status === 'pending' &&
                      order.payment_reference && (
                        <button
                          type="button"
                          disabled={isBusy}
                          title="Click this if a customer says they completed Paystack payment, but the order still shows Awaiting Payment."
                          onClick={() => handleReverifyPaystack(order)}
                          style={{
                            padding: '0.48rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid var(--cyan-glow)',
                            background: 'rgba(34,211,238,0.12)',
                            color: 'var(--cyan-400)',
                            fontWeight: 700,
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
                        onClick={() => {
                          if (
                            !confirm(
                              `Close ${order.order_number} as Payment Failed?`
                            )
                          ) {
                            return;
                          }
                          handleUpdate(
                            order.id,
                            {
                              orderId: order.id,
                              paymentStatus: 'failed',
                            },
                            `Marked ${order.order_number} as Payment Failed.`
                          );
                        }}
                        style={{
                          padding: '0.48rem 0.85rem',
                          borderRadius: '8px',
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
                                'Confirm you verified physical stock and manually updated Products stock if needed?'
                              )
                            ) {
                              return;
                            }
                            handleUpdate(
                              order.id,
                              {
                                orderId: order.id,
                                paymentStatus: 'paid',
                              },
                              `Confirmed ${order.order_number} as Paid & Confirmed.`
                            );
                          }}
                          style={{
                            padding: '0.48rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid #22c55e',
                            background: 'rgba(34,197,94,0.16)',
                            color: '#4ade80',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                          }}
                        >
                          Confirm Payment (Stock Checked)
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleUpdate(
                              order.id,
                              {
                                orderId: order.id,
                                paymentStatus: 'refunded',
                              },
                              `Marked ${order.order_number} as Refunded.`
                            )
                          }
                          style={{
                            padding: '0.48rem 0.85rem',
                            borderRadius: '8px',
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
                          if (
                            !confirm(
                              `Mark ${order.order_number} as Refunded?`
                            )
                          ) {
                            return;
                          }
                          handleUpdate(
                            order.id,
                            {
                              orderId: order.id,
                              paymentStatus: 'refunded',
                            },
                            `Marked ${order.order_number} as Refunded.`
                          );
                        }}
                        style={{
                          padding: '0.48rem 0.85rem',
                          borderRadius: '8px',
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
