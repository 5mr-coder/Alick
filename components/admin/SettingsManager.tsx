'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminSiteSettings } from '@/types';
import { saveSettingsAction } from '@/lib/actions/settings';
import { koboToNaira, nairaToKobo } from '@/lib/utils';

export default function SettingsManager({
  initialSettings,
}: {
  initialSettings: AdminSiteSettings;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    siteName: initialSettings.site_name,
    tagline: initialSettings.tagline,
    phone: initialSettings.phone,
    email: initialSettings.email,
    address: initialSettings.address,
    whatsappNumber: initialSettings.whatsapp_number,
    socialLinksJson: JSON.stringify(initialSettings.social_links ?? {}, null, 2),
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
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const parsedSocial: Record<string, string> = {};
    try {
      const raw = JSON.parse(form.socialLinksJson || '{}') as Record<
        string,
        unknown
      >;
      for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'string') parsedSocial[k] = v;
      }
    } catch {
      setSaving(false);
      setFeedback('Social links must be valid JSON.');
      return;
    }

    const res = await saveSettingsAction({
      siteName: form.siteName,
      tagline: form.tagline,
      phone: form.phone,
      email: form.email,
      address: form.address,
      whatsappNumber: form.whatsappNumber,
      socialLinks: parsedSocial,
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
    setFeedback(
      res.ok ? 'Settings updated.' : res.error || 'Failed to update settings.'
    );
    if (res.ok) router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    borderRadius: '8px',
    background: 'var(--ash-900)',
    border: '1px solid var(--border)',
    color: 'var(--heading)',
    fontSize: '0.875rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div className="section-label">Configuration</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Site Settings
        </h1>
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

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxWidth: '820px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Site Name *
            </label>
            <input
              required
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Tagline
            </label>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Public Phone *
            </label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Public Email *
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              WhatsApp Number *
            </label>
            <input
              required
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm({ ...form, whatsappNumber: e.target.value })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              High-Value Review Threshold (₦ Naira) *
            </label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.highValueThresholdNaira}
              onChange={(e) =>
                setForm({ ...form, highValueThresholdNaira: e.target.value })
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Store Address *
          </label>
          <input
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--heading)',
              marginBottom: '0.65rem',
            }}
          >
            Shipping Zone Rates (₦ Naira — stored as kobo in Postgres)
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Ikeja Pickup (₦)
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.ikejaPickupNaira}
                onChange={(e) =>
                  setForm({ ...form, ikejaPickupNaira: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Lagos Delivery (₦)
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.lagosDeliveryNaira}
                onChange={(e) =>
                  setForm({ ...form, lagosDeliveryNaira: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Interstate Delivery (₦)
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.interstateDeliveryNaira}
                onChange={(e) =>
                  setForm({ ...form, interstateDeliveryNaira: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Social Links JSON
          </label>
          <textarea
            rows={4}
            value={form.socialLinksJson}
            onChange={(e) =>
              setForm({ ...form, socialLinksJson: e.target.value })
            }
            style={{ ...inputStyle, fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gold-400)',
              color: 'var(--on-gold)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
