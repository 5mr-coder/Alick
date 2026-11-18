'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductRow } from '@/lib/db/mappers';
import {
  saveProductAction,
  deleteProductAction,
} from '@/lib/actions/products';
import { uploadAdminMedia } from '@/lib/storage/upload';
import { formatNaira, koboToNaira, nairaToKobo, slugify } from '@/lib/utils';

type FormState = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  category: string;
  description: string;
  priceNaira: string;
  retailPriceNaira: string;
  compareAtPriceNaira: string;
  stockQuantity: string;
  tagsText: string;
  specsJson: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  brand: '',
  model: '',
  category: 'laptops',
  description: '',
  priceNaira: '',
  retailPriceNaira: '',
  compareAtPriceNaira: '',
  stockQuantity: '10',
  tagsText: '',
  specsJson: '{\n  "RAM": "16GB",\n  "Storage": "512GB SSD"\n}',
  images: [],
  isFeatured: false,
  isActive: true,
};

function rowToForm(row: ProductRow): FormState {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand ?? '',
    model: row.model ?? '',
    category: row.category,
    description: row.description ?? '',
    priceNaira: String(koboToNaira(Number(row.price))),
    retailPriceNaira:
      row.retail_price !== null ? String(koboToNaira(Number(row.retail_price))) : '',
    compareAtPriceNaira:
      row.compare_at_price !== null
        ? String(koboToNaira(Number(row.compare_at_price)))
        : '',
    stockQuantity: String(row.stock_quantity),
    tagsText: (row.tags ?? []).join(', '),
    specsJson: JSON.stringify(row.specs ?? {}, null, 2),
    images: Array.isArray(row.images) ? row.images : [],
    isFeatured: row.is_featured,
    isActive: row.is_active,
  };
}

