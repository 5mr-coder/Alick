import Link from 'next/link';
import {
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  Star,
  Package,
} from 'lucide-react';
import { requireAdminPage } from '@/lib/auth/require-admin';
import { formatNaira } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const PAYMENT_STATUS_LABELS: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  paid: {
    label: 'Paid & Confirmed',
    bg: 'rgba(34,197,94,0.15)',
    color: '#4ade80',
  },
  pending: {
    label: 'Awaiting Payment',
    bg: 'rgba(245,200,66,0.14)',
    color: 'var(--gold-400)',
  },
  paid_needs_review: {
    label: 'Paid — Stock Check Required',
    bg: 'rgba(248,113,113,0.18)',
    color: 'var(--danger)',
  },
  failed: {
    label: 'Payment Failed',
    bg: 'rgba(248,113,113,0.1)',
    color: 'var(--danger)',
  },
  refunded: {
    label: 'Refunded',
    bg: 'rgba(157,176,210,0.14)',
    color: 'var(--ash-300)',
  },
};

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdminPage('/admin');

  const [
    productsRes,
    flashSalesRes,
    ordersRes,
    pendingReviewsRes,
    unresolvedMessagesRes,
  ] = await Promise.all([
    supabase.from('products').select('id, stock_quantity, is_active'),
    supabase
      .from('flash_sales')
      .select('id')
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString()),
    supabase
      .from('orders')
      .select(
        'id, order_number, customer_name, total_amount, payment_status, fulfillment_status, requires_review, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', false),
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_resolved', false),
  ]);

  const products = productsRes.data ?? [];
  const activeFlashSales = flashSalesRes.data?.length ?? 0;
  const orders = ordersRes.data ?? [];
  const pendingReviews = pendingReviewsRes.count ?? 0;
  const unresolvedMessages = unresolvedMessagesRes.count ?? 0;

  const paidNeedsReviewOrders = orders.filter(
    (o) => o.payment_status === 'paid_needs_review'
  );
  const highValueReviewOrders = orders.filter(
    (o) =>
      o.requires_review &&
      o.fulfillment_status !== 'delivered' &&
      o.fulfillment_status !== 'cancelled'
  );
  const paidRevenueKobo = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((acc, o) => acc + Number(o.total_amount), 0);
  const lowStockCount = products.filter(
    (p) => p.is_active && Number(p.stock_quantity) < 5
  ).length;
  const liveProductsCount = products.filter((p) => p.is_active).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div className="section-label">Dashboard</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Store Overview
        </h1>
        <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Quick summary of your orders, stock levels, and customer messages.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {paidNeedsReviewOrders.length > 0 && (
          <div
            style={{
              background: 'rgba(248, 113, 113, 0.12)',
              border: '1px solid var(--danger)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={22} color="var(--danger)" />
              <div>
                <strong style={{ color: 'var(--heading)', display: 'block' }}>
                  {paidNeedsReviewOrders.length} order
                  {paidNeedsReviewOrders.length === 1 ? '' : 's'} marked
                  &ldquo;Paid — Stock Check Required&rdquo;
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--ash-300)' }}>
                  Customer paid, but stock or order window needs a manual check
                  before shipping.
                </span>
              </div>
            </div>
            <Link
              href="/admin/orders?filter=paid_needs_review"
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: 'var(--danger)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              Check Orders
            </Link>
          </div>
        )}

        {highValueReviewOrders.length > 0 && (
          <div
            style={{
              background: 'rgba(245, 200, 66, 0.1)',
              border: '1px solid var(--border-gold)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={22} color="var(--gold-400)" />
              <div>
                <strong style={{ color: 'var(--heading)', display: 'block' }}>
                  {highValueReviewOrders.length} high-value order
                  {highValueReviewOrders.length === 1 ? '' : 's'} waiting for
                  dispatch approval
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--ash-300)' }}>
                  Verify customer and payment details, then click &ldquo;Approve
                  for Dispatch&rdquo;.
                </span>
              </div>
            </div>
            <Link
              href="/admin/orders?filter=requires_review"
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: 'var(--gold-400)',
                color: 'var(--on-gold)',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              Approve Orders
            </Link>
          </div>
        )}

        {unresolvedMessages > 0 && (
          <div
            style={{
              background: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid var(--cyan-glow)',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageSquare size={20} color="var(--cyan-400)" />
              <span style={{ color: 'var(--heading)', fontSize: '0.9rem' }}>
                <strong>{unresolvedMessages}</strong> customer message
                {unresolvedMessages === 1 ? '' : 's'} waiting for a reply
              </span>
            </div>
            <Link
              href="/admin/reviews?tab=messages"
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                background: 'var(--cyan-400)',
                color: 'var(--on-cyan)',
                fontWeight: 700,
                fontSize: '0.825rem',
                textDecoration: 'none',
              }}
            >
              Open Inbox
            </Link>
          </div>
        )}

        {pendingReviews > 0 && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-gold)',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Star size={20} color="var(--gold-400)" />
              <span style={{ color: 'var(--heading)', fontSize: '0.9rem' }}>
                <strong>{pendingReviews}</strong> customer review
                {pendingReviews === 1 ? '' : 's'} waiting for approval
              </span>
            </div>
            <Link
              href="/admin/reviews?tab=reviews"
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold-400)',
                fontWeight: 600,
                fontSize: '0.825rem',
                textDecoration: 'none',
              }}
            >
              Review Feedback
            </Link>
          </div>
        )}

        {lowStockCount > 0 && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Package size={20} color="var(--gold-400)" />
              <span style={{ color: 'var(--heading)', fontSize: '0.9rem' }}>
                <strong>{lowStockCount}</strong> live product
                {lowStockCount === 1 ? ' is' : 's are'} running low on stock
                (under 5 units)
              </span>
            </div>
            <Link
              href="/admin/products"
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                color: 'var(--heading)',
                fontWeight: 600,
                fontSize: '0.825rem',
                textDecoration: 'none',
              }}
            >
              Restock Products
            </Link>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          {
            label: 'Confirmed Sales (Recent 50)',
            value: formatNaira(paidRevenueKobo),
            href: '/admin/orders',
          },
          {
            label: 'Live Products',
            value: `${liveProductsCount} (${lowStockCount} low stock)`,
            href: '/admin/products',
          },
          {
            label: 'Running Flash Deals',
            value: String(activeFlashSales),
            href: '/admin/flash-sales',
          },
          {
            label: 'Reviews & Inbox Waiting',
            value: `${pendingReviews} reviews · ${unresolvedMessages} msgs`,
            href: '/admin/reviews',
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              textDecoration: 'none',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--ash-400)' }}>
              {card.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--gold-400)',
                marginTop: '0.35rem',
              }}
            >
              {card.value}
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--heading)',
            }}
          >
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            style={{
              color: 'var(--gold-400)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Manage all orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem' }}>
            No orders yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: 'left',
                    color: 'var(--ash-400)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <th style={{ padding: '0.6rem' }}>Order #</th>
                  <th style={{ padding: '0.6rem' }}>Customer</th>
                  <th style={{ padding: '0.6rem' }}>Total</th>
                  <th style={{ padding: '0.6rem' }}>Payment</th>
                  <th style={{ padding: '0.6rem' }}>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => {
                  const statusMeta = PAYMENT_STATUS_LABELS[
                    order.payment_status
                  ] ?? {
                    label: order.payment_status,
                    bg: 'rgba(157,176,210,0.14)',
                    color: 'var(--ash-300)',
                  };
                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td
                        style={{
                          padding: '0.7rem 0.6rem',
                          fontWeight: 600,
                          color: 'var(--gold-400)',
                        }}
                      >
                        {order.order_number}
                      </td>
                      <td style={{ padding: '0.7rem 0.6rem' }}>
                        {order.customer_name}
                      </td>
                      <td style={{ padding: '0.7rem 0.6rem' }}>
                        {formatNaira(Number(order.total_amount))}
                      </td>
                      <td style={{ padding: '0.7rem 0.6rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: statusMeta.bg,
                            color: statusMeta.color,
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.7rem 0.6rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {order.fulfillment_status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
