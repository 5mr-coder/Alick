import ContactClient from '@/components/contact/ContactClient';
import { getPublicSiteSettings } from '@/lib/db/queries';

export const revalidate = 60;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ service }, settings] = await Promise.all([
    searchParams,
    getPublicSiteSettings(),
  ]);

  return (
    <ContactClient
      settings={settings}
      initialServiceSlug={typeof service === 'string' ? service : ''}
    />
  );
}
