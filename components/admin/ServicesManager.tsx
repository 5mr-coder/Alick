'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ServiceRow } from '@/lib/db/mappers';
import {
  deleteServiceAction,
  saveServiceAction,
} from '@/lib/actions/services';
import { formatNaira, koboToNaira, nairaToKobo, slugify } from '@/lib/utils';

const emptyService = {
  id: '',
  title: '',
  slug: '',
  description: '',
  startingPriceNaira: '',
  turnaround: '',
  featuresText: '',
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
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const priceVal = form.startingPriceNaira.trim()
      ? nairaToKobo(Number(form.startingPriceNaira))
      : null;

    const res = await saveServiceAction({
      id: form.id || undefined,
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description,
      startingPriceKobo: priceVal,
      turnaround: form.turnaround || null,
      features: form.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      icon: form.icon,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback(res.error || 'Could not save service.');
      return;
    }

    setFeedback('Service saved.');
    setForm(emptyService);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await deleteServiceAction(id);
    if (!res.ok) {
      setFeedback(res.error || 'Delete failed.');
      return;
    }
    if (form.id === id) setForm(emptyService);
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    background: 'var(--ash-900)',
    border: '1px solid var(--border)',
    color: 'var(--heading)',
    fontSize: '0.875rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="section-label">Workshop</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Repair Services ({initialServices.length})
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
          gap: '1rem',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
          {form.id ? `Editing: ${form.title}` : 'Add Service'}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.id ? prev.slug : slugify(e.target.value),
                }))
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Slug *
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Starting Price (₦ Naira)
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={form.startingPriceNaira}
              onChange={(e) =>
                setForm({ ...form, startingPriceNaira: e.target.value })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Turnaround (optional)
            </label>
            <input
              value={form.turnaround}
              onChange={(e) =>
                setForm({ ...form, turnaround: e.target.value })
              }
              placeholder="e.g. Same-day / 24 hours"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Icon
            </label>
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              style={inputStyle}
            >
              <option value="wrench">Wrench</option>
              <option value="laptop">Laptop</option>
              <option value="server">Clock / OS</option>
              <option value="cpu">Memory / CPU</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Sort Order
            </label>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Features (one per line)
          </label>
          <textarea
            rows={4}
            value={form.featuresText}
            onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
            style={inputStyle}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

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
            {saving ? 'Saving...' : form.id ? 'Update Service' : 'Create Service'}
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
              Cancel
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
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--heading)' }}>{s.title}</strong>
              <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>
                {s.starting_price !== null
                  ? formatNaira(Number(s.starting_price))
                  : 'Quote'}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--ash-400)', flex: 1 }}>
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
                    featuresText: (s.features ?? []).join('\n'),
                    icon: s.icon ?? 'wrench',
                    sortOrder: String(s.sort_order),
                    isActive: s.is_active,
                  })
                }
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--gold-400)',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id, s.title)}
                style={{
                  padding: '0.35rem 0.75rem',
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
