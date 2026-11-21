'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import type {
  FlashSaleRow,
  ProductRow,
  SiteBannerRow,
} from '@/lib/db/mappers';
import {
  deleteFlashSaleAction,
  saveFlashSaleAction,
  saveHomeBannerAction,
} from '@/lib/actions/flash-sales';
import { uploadAdminMedia } from '@/lib/storage/upload';
import { formatNaira, koboToNaira, nairaToKobo } from '@/lib/utils';
import {
  ImageUploadDropzone,
  NairaPriceField,
  StatusToggle,
} from '@/components/admin/AdminHelpers';

function toLocalDatetimeValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FlashSalesManager({
  initialSales,
  products,
  initialBanner,
}: {
  initialSales: FlashSaleRow[];
  products: ProductRow[];
  initialBanner: SiteBannerRow | null;
}) {
  const router = useRouter();
  const [saleForm, setSaleForm] = useState({
    id: '' as string,
    title: '',
    productId: products[0]?.id ?? '',
    salePriceNaira: '',
    startsAt: toLocalDatetimeValue(new Date().toISOString()),
    endsAt: '',
    isActive: true,
  });
  const [saleFeedback, setSaleFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [savingSale, setSavingSale] = useState(false);

  const meta = (initialBanner?.metadata ?? {}) as {
    label?: string;
    secondary_cta?: { text?: string; link?: string };
    stats?: Array<{ value: string; label: string }>;
  };

  const [bannerForm, setBannerForm] = useState({
    headline: initialBanner?.headline ?? "Lagos' Premier Tech Store.",
    subheadline:
      initialBanner?.subheadline ??
      'Laptops, desktops, smart gadgets, and expert repairs — all under one roof at Ikeja, Lagos.',
    ctaText: initialBanner?.cta_text ?? 'Shop Laptops',
    ctaLink: initialBanner?.cta_link ?? '/products',
    label: meta.label ?? 'Smart Tech. Sharp Deals.',
    secondaryCtaText: meta.secondary_cta?.text ?? 'Our Services',
    secondaryCtaLink: meta.secondary_cta?.link ?? '/services',
    mediaUrls: initialBanner?.media_urls ?? [],
    stats:
      meta.stats && meta.stats.length > 0
        ? meta.stats
        : [
            { value: '500+', label: 'Products Sold' },
            { value: '4.9 / 5', label: 'Customer Rating' },
            { value: '24hr', label: 'Repair Turnaround' },
          ],
    isActive: initialBanner?.is_active ?? true,
  });
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);

  const productById = new Map(products.map((p) => [p.id, p]));

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSale(true);
    setSaleFeedback(null);

    const priceNum = Number(saleForm.salePriceNaira);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setSavingSale(false);
      setSaleFeedback({ ok: false, text: 'Enter a valid deal price in Naira.' });
      return;
    }

    const res = await saveFlashSaleAction({
      id: saleForm.id || undefined,
      title: saleForm.title,
      productId: saleForm.productId,
      salePriceKobo: nairaToKobo(priceNum),
      startsAt: new Date(saleForm.startsAt).toISOString(),
      endsAt: new Date(saleForm.endsAt).toISOString(),
      isActive: saleForm.isActive,
    });

    setSavingSale(false);
    if (!res.ok) {
      setSaleFeedback({
        ok: false,
        text: res.error || 'Could not save flash deal.',
      });
      return;
    }
    setSaleFeedback({ ok: true, text: 'Flash deal saved.' });
    setSaleForm({
      id: '',
      title: '',
      productId: products[0]?.id ?? '',
      salePriceNaira: '',
      startsAt: toLocalDatetimeValue(new Date().toISOString()),
      endsAt: '',
      isActive: true,
    });
    router.refresh();
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this flash deal?')) return;
    const res = await deleteFlashSaleAction(id);
    if (!res.ok) {
      setSaleFeedback({ ok: false, text: res.error || 'Delete failed.' });
      return;
    }
    router.refresh();
  };

  const handleUploadBannerImage = async (file: File) => {
    setUploadingBanner(true);
    setBannerFeedback(null);
    try {
      const url = await uploadAdminMedia(file, 'product-media');
      setBannerForm((prev) => ({
        ...prev,
        mediaUrls: [...prev.mediaUrls, url],
      }));
      setBannerFeedback({ ok: true, text: 'Hero photo uploaded.' });
    } catch (err) {
      setBannerFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Hero photo upload failed.',
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    setBannerFeedback(null);

    const cleanStats = bannerForm.stats
      .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
      .filter((s) => s.value && s.label);

    const res = await saveHomeBannerAction({
      slot: 'home_hero',
      headline: bannerForm.headline,
      subheadline: bannerForm.subheadline,
      ctaText: bannerForm.ctaText,
      ctaLink: bannerForm.ctaLink,
      label: bannerForm.label,
      secondaryCtaText: bannerForm.secondaryCtaText,
      secondaryCtaLink: bannerForm.secondaryCtaLink,
      mediaUrls: bannerForm.mediaUrls,
      stats: cleanStats,
      isActive: bannerForm.isActive,
    });

    setSavingBanner(false);
    setBannerFeedback({
      ok: res.ok,
      text: res.ok
        ? 'Home page hero banner updated.'
        : res.error || 'Failed to save hero banner.',
    });
    if (res.ok) router.refresh();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      <div>
        <div className="section-label">Promotions</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Flash Sales & Home Hero
        </h1>
        <p style={{ color: 'var(--ash-400)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Launch limited-time product discounts and update the main banner shown
          at the top of your home page.
        </p>
      </div>

      <section
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
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: 'var(--heading)',
            }}
          >
            {saleForm.id ? 'Edit Flash Deal' : 'Create a Flash Deal'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--ash-400)', marginTop: '0.2rem' }}>
            Flash deals temporarily lower a product&apos;s price and display a
            countdown timer on the home page.
          </p>
        </div>

        {saleFeedback && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${
                saleFeedback.ok ? 'rgba(34,197,94,0.45)' : 'var(--danger)'
              }`,
              color: saleFeedback.ok ? '#4ade80' : 'var(--danger)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {saleFeedback.text}
          </div>
        )}

        <form
          onSubmit={handleSaveSale}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={labelStyle}>Deal Title *</label>
              <input
                required
                value={saleForm.title}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, title: e.target.value })
                }
                placeholder="e.g. Weekend Deal: XPS 15"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Product *</label>
              <select
                value={saleForm.productId}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, productId: e.target.value })
                }
                style={inputStyle}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatNaira(Number(p.price))})
                  </option>
                ))}
              </select>
            </div>

            <NairaPriceField
              label="Flash Deal Price (₦)"
              required
              min={1}
              value={saleForm.salePriceNaira}
              onChange={(val) =>
                setSaleForm({ ...saleForm, salePriceNaira: val })
              }
              helper="Must be lower than the product's regular selling price."
            />

            <div>
              <label style={labelStyle}>Starts At *</label>
              <input
                required
                type="datetime-local"
                value={saleForm.startsAt}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, startsAt: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Ends At *</label>
              <input
                required
                type="datetime-local"
                value={saleForm.endsAt}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, endsAt: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>

          <StatusToggle
            label="Visible on Storefront"
            checked={saleForm.isActive}
            onChange={(val) => setSaleForm({ ...saleForm, isActive: val })}
            onText="Live"
            offText="Hidden"
            helper="Turn off to pause this flash deal early."
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={savingSale}
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
              {savingSale
                ? 'Saving...'
                : saleForm.id
                  ? 'Update Flash Deal'
                  : 'Launch Flash Deal'}
            </button>
            {saleForm.id && (
              <button
                type="button"
                onClick={() =>
                  setSaleForm({
                    id: '',
                    title: '',
                    productId: products[0]?.id ?? '',
                    salePriceNaira: '',
                    startsAt: toLocalDatetimeValue(new Date().toISOString()),
                    endsAt: '',
                    isActive: true,
                  })
                }
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

        <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
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
                <th style={{ padding: '0.55rem' }}>Deal</th>
                <th style={{ padding: '0.55rem' }}>Product</th>
                <th style={{ padding: '0.55rem' }}>Deal Price</th>
                <th style={{ padding: '0.55rem' }}>Schedule</th>
                <th style={{ padding: '0.55rem' }}>Status</th>
                <th style={{ padding: '0.55rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialSales.map((fs) => {
                const prod = productById.get(fs.product_id);
                return (
                  <tr
                    key={fs.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '0.65rem', fontWeight: 600 }}>
                      {fs.title}
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      {prod?.name ?? fs.product_id}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem',
                        color: 'var(--gold-400)',
                        fontWeight: 600,
                      }}
                    >
                      {formatNaira(Number(fs.sale_price))}
                    </td>
                    <td style={{ padding: '0.65rem', fontSize: '0.78rem' }}>
                      {new Date(fs.starts_at).toLocaleString()} →{' '}
                      {new Date(fs.ends_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: fs.is_active
                            ? 'rgba(34,197,94,0.16)'
                            : 'rgba(157,176,210,0.14)',
                          color: fs.is_active ? '#4ade80' : 'var(--ash-400)',
                        }}
                      >
                        {fs.is_active ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() =>
                          setSaleForm({
                            id: fs.id,
                            title: fs.title,
                            productId: fs.product_id,
                            salePriceNaira: String(
                              koboToNaira(Number(fs.sale_price))
                            ),
                            startsAt: toLocalDatetimeValue(fs.starts_at),
                            endsAt: toLocalDatetimeValue(fs.ends_at),
                            isActive: fs.is_active,
                          })
                        }
                        style={{
                          marginRight: '0.5rem',
                          padding: '0.32rem 0.7rem',
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
                        onClick={() => handleDeleteSale(fs.id)}
                        style={{
                          padding: '0.32rem 0.7rem',
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
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section
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
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: 'var(--heading)',
            }}
          >
            Home Page Hero Banner
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--ash-400)', marginTop: '0.2rem' }}>
            Controls the headline, action buttons, background collage, and quick
            stats on the storefront home page.
          </p>
        </div>

        {bannerFeedback && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${
                bannerFeedback.ok ? 'rgba(34,197,94,0.45)' : 'var(--danger)'
              }`,
              color: bannerFeedback.ok ? '#4ade80' : 'var(--danger)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {bannerFeedback.text}
          </div>
        )}

        <form
          onSubmit={handleSaveBanner}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={labelStyle}>Top Tagline Badge</label>
              <input
                value={bannerForm.label}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, label: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Main Headline *</label>
              <input
                required
                value={bannerForm.headline}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, headline: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Primary Button Label</label>
              <input
                value={bannerForm.ctaText}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, ctaText: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Primary Button Page</label>
              <input
                value={bannerForm.ctaLink}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, ctaLink: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Secondary Button Label</label>
              <input
                value={bannerForm.secondaryCtaText}
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    secondaryCtaText: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Secondary Button Page</label>
              <input
                value={bannerForm.secondaryCtaLink}
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    secondaryCtaLink: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Hero Subtitle Text</label>
            <textarea
              rows={2}
              value={bannerForm.subheadline}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, subheadline: e.target.value })
              }
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
                  Highlight Stats (shown below hero buttons)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ash-400)' }}>
                  Example: 500+ | Products Sold
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBannerForm((prev) => ({
                    ...prev,
                    stats: [...prev.stats, { value: '', label: '' }],
                  }))
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-gold)',
                  background: 'rgba(245, 200, 66, 0.1)',
                  color: 'var(--gold-400)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add Stat
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {bannerForm.stats.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    value={st.value}
                    placeholder="500+"
                    onChange={(e) => {
                      const next = [...bannerForm.stats];
                      next[idx] = { ...next[idx], value: e.target.value };
                      setBannerForm({ ...bannerForm, stats: next });
                    }}
                    style={{ ...inputStyle, background: 'var(--surface)' }}
                  />
                  <input
                    value={st.label}
                    placeholder="Products Sold"
                    onChange={(e) => {
                      const next = [...bannerForm.stats];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setBannerForm({ ...bannerForm, stats: next });
                    }}
                    style={{ ...inputStyle, background: 'var(--surface)' }}
                  />
                  <button
                    type="button"
                    aria-label="Remove stat"
                    onClick={() =>
                      setBannerForm((prev) => ({
                        ...prev,
                        stats: prev.stats.filter((_, i) => i !== idx),
                      }))
                    }
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(248,113,113,0.35)',
                      background: 'transparent',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Hero Background Photos (up to 6)</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '0.85rem',
                alignItems: 'center',
              }}
            >
              <ImageUploadDropzone
                uploading={uploadingBanner}
                onFileSelected={handleUploadBannerImage}
                label="Upload hero photo"
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  placeholder="Or paste an image URL..."
                  value={newBannerImageUrl}
                  onChange={(e) => setNewBannerImageUrl(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBannerImageUrl.trim()) return;
                    setBannerForm((prev) => ({
                      ...prev,
                      mediaUrls: [...prev.mediaUrls, newBannerImageUrl.trim()],
                    }));
                    setNewBannerImageUrl('');
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

            {bannerForm.mediaUrls.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  flexWrap: 'wrap',
                  marginTop: '0.75rem',
                }}
              >
                {bannerForm.mediaUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    style={{
                      position: 'relative',
                      width: '88px',
                      height: '62px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src={url}
                      alt={`Hero ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Remove hero image"
                      onClick={() =>
                        setBannerForm((prev) => ({
                          ...prev,
                          mediaUrls: prev.mediaUrls.filter((_, i) => i !== idx),
                        }))
                      }
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(0,0,0,0.8)',
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

          <StatusToggle
            label="Visible on Storefront"
            checked={bannerForm.isActive}
            onChange={(val) => setBannerForm({ ...bannerForm, isActive: val })}
            onText="Live"
            offText="Hidden"
          />

          <div>
            <button
              type="submit"
              disabled={savingBanner || uploadingBanner}
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
              {savingBanner ? 'Saving...' : 'Save Home Hero Banner'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
