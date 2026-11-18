import SettingsManager from '@/components/admin/SettingsManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import {
  mapAdminSiteSettingsRow,
  type AdminSiteSettingsRow,
} from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdminPage('/admin/settings');

  const { data } = await supabase
    .from('site_settings')
    .select(
      'id, site_name, tagline, phone, email, address, whatsapp_number, social_links, shipping_rates, high_value_threshold, updated_at'
    )
    .eq('id', true)
    .single();

  const mapped = mapAdminSiteSettingsRow(data as AdminSiteSettingsRow);

  return <SettingsManager initialSettings={mapped} />;
}
