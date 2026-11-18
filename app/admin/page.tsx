import Link from 'next/link';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { requireAdminPage } from '@/lib/auth/require-admin';
import { formatNaira } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div className="section-label">Dashboard</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Store Overview
        </h1>
      </div>

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
                {paidNeedsReviewOrders.length === 1 ? '' : 's'} flagged{' '}
                <code>paid_needs_review</code>
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--ash-300)' }}>
                Requires manual verification (amount/reference mismatch, expired
                window, or low stock at payment time).
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
            Review Now
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
                {highValueReviewOrders.length === 1 ? '' : 's'} awaiting dispatch
                approval
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--ash-300)' }}>
                Orders above your high-value threshold are marked{' '}
                <code>requires_review</code> until approved.
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
            Inspect Orders
          </Link>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          {
            label: 'Paid Revenue (Recent 50)',
            value: formatNaira(paidRevenueKobo),
            href: '/admin/orders',
          },
          {
            label: 'Active Products',
            value: `${products.filter((p) => p.is_active).length} (${lowStockCount} low stock)`,
            href: '/admin/products',
          },
          {
            label: 'Active Flash Sales',
            value: String(activeFlashSales),
            href: '/admin/flash-sales',
          },
          {
            label: 'Pending Moderation',
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
                fontSize: '1.45rem',
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
            View all →
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
                  <th style={{ padding: '0.6rem' }}>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
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
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background:
                            order.payment_status === 'paid'
                              ? 'rgba(34,197,94,0.15)'
                              : order.payment_status === 'paid_needs_review'
                                ? 'rgba(248,113,113,0.18)'
                                : 'rgba(245,200,66,0.14)',
                          color:
                            order.payment_status === 'paid'
                              ? '#4ade80'
                              : order.payment_status === 'paid_needs_review'
                                ? 'var(--danger)'
                                : 'var(--gold-400)',
                        }}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.6rem' }}>
                      {order.fulfillment_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
