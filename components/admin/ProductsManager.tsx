'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Star, Trash2 } from 'lucide-react';
import type { ProductRow } from '@/lib/db/mappers';
import {
  saveProductAction,
  deleteProductAction,
} from '@/lib/actions/products';
import { uploadAdminMedia } from '@/lib/storage/upload';
import { formatNaira, koboToNaira, nairaToKobo, slugify } from '@/lib/utils';
import {
  ImageUploadDropzone,
  NairaPriceField,
  SlugFieldToggle,
  StatusToggle,
} from '@/components/admin/AdminHelpers';

type SpecRow = { key: string; value: string };

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
  specRows: SpecRow[];
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
  specRows: [
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' },
    { key: 'Storage', value: '' },
  ],
  images: [],
  isFeatured: false,
  isActive: true,
};

function rowToForm(row: ProductRow): FormState {
  const entries = Object.entries(row.specs ?? {});
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
      row.retail_price !== null
        ? String(koboToNaira(Number(row.retail_price)))
        : '',
    compareAtPriceNaira:
      row.compare_at_price !== null
        ? String(koboToNaira(Number(row.compare_at_price)))
        : '',
    stockQuantity: String(row.stock_quantity),
    tagsText: (row.tags ?? []).join(', '),
    specRows:
      entries.length > 0
        ? entries.map(([key, val]) => ({ key, value: String(val ?? '') }))
        : [{ key: '', value: '' }],
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

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setFeedback(null);
    try {
      const publicUrl = await uploadAdminMedia(file, 'product-media');
      setForm((prev) => ({ ...prev, images: [...prev.images, publicUrl] }));
      setFeedback({ type: 'ok', text: 'Photo uploaded successfully.' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const parsedSpecs: Record<string, string> = {};
    for (const row of form.specRows) {
      const k = row.key.trim();
      const v = row.value.trim();
      if (k && v) {
        parsedSpecs[k] = v;
      }
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
      setFeedback({ type: 'err', text: 'Enter a valid selling price in Naira.' });
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
      text: form.id
        ? `"${form.name}" updated on the store.`
        : `"${form.name}" added to your store.`,
    });
    setForm(emptyForm);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    setFeedback(null);
    const res = await deleteProductAction(id);
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error || 'Delete failed.' });
      return;
    }
    if (form.id === id) setForm(emptyForm);
    setFeedback({ type: 'ok', text: `Deleted "${name}".` });
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.62rem 0.85rem',
    borderRadius: '8px',
    background: 'var(--ash-900)',
    border: '1px solid var(--border)',
    color: 'var(--heading)',
    fontSize: '0.875rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--ash-300)',
    marginBottom: '0.3rem',
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
          <div className="section-label">Store Catalog</div>
          <h1 className="section-heading" style={{ fontSize: '2rem' }}>
            Products ({initialProducts.length})
          </h1>
          <p style={{ color: 'var(--ash-400)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Add new laptops, desktops, or smart gadgets, adjust prices, or
            update available stock.
          </p>
        </div>
        {form.id && (
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setFeedback(null);
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-gold)',
              background: 'rgba(245, 200, 66, 0.1)',
              color: 'var(--gold-400)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add New Product
          </button>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: `1px solid ${
              feedback.type === 'ok' ? 'rgba(34,197,94,0.5)' : 'var(--danger)'
            }`,
            color: feedback.type === 'ok' ? '#4ade80' : 'var(--danger)',
            background:
              feedback.type === 'ok'
                ? 'rgba(34,197,94,0.08)'
                : 'rgba(248,113,113,0.08)',
            fontSize: '0.875rem',
            fontWeight: 600,
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
          gap: '1.25rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            color: 'var(--heading)',
          }}
        >
          {form.id ? `Editing: ${form.name}` : 'Add a New Product'}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ gridColumn: 'span 1' }}>
            <label style={labelStyle}>Product Name *</label>
            <input
              required
              value={form.name}
              placeholder="e.g. HP EliteBook 840 G9"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: prev.id ? prev.slug : slugify(e.target.value),
                }))
              }
              style={inputStyle}
            />
            <SlugFieldToggle
              slug={form.slug}
              onChange={(slug) => setForm({ ...form, slug })}
              prefix="/products/"
            />
          </div>

          <div>
            <label style={labelStyle}>Store Category *</label>
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
            <label style={labelStyle}>Stock Quantity *</label>
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
            <p style={{ fontSize: '0.74rem', color: 'var(--ash-400)', marginTop: '0.3rem' }}>
              Units ready to sell. Set to 0 when sold out.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Brand</label>
            <input
              value={form.brand}
              placeholder="e.g. HP, Dell, Apple"
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Model Number</label>
            <input
              value={form.model}
              placeholder="e.g. EliteBook 840 G9"
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Search Keywords (optional)</label>
            <input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="e.g. laptops, hp, business"
              style={inputStyle}
            />
            <p style={{ fontSize: '0.74rem', color: 'var(--ash-400)', marginTop: '0.3rem' }}>
              Separate words with commas.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(245, 200, 66, 0.04)',
            border: '1px solid var(--border)',
          }}
        >
          <NairaPriceField
            label="Selling Price (₦)"
            required
            value={form.priceNaira}
            onChange={(val) => setForm({ ...form, priceNaira: val })}
            helper="Regular price paid by customers."
          />

          <NairaPriceField
            label="Bulk / Reseller Price (₦, 10+ units)"
            min={1}
            value={form.retailPriceNaira}
            onChange={(val) => setForm({ ...form, retailPriceNaira: val })}
            placeholder="Optional"
            helper="Optional lower unit price when a buyer orders 10 or more."
          />

          <NairaPriceField
            label="Original / Strikethrough Price (₦)"
            min={0}
            value={form.compareAtPriceNaira}
            onChange={(val) => setForm({ ...form, compareAtPriceNaira: val })}
            placeholder="Optional"
            helper="Optional. Shows a discount badge if higher than the selling price."
          />
        </div>

        <div>
          <label style={labelStyle}>Product Description</label>
          <textarea
            rows={3}
            value={form.description}
            placeholder="Describe condition, warranty, battery life, and key highlights..."
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: '10px',
            background: 'var(--ash-900)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--heading)' }}>
                Product Specifications
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--ash-400)' }}>
                Shown on product cards and the product details table (e.g.
                Processor, RAM, Storage).
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  specRows: [...prev.specRows, { key: '', value: '' }],
                }))
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-gold)',
                background: 'rgba(245, 200, 66, 0.1)',
                color: 'var(--gold-400)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Specification
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {form.specRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.2fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <input
                  value={row.key}
                  placeholder="Label (e.g. Processor)"
                  onChange={(e) => {
                    const next = [...form.specRows];
                    next[idx] = { ...next[idx], key: e.target.value };
                    setForm({ ...form, specRows: next });
                  }}
                  style={{ ...inputStyle, background: 'var(--surface)' }}
                />
                <input
                  value={row.value}
                  placeholder="Value (e.g. AMD Ryzen 9)"
                  onChange={(e) => {
                    const next = [...form.specRows];
                    next[idx] = { ...next[idx], value: e.target.value };
                    setForm({ ...form, specRows: next });
                  }}
                  style={{ ...inputStyle, background: 'var(--surface)' }}
                />
                <button
                  type="button"
                  aria-label="Remove specification"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      specRows:
                        prev.specRows.length > 1
                          ? prev.specRows.filter((_, i) => i !== idx)
                          : [{ key: '', value: '' }],
                    }))
                  }
                  style={{
                    padding: '0.55rem',
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <StatusToggle
            label="Visible on Storefront"
            checked={form.isActive}
            onChange={(val) => setForm({ ...form, isActive: val })}
            onText="Live"
            offText="Hidden"
            helper="Turn off to hide this item without deleting it."
          />
          <StatusToggle
            label="Feature on Home Page"
            checked={form.isFeatured}
            onChange={(val) => setForm({ ...form, isFeatured: val })}
            onText="Featured"
            offText="Standard"
            helper="Display this product in the Home Page Featured section."
          />
        </div>

        <div>
          <label style={labelStyle}>Product Photos</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.85rem',
              alignItems: 'center',
            }}
          >
            <ImageUploadDropzone
              uploading={uploading}
              onFileSelected={handleFileUpload}
              label="Upload product photo"
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                placeholder="Or paste an image URL..."
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
                  fontSize: '0.825rem',
                }}
              >
                Add Link
              </button>
            </div>
          </div>

          {form.images.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginTop: '0.85rem',
              }}
            >
              {form.images.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  style={{
                    position: 'relative',
                    width: '88px',
                    height: '88px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={url}
                    alt={`Product preview ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                      }))
                    }
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.8)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '0.72rem',
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
              padding: '0.8rem 1.6rem',
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
                ? 'Save Product Changes'
                : 'Save Product'}
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
              <th style={{ padding: '0.6rem' }}>Selling Price</th>
              <th style={{ padding: '0.6rem' }}>Bulk Price (10+)</th>
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
                  <div style={{ fontSize: '0.74rem', color: 'var(--ash-400)' }}>
                    /products/{p.slug}
                  </div>
                </td>
                <td style={{ padding: '0.65rem', textTransform: 'capitalize' }}>
                  {p.category.replace('-', ' ')}
                </td>
                <td
                  style={{
                    padding: '0.65rem',
                    color: 'var(--gold-400)',
                    fontWeight: 600,
                  }}
                >
                  {formatNaira(Number(p.price))}
                </td>
                <td style={{ padding: '0.65rem' }}>
                  {p.retail_price ? formatNaira(Number(p.retail_price)) : '—'}
                </td>
                <td style={{ padding: '0.65rem' }}>
                  <span
                    style={{
                      color:
                        p.stock_quantity === 0
                          ? 'var(--danger)'
                          : p.stock_quantity < 5
                            ? 'var(--gold-400)'
                            : 'var(--heading)',
                      fontWeight: 600,
                    }}
                  >
                    {p.stock_quantity}
                  </span>
                </td>
                <td style={{ padding: '0.65rem' }}>
                  <span
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: p.is_active
                        ? 'rgba(34,197,94,0.16)'
                        : 'rgba(157,176,210,0.14)',
                      color: p.is_active ? '#4ade80' : 'var(--ash-400)',
                    }}
                  >
                    {p.is_active ? 'Live' : 'Hidden'}
                  </span>
                  {p.is_featured && (
                    <span
                      style={{
                        marginLeft: '0.35rem',
                        fontSize: '0.72rem',
                        color: 'var(--gold-400)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Star size={11} fill="currentColor" aria-hidden="true" />
                      Featured
                    </span>
                  )}
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
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--gold-400)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