export default function ProductsManager({
  initialProducts,
}: {
  initialProducts: ProductRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const publicUrl = await uploadAdminMedia(file, 'product-media');
      setForm((prev) => ({ ...prev, images: [...prev.images, publicUrl] }));
      setFeedback({ type: 'ok', text: 'Image uploaded to product-media.' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Upload failed.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const parsedSpecs: Record<string, string> = {};
    try {
      const raw = JSON.parse(form.specsJson || '{}') as Record<string, unknown>;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error('Specs must be a JSON object.');
      }
      for (const [k, v] of Object.entries(raw)) {
        parsedSpecs[k] = String(v);
      }
    } catch (err) {
      setSaving(false);
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Invalid specs JSON.',
      });
      return;
    }

    const priceNum = Number(form.priceNaira);
    const retailNum = form.retailPriceNaira.trim()
      ? Number(form.retailPriceNaira)
      : null;
    const compareNum = form.compareAtPriceNaira.trim()
      ? Number(form.compareAtPriceNaira)
      : null;

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setSaving(false);
      setFeedback({ type: 'err', text: 'Enter a valid price in Naira.' });
      return;
    }

    const res = await saveProductAction({
      id: form.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      brand: form.brand || null,
      model: form.model || null,
      category: form.category,
      description: form.description || null,
      priceKobo: nairaToKobo(priceNum),
      retailPriceKobo: retailNum !== null ? nairaToKobo(retailNum) : null,
      compareAtPriceKobo:
        compareNum !== null ? nairaToKobo(compareNum) : null,
      stockQuantity: Number(form.stockQuantity) || 0,
      tags: form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      specs: parsedSpecs,
      images: form.images,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback({
        type: 'err',
        text: res.error || 'Could not save product.',
      });
      return;
    }

    setFeedback({
      type: 'ok',
      text: form.id ? 'Product updated.' : 'Product created.',
    });
    setForm(emptyForm);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setFeedback(null);
    const res = await deleteProductAction(id);
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error || 'Delete failed.' });
      return;
    }
    if (form.id === id) setForm(emptyForm);
    setFeedback({ type: 'ok', text: `Deleted ${name}.` });
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="section-label">Catalog</div>
          <h1 className="section-heading" style={{ fontSize: '2rem' }}>
            Products ({initialProducts.length})
          </h1>
        </div>
        {form.id && (
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setFeedback(null);
            }}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--heading)',
              cursor: 'pointer',
            }}
          >
            + New Product
          </button>
        )}
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${
              feedback.type === 'ok' ? 'var(--cyan-400)' : 'var(--danger)'
            }`,
            color:
              feedback.type === 'ok' ? 'var(--cyan-400)' : 'var(--danger)',
            background: 'var(--surface)',
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
          gap: '1rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            color: 'var(--heading)',
          }}
        >
          {form.id ? `Editing: ${form.name}` : 'Add New Product'}
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
              Product Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
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
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={inputStyle}
            >
              <option value="laptops">Laptops</option>
              <option value="desktops">Desktops</option>
              <option value="smart-gadgets">Smart Gadgets</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Brand
            </label>
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Model
            </label>
            <input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Stock Quantity *
            </label>
            <input
              required
              type="number"
              min={0}
              value={form.stockQuantity}
              onChange={(e) =>
                setForm({ ...form, stockQuantity: e.target.value })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Price (₦ Naira) *
            </label>
            <input
              required
              type="number"
              step="0.01"
              min={0}
              value={form.priceNaira}
              onChange={(e) => setForm({ ...form, priceNaira: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Retail / Wholesale Price (₦, optional)
            </label>
            <input
              type="number"
              step="0.01"
              min={1}
              value={form.retailPriceNaira}
              onChange={(e) =>
                setForm({ ...form, retailPriceNaira: e.target.value })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Compare-at Strike Price (₦, optional)
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={form.compareAtPriceNaira}
              onChange={(e) =>
                setForm({ ...form, compareAtPriceNaira: e.target.value })
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Specs JSON
            </label>
            <textarea
              rows={4}
              value={form.specsJson}
              onChange={(e) => setForm({ ...form, specsJson: e.target.value })}
              style={{ ...inputStyle, fontFamily: 'monospace' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Tags (comma separated)
            </label>
            <input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="laptops, hp, business"
              style={inputStyle}
            />

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                />
                Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active (Visible)
              </label>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.4rem' }}>
            Product Images (Upload JPEG/PNG/WebP ≤ 5MB or paste URL)
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ fontSize: '0.825rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <input
                placeholder="Or paste image URL..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newImageUrl.trim()) return;
                  setForm((prev) => ({
                    ...prev,
                    images: [...prev.images, newImageUrl.trim()],
                  }));
                  setNewImageUrl('');
                }}
                style={{
                  padding: '0 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--ash-800)',
                  color: 'var(--heading)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Add URL
              </button>
            </div>
          </div>

          {form.images.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {form.images.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                      }))
                    }
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0 5px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gold-400)',
              color: 'var(--on-gold)',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving
              ? 'Saving...'
              : form.id
                ? 'Save Changes'
                : 'Create Product'}
          </button>
        </div>
      </form>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.25rem',
          overflowX: 'auto',
        }}
      >
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
              <th style={{ padding: '0.6rem' }}>Product</th>
              <th style={{ padding: '0.6rem' }}>Category</th>
              <th style={{ padding: '0.6rem' }}>Price</th>
              <th style={{ padding: '0.6rem' }}>Retail</th>
              <th style={{ padding: '0.6rem' }}>Stock</th>
              <th style={{ padding: '0.6rem' }}>Status</th>
              <th style={{ padding: '0.6rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.65rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--heading)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
                    {p.slug}
                  </div>
                </td>
                <td style={{ padding: '0.65rem' }}>{p.category}</td>
                <td style={{ padding: '0.65rem', color: 'var(--gold-400)' }}>
                  {formatNaira(Number(p.price))}
                </td>
                <td style={{ padding: '0.65rem' }}>
                  {p.retail_price ? formatNaira(Number(p.retail_price)) : '—'}
                </td>
                <td style={{ padding: '0.65rem' }}>{p.stock_quantity}</td>
                <td style={{ padding: '0.65rem' }}>
                  {p.is_active ? 'Active' : 'Hidden'}
                  {p.is_featured ? ' · Featured' : ''}
                </td>
                <td style={{ padding: '0.65rem', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(rowToForm(p));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      marginRight: '0.5rem',
                      padding: '0.35rem 0.7rem',
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
                    onClick={() => handleDelete(p.id, p.name)}
                    style={{
                      padding: '0.35rem 0.7rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(248,113,113,0.35)',
                      background: 'transparent',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
