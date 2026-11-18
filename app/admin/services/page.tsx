import ServicesManager from '@/components/admin/ServicesManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import type { ServiceRow } from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const { supabase } = await requireAdminPage('/admin/services');

  const { data } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });

  return <ServicesManager initialServices={(data ?? []) as ServiceRow[]} />;
}
