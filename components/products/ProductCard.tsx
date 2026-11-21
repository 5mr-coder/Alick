'use client';

import Link from 'next/link';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatNaira, getEffectiveUnitPrice } from '@/lib/utils';
import SkeletonImage from '@/components/ui/SkeletonImage';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { salesMode } = useCart();
  const effectivePrice = getEffectiveUnitPrice(product, salesMode);

  const strikePrice =
    product.old_price && product.old_price > effectivePrice
      ? product.old_price
      : product.base_price > effectivePrice
        ? product.base_price
        : 0;

  const discount =
    strikePrice > effectivePrice
      ? Math.round(((strikePrice - effectivePrice) / strikePrice) * 100)
      : null;

  // Show at most one high-signal badge so product imagery stays uncluttered
  const primaryBadge =
    product.stock === 0
      ? { label: 'Out of Stock', tone: 'muted' as const }
      : product.is_flash_sale
        ? {
            label: discount && discount > 0 ? `Flash · -${discount}%` : 'Flash Sale',
            tone: 'sale' as const,
          }
        : discount && discount > 0
          ? { label: `-${discount}%`, tone: 'sale' as const }
          : product.stock > 0 && product.stock < 5
            ? { label: `Only ${product.stock} left`, tone: 'gold' as const }
            : product.is_featured
              ? { label: 'Featured', tone: 'gold' as const }
              : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <article
        className="card"
        style={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="img-outline"
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            overflow: 'hidden',
            background: 'var(--ash-800)',
          }}
        >
          {product.images?.[0] ? (
            <SkeletonImage
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="card-media-zoom"
            />
          ) : (
            <div
              className="skeleton"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ash-600)"
                strokeWidth="1"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
          )}

          {primaryBadge && (
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
              }}
            >
              {primaryBadge.tone === 'sale' && (
                <span className="badge badge-sale tabular-nums">{primaryBadge.label}</span>
              )}
              {primaryBadge.tone === 'gold' && (
                <span className="badge badge-gold tabular-nums">{primaryBadge.label}</span>
              )}
              {primaryBadge.tone === 'muted' && (
                <span
                  className="badge"
                  style={{
                    background: 'rgba(13, 20, 36, 0.84)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(157, 176, 210, 0.25)',
                  }}
                >
                  {primaryBadge.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '1rem 1.125rem 1.125rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {product.brand && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--ash-400)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              {product.brand}
            </div>
          )}

          <h3
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--heading)',
              lineHeight: 1.4,
              marginBottom: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h3>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.375rem',
                flexWrap: 'wrap',
                marginBottom: '0.875rem',
              }}
            >
              {Object.entries(product.specs)
                .slice(0, 3)
                .map(([key, val]) => (
                  <span
                    key={key}
                    className="truncate max-w-[140px]"
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: 'var(--ash-800)',
                      color: 'var(--ash-300)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {val}
                  </span>
                ))}
            </div>
          )}

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '0.25rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--heading)',
              }}
            >
              {formatNaira(effectivePrice)}
            </span>
            {strikePrice > 0 && (
              <span
                className="tabular-nums"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--ash-500)',
                  textDecoration: 'line-through',
                }}
              >
                {formatNaira(strikePrice)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
