'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import type { Product } from '@/types';

function useCountdown(targetIso: string | null) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    if (!targetIso) return;
    const endTime = new Date(targetIso).getTime();

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s, expired: false });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return timeLeft;
}

const Segment = ({ value, label }: { value: number; label: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.2rem',
    }}
  >
    <div
      style={{
        background: 'var(--ash-800)',
        border: '1px solid var(--border-gold)',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem',
        minWidth: '48px',
        textAlign: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: '1.4rem',
        fontWeight: 700,
        color: 'var(--gold-400)',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {String(value).padStart(2, '0')}
    </div>
    <span
      style={{
        fontSize: '0.6rem',
        color: 'var(--ash-500)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  </div>
);

export default function FlashSales({
  products,
  endsAt,
}: {
  products: Product[];
  endsAt: string | null;
}) {
  const { d, h, m, s, expired } = useCountdown(endsAt);

  if (products.length === 0 || expired) {
    return null;
  }

  return (
    <section
      className="section"
      style={{
        background:
          'linear-gradient(180deg, var(--ash-900) 0%, var(--ash-950) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <AnimatedSection
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div className="section-label" style={{ color: 'var(--cyan-400)' }}>
              <span
                style={{
                  background: 'var(--cyan-400)',
                  width: '2rem',
                  height: '1px',
                  display: 'inline-block',
                }}
              />
              Limited Time Only
            </div>
            <h2
              className="section-heading"
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
            >
              <Zap
                size={26}
                aria-hidden="true"
                style={{ color: 'var(--gold-400)', flexShrink: 0 }}
              />
              Flash Sales
            </h2>
          </div>

          {endsAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {d > 0 && (
                <>
                  <Segment value={d} label="Days" />
                  <span
                    style={{
                      color: 'var(--gold-400)',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      marginBottom: '1.2rem',
                    }}
                  >
                    :
                  </span>
                </>
              )}
              <Segment value={h} label="Hrs" />
              <span
                style={{
                  color: 'var(--gold-400)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  marginBottom: '1.2rem',
                }}
              >
                :
              </span>
              <Segment value={m} label="Min" />
              <span
                style={{
                  color: 'var(--gold-400)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  marginBottom: '1.2rem',
                }}
              >
                :
              </span>
              <Segment value={s} label="Sec" />
            </div>
          )}
        </AnimatedSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {products.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Button href="/products" variant="secondary" size="md">
            See All Deals
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
