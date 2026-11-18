import OrdersManager from '@/components/admin/OrdersManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import { mapOrderRow, type OrderRow } from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const [{ filter }, { supabase }] = await Promise.all([
    searchParams,
    requireAdminPage('/admin/orders'),
  ]);

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(100);

  const orders = ((data ?? []) as OrderRow[]).map(mapOrderRow);

  return (
    <OrdersManager
      initialOrders={orders}
      initialFilter={typeof filter === 'string' ? filter : 'all'}
    />
  );
}
