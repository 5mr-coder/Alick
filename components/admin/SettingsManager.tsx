'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminSiteSettings } from '@/types';
import { saveSettingsAction } from '@/lib/actions/settings';
import { koboToNaira, nairaToKobo } from '@/lib/utils';
import {
  adminHelperStyle,
  adminInputStyle,
  adminLabelStyle,
  NairaPriceField,
} from '@/components/admin/AdminHelpers';

export default function SettingsManager({
  initialSettings,
}: {
  initialSettings: AdminSiteSettings;
}) {
  const router = useRouter();
  const initialSocial = initialSettings.social_links ?? {};

  const [form, setForm] = useState({
    siteName: initialSettings.site_name,
    tagline: initialSettings.tagline,
    phone: initialSettings.phone,
    email: initialSettings.email,
    address: initialSettings.address,
    whatsappNumber: initialSettings.whatsapp_number,
    whatsappLink: initialSocial.whatsapp ?? '',
    instagramUrl: initialSocial.instagram ?? '',
    facebookUrl: initialSocial.facebook ?? '',
    twitterUrl: initialSocial.twitter ?? initialSocial.x ?? '',
    ikejaPickupNaira: String(
      koboToNaira(initialSettings.shipping_rates.ikeja_pickup)
    ),
    lagosDeliveryNaira: String(
      koboToNaira(initialSettings.shipping_rates.lagos_delivery)
    ),
    interstateDeliveryNaira: String(
      koboToNaira(initialSettings.shipping_rates.interstate_delivery)
    ),
    highValueThresholdNaira: String(
      koboToNaira(initialSettings.high_value_threshold)
    ),
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const socialLinks: Record<string, string> = { ...initialSocial };
    if (form.whatsappLink.trim()) socialLinks.whatsapp = form.whatsappLink.trim();
    else delete socialLinks.whatsapp;

    if (form.instagramUrl.trim()) socialLinks.instagram = form.instagramUrl.trim();
    else delete socialLinks.instagram;

    if (form.facebookUrl.trim()) socialLinks.facebook = form.facebookUrl.trim();
    else delete socialLinks.facebook;

    if (form.twitterUrl.trim()) socialLinks.twitter = form.twitterUrl.trim();
    else delete socialLinks.twitter;

    const res = await saveSettingsAction({
      siteName: form.siteName,
      tagline: form.tagline,
      phone: form.phone,
      email: form.email,
      address: form.address,
      whatsappNumber: form.whatsappNumber,
      socialLinks,
      shippingRatesKobo: {
        ikeja_pickup: nairaToKobo(Number(form.ikejaPickupNaira) || 0),
        lagos_delivery: nairaToKobo(Number(form.lagosDeliveryNaira) || 0),
        interstate_delivery: nairaToKobo(
          Number(form.interstateDeliveryNaira) || 0
        ),
      },
      highValueThresholdKobo: nairaToKobo(
        Number(form.highValueThresholdNaira) || 0
      ),
    });

    setSaving(false);
    setFeedback({
      ok: res.ok,
      text: res.ok
        ? 'Store settings saved and updated on the storefront.'
        : res.error || 'Could not update settings.',
    });
    if (res.ok) router.refresh();
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '880px' }}>
      <div>
        <div className="section-label">Configuration</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Store Settings
        </h1>
        <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Update your contact details, delivery fees, and order security limit. Changes take effect immediately.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: `1px solid ${
              feedback.ok ? 'var(--border-gold)' : 'rgba(248,113,113,0.45)'
            }`,
            background: 'var(--surface)',
            color: feedback.ok ? 'var(--gold-400)' : 'var(--danger)',
            fontSize: '0.875rem',
          }}
        >
          {feedback.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <section style={cardStyle}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--heading)' }}>
              1. Business &amp; WhatsApp Contact
            </h2>
            <p style={adminHelperStyle}>
              Shown in your website header, footer, Contact page, and WhatsApp order links.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={adminLabelStyle}>Store Name *</label>
              <input
                required
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                style={adminInputStyle}
              />
            </div>

            <div>
              <label style={adminLabelStyle}>Store Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                style={adminInputStyle}
              />
            </div>

            <div>
              <label style={adminLabelStyle}>Customer Phone Line *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={adminInputStyle}
              />
            </div>

            <div>
              <label style={adminLabelStyle}>Customer Support Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={adminInputStyle}
              />
            </div>

            <div>
              <label style={adminLabelStyle}>WhatsApp Order Number *</label>
              <input
                required
                value={form.whatsappNumber}
                placeholder="e.g. 2348030000000"
                onChange={(e) =>
                  setForm({ ...form, whatsappNumber: e.target.value })
                }
                style={adminInputStyle}
              />
              <div style={adminHelperStyle}>
                Include country code without &quot;+&quot; (e.g. 234803...) so WhatsApp checkout links work.
              </div>
            </div>

            <div>
              <label style={adminLabelStyle}>Physical Shop / Pickup Address *</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={adminInputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>
              <label style={adminLabelStyle}>WhatsApp Direct Link (optional)</label>
              <input
                type="url"
                value={form.whatsappLink}
                placeholder="https://wa.me/234..."
                onChange={(e) =>
                  setForm({ ...form, whatsappLink: e.target.value })
                }
                style={adminInputStyle}
              />
            </div>
            <div>
              <label style={adminLabelStyle}>Instagram Page URL (optional)</label>
              <input
                type="url"
                value={form.instagramUrl}
                placeholder="https://instagram.com/..."
                onChange={(e) =>
                  setForm({ ...form, instagramUrl: e.target.value })
                }
                style={adminInputStyle}
              />
            </div>
            <div>
              <label style={adminLabelStyle}>Facebook Page URL (optional)</label>
              <input
                type="url"
                value={form.facebookUrl}
                placeholder="https://facebook.com/..."
                onChange={(e) =>
                  setForm({ ...form, facebookUrl: e.target.value })
                }
                style={adminInputStyle}
              />
            </div>
            <div>
              <label style={adminLabelStyle}>X / Twitter Profile URL (optional)</label>
              <input
                type="url"
                value={form.twitterUrl}
                placeholder="https://x.com/..."
                onChange={(e) =>
                  setForm({ ...form, twitterUrl: e.target.value })
                }
                style={adminInputStyle}
              />
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--heading)' }}>
              2. Delivery Zone Fees
            </h2>
            <p style={adminHelperStyle}>
              Checkout calculates delivery fees automatically from these rates. Set to 0 for free pickup.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <NairaPriceField
              label="Ikeja Store Pickup (₦)"
              required
              value={form.ikejaPickupNaira}
              onChange={(val) => setForm({ ...form, ikejaPickupNaira: val })}
              helper="Set to 0 for free in-store pickup."
            />

            <NairaPriceField
              label="Lagos Dispatch Delivery (₦)"
              required
              value={form.lagosDeliveryNaira}
              onChange={(val) => setForm({ ...form, lagosDeliveryNaira: val })}
              helper="Same-day or next-day courier across Lagos."
            />

            <NairaPriceField
              label="Interstate Delivery (₦)"
              required
              value={form.interstateDeliveryNaira}
              onChange={(val) =>
                setForm({ ...form, interstateDeliveryNaira: val })
              }
              helper="Nationwide waybill / courier outside Lagos."
            />
          </div>
        </section>

        <section style={cardStyle}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--heading)' }}>
              3. Order Security Threshold
            </h2>
            <p style={adminHelperStyle}>
              Orders equal to or above this amount are automatically flagged as{' '}
              <strong>High-Value Approval</strong> so a manager can double-check payment and buyer ID before dispatch.
            </p>
          </div>

          <div style={{ maxWidth: '340px' }}>
            <NairaPriceField
              label="High-Value Review Limit (₦)"
              required
              value={form.highValueThresholdNaira}
              onChange={(val) =>
                setForm({ ...form, highValueThresholdNaira: val })
              }
              helper="Example: ₦500,000 flags orders ₦500,000+ for manual dispatch approval."
            />
          </div>
        </section>

        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.85rem 1.65rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gold-400)',
              color: 'var(--on-gold)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            {saving ? 'Saving Settings...' : 'Save All Store Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
