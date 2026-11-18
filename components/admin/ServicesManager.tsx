'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import type { ServiceRow } from '@/lib/db/mappers';
import {
  deleteServiceAction,
  saveServiceAction,
} from '@/lib/actions/services';
import { formatNaira, koboToNaira, nairaToKobo, slugify } from '@/lib/utils';
import {
  adminHelperStyle,
  adminInputStyle,
  adminLabelStyle,
  NairaPriceField,
  SlugFieldToggle,
  StatusToggle,
} from '@/components/admin/AdminHelpers';

type ServiceFormState = {
  id: string;
  title: string;
  slug: string;
  description: string;
  startingPriceNaira: string;
  turnaround: string;
  features: string[];
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyService: ServiceFormState = {
  id: '',
  title: '',
  slug: '',
  description: '',
  startingPriceNaira: '',
  turnaround: '',
  features: ['Genuine diagnostic inspection', 'Transparent repair quote'],
  icon: 'wrench',
  sortOrder: '0',
  isActive: true,
};

export default function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceFormState>(emptyService);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const priceVal = form.startingPriceNaira.trim()
      ? nairaToKobo(Number(form.startingPriceNaira))
      : null;

    const cleanFeatures = form.features.map((s) => s.trim()).filter(Boolean);

    const res = await saveServiceAction({
      id: form.id || undefined,
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description,
      startingPriceKobo: priceVal,
      turnaround: form.turnaround.trim() || null,
      features: cleanFeatures,
      icon: form.icon,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback({ ok: false, text: res.error || 'Could not save service.' });
      return;
    }

    setFeedback({ ok: true, text: 'Repair service saved.' });
    setForm(emptyService);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}" from repair services?`)) return;
    const res = await deleteServiceAction(id);
    if (!res.ok) {
      setFeedback({ ok: false, text: res.error || 'Could not delete service.' });
      return;
    }
    if (form.id === id) setForm(emptyService);
    setFeedback({ ok: true, text: `"${title}" deleted.` });
    router.refresh();
  };

  const updateFeature = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="section-label">Workshop</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Repair Services ({initialServices.length})
        </h1>
        <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage the hardware repair and upgrade services shown on your storefront.
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
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
            {form.id ? `Editing: ${form.title}` : 'Add Repair Service'}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyService)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--ash-300)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + New Service Instead
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={adminLabelStyle}>Service Name *</label>
            <input
              required
              value={form.title}
              placeholder="e.g. Motherboard & Logic Board Repair"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.id ? prev.slug : slugify(e.target.value),
                }))
              }
              style={adminInputStyle}
            />
            <SlugFieldToggle
              slug={form.slug}
              onChange={(slug) => setForm({ ...form, slug })}
              prefix="/services#"
            />
          </div>

          <NairaPriceField
            label="Starting Price (₦)"
            value={form.startingPriceNaira}
            onChange={(val) => setForm({ ...form, startingPriceNaira: val })}
            placeholder="Leave empty for Custom Quote"
            helper="Optional minimum price. Leave blank to display 'Request Quote'."
          />

          <div>
            <label style={adminLabelStyle}>Estimated Completion Time</label>
            <input
              value={form.turnaround}
              onChange={(e) =>
                setForm({ ...form, turnaround: e.target.value })
              }
              placeholder="e.g. Same-day / 24 hours"
              style={adminInputStyle}
            />
            <div style={adminHelperStyle}>
              Helps customers know how fast the workshop completes this repair.
            </div>
          </div>

          <div>
            <label style={adminLabelStyle}>Card Icon</label>
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              style={adminInputStyle}
            >
              <option value="wrench">General Repair (Wrench)</option>
              <option value="laptop">Laptop & Screen</option>
              <option value="server">OS & Speed Optimization</option>
              <option value="cpu">Chips, RAM & SSD</option>
            </select>
          </div>

          <div>
            <label style={adminLabelStyle}>Display Position</label>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              style={adminInputStyle}
            />
            <div style={adminHelperStyle}>
              Lower numbers appear first on the Services page (0, 1, 2...).
            </div>
          </div>
        </div>

        <div>
          <label style={adminLabelStyle}>Service Description *</label>
          <textarea
            required
            rows={3}
            value={form.description}
            placeholder="Explain clearly what problems this service fixes..."
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={adminInputStyle}
          />
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.45rem',
            }}
          >
            <label style={{ ...adminLabelStyle, marginBottom: 0 }}>
              What&apos;s Included (Bullet Points)
            </label>
            <button
              type="button"
              onClick={addFeature}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '6px',
                border: '1px solid var(--border-gold)',
                background: 'rgba(245,200,66,0.1)',
                color: 'var(--gold-400)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={13} /> Add Bullet Point
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {form.features.map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={feat}
                  placeholder={`Bullet ${idx + 1} (e.g. 90-day repair warranty)`}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  style={adminInputStyle}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  aria-label="Remove bullet"
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(248,113,113,0.35)',
                    background: 'transparent',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <StatusToggle
          label="Visible on Storefront"
          checked={form.isActive}
          onChange={(val) => setForm({ ...form, isActive: val })}
          onText="Live"
          offText="Hidden"
          helper="Turn off to hide this service temporarily without deleting it."
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.75rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gold-400)',
              color: 'var(--on-gold)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : form.id ? 'Save Changes' : 'Save New Service'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyService)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--heading)',
                cursor: 'pointer',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {initialServices.map((s) => (
          <div
            key={s.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: s.is_active ? 'rgba(34,197,94,0.16)' : 'rgba(148,163,184,0.16)',
                  color: s.is_active ? '#4ade80' : 'var(--ash-400)',
                }}
              >
                {s.is_active ? 'Live' : 'Hidden'}
              </span>
              <span style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '0.9rem' }}>
                {s.starting_price !== null
                  ? `From ${formatNaira(Number(s.starting_price))}`
                  : 'Custom Quote'}
              </span>
            </div>
            <strong style={{ color: 'var(--heading)', fontSize: '1rem' }}>
              {s.title}
            </strong>
            {s.turnaround && (
              <div style={{ fontSize: '0.76rem', color: 'var(--ash-400)' }}>
                Turnaround: {s.turnaround}
              </div>
            )}
            <p style={{ fontSize: '0.825rem', color: 'var(--ash-300)', flex: 1, lineHeight: 1.5 }}>
              {s.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: s.id,
                    title: s.title,
                    slug: s.slug,
                    description: s.description,
                    startingPriceNaira:
                      s.starting_price !== null
                        ? String(koboToNaira(Number(s.starting_price)))
                        : '',
                    turnaround: s.turnaround ?? '',
                    features:
                      s.features && s.features.length > 0 ? s.features : [''],
                    icon: s.icon ?? 'wrench',
                    sortOrder: String(s.sort_order),
                    isActive: s.is_active,
                  })
                }
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--gold-400)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id, s.title)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(248,113,113,0.35)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
