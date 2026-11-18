'use client';

import Link from 'next/link';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatNaira, getEffectiveUnitPrice } from '@/lib/utils';

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

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
      <article className="card" style={{ cursor: 'pointer' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            overflow: 'hidden',
            background: 'var(--ash-800)',
          }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 400ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = 'scale(1.06)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')
              }
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

          <div
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              display: 'flex',
              gap: '0.375rem',
              flexWrap: 'wrap',
            }}
          >
            {product.is_flash_sale && (
              <span className="badge badge-sale">Flash Sale</span>
            )}
            {product.is_featured && !product.is_flash_sale && (
              <span className="badge badge-gold">Featured</span>
            )}
            {(discount ?? 0) > 0 && (
              <span className="badge badge-sale">-{discount}%</span>
            )}
            {product.stock > 0 && product.stock < 5 && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(245,200,66,0.12)',
                  color: 'var(--gold-400)',
                  border: '1px solid var(--border-gold)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(34,211,238,0.12)',
                  color: 'var(--cyan-400)',
                  border: '1px solid var(--cyan-glow)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {product.brand && (
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--gold-400)',
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

          {product.specs && (
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--gold-400)',
              }}
            >
              {formatNaira(effectivePrice)}
            </span>
            {strikePrice > 0 && (
              <span
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
