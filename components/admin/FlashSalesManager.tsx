'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [saleFeedback, setSaleFeedback] = useState<string | null>(null);
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
      "Laptops, desktops, smart gadgets, and expert repairs — all under one roof at Ikeja, Lagos.",
    ctaText: initialBanner?.cta_text ?? 'Shop Laptops',
    ctaLink: initialBanner?.cta_link ?? '/products',
    label: meta.label ?? 'Smart Tech. Sharp Deals.',
    secondaryCtaText: meta.secondary_cta?.text ?? 'Our Services',
    secondaryCtaLink: meta.secondary_cta?.link ?? '/services',
    mediaUrlsText: (initialBanner?.media_urls ?? []).join('\n'),
    statsJson: JSON.stringify(
      meta.stats ?? [
        { value: '500+', label: 'Products Sold' },
        { value: '4.9★', label: 'Customer Rating' },
        { value: '24hr', label: 'Repair Turnaround' },
      ],
      null,
      2
    ),
    isActive: initialBanner?.is_active ?? true,
  });
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);

  const productNameById = new Map(products.map((p) => [p.id, p]));

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSale(true);
    setSaleFeedback(null);

    const priceNum = Number(saleForm.salePriceNaira);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setSavingSale(false);
      setSaleFeedback('Enter a valid sale price in Naira.');
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
      setSaleFeedback(res.error || 'Could not save flash sale.');
      return;
    }
    setSaleFeedback('Flash sale saved.');
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
    if (!confirm('Delete this flash sale?')) return;
    const res = await deleteFlashSaleAction(id);
    if (!res.ok) {
      setSaleFeedback(res.error || 'Delete failed.');
      return;
    }
    router.refresh();
  };

  const handleUploadBannerImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadAdminMedia(file, 'product-media');
      setBannerForm((prev) => ({
        ...prev,
        mediaUrlsText: [prev.mediaUrlsText.trim(), url]
          .filter(Boolean)
          .join('\n'),
      }));
      setBannerFeedback('Uploaded hero image.');
    } catch (err) {
      setBannerFeedback(
        err instanceof Error ? err.message : 'Hero image upload failed.'
      );
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    setBannerFeedback(null);

    let parsedStats: Array<{ value: string; label: string }> = [];
    try {
      const raw = JSON.parse(bannerForm.statsJson || '[]');
      if (!Array.isArray(raw)) throw new Error('Stats must be a JSON array.');
      parsedStats = raw;
    } catch (err) {
      setSavingBanner(false);
      setBannerFeedback(
        err instanceof Error ? err.message : 'Invalid stats JSON.'
      );
      return;
    }

    const res = await saveHomeBannerAction({
      slot: 'home_hero',
      headline: bannerForm.headline,
      subheadline: bannerForm.subheadline,
      ctaText: bannerForm.ctaText,
      ctaLink: bannerForm.ctaLink,
      label: bannerForm.label,
      secondaryCtaText: bannerForm.secondaryCtaText,
      secondaryCtaLink: bannerForm.secondaryCtaLink,
      mediaUrls: bannerForm.mediaUrlsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      stats: parsedStats,
      isActive: bannerForm.isActive,
    });

    setSavingBanner(false);
    setBannerFeedback(
      res.ok ? 'Home hero banner updated.' : res.error || 'Failed to save.'
    );
    if (res.ok) router.refresh();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <div className="section-label">Promotions</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Flash Sales & Home Hero
        </h1>
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
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            color: 'var(--heading)',
          }}
        >
          {saleForm.id ? 'Edit Flash Sale' : 'Create Flash Sale'}
        </h2>

        {saleFeedback && (
          <p style={{ color: 'var(--gold-400)', fontSize: '0.875rem' }}>
            {saleFeedback}
          </p>
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Sale Title *
              </label>
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Product *
              </label>
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
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Sale Price (₦ Naira, must be &lt; product price) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min={1}
                value={saleForm.salePriceNaira}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, salePriceNaira: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Starts At *
              </label>
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Ends At *
              </label>
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
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', paddingBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={saleForm.isActive}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={savingSale}
              style={{
                padding: '0.7rem 1.4rem',
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
                  ? 'Update Flash Sale'
                  : 'Create Flash Sale'}
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
                  padding: '0.7rem 1rem',
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
                <th style={{ padding: '0.5rem' }}>Title</th>
                <th style={{ padding: '0.5rem' }}>Product</th>
                <th style={{ padding: '0.5rem' }}>Sale Price</th>
                <th style={{ padding: '0.5rem' }}>Window</th>
                <th style={{ padding: '0.5rem' }}>Active</th>
                <th style={{ padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialSales.map((fs) => {
                const prod = productNameById.get(fs.product_id);
                return (
                  <tr
                    key={fs.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '0.6rem' }}>{fs.title}</td>
                    <td style={{ padding: '0.6rem' }}>
                      {prod?.name ?? fs.product_id}
                    </td>
                    <td style={{ padding: '0.6rem', color: 'var(--gold-400)' }}>
                      {formatNaira(Number(fs.sale_price))}
                    </td>
                    <td style={{ padding: '0.6rem', fontSize: '0.78rem' }}>
                      {new Date(fs.starts_at).toLocaleString()} →{' '}
                      {new Date(fs.ends_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      {fs.is_active ? 'Yes' : 'No'}
                    </td>
                    <td style={{ padding: '0.6rem', whiteSpace: 'nowrap' }}>
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
                          padding: '0.3rem 0.65rem',
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
                        onClick={() => handleDeleteSale(fs.id)}
                        style={{
                          padding: '0.3rem 0.65rem',
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
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            color: 'var(--heading)',
          }}
        >
          Home Hero Banner (<code>site_banners: home_hero</code>)
        </h2>

        {bannerFeedback && (
          <p style={{ color: 'var(--gold-400)', fontSize: '0.875rem' }}>
            {bannerFeedback}
          </p>
        )}

        <form
          onSubmit={handleSaveBanner}
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Section Label
              </label>
              <input
                value={bannerForm.label}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, label: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Headline *
              </label>
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Primary CTA Text
              </label>
              <input
                value={bannerForm.ctaText}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, ctaText: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Primary CTA Link
              </label>
              <input
                value={bannerForm.ctaLink}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, ctaLink: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Secondary CTA Text
              </label>
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Secondary CTA Link
              </label>
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
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Subheadline
            </label>
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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Background Grid Image URLs (one per line)
              </label>
              <textarea
                rows={5}
                value={bannerForm.mediaUrlsText}
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    mediaUrlsText: e.target.value,
                  })
                }
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadBannerImage}
                style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
                Hero Stats JSON
              </label>
              <textarea
                rows={5}
                value={bannerForm.statsJson}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, statsJson: e.target.value })
                }
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, isActive: e.target.checked })
                  }
                />
                Banner Active
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={savingBanner}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gold-400)',
                color: 'var(--on-gold)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {savingBanner ? 'Saving Banner...' : 'Save Hero Banner'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
