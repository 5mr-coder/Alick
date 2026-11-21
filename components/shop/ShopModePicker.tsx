'use client';

import type { SalesMode } from '@/context/CartContext';

interface ShopModePickerProps {
  mode: SalesMode | null;
  onChange: (mode: SalesMode) => void;
  compact?: boolean;
}

const choices: { mode: SalesMode; title: string; description: string }[] = [
  {
    mode: 'consumer',
    title: 'Shopping for yourself?',
    description: 'Buy one to nine units of any product.',
  },
  {
    mode: 'retail',
    title: 'Buying to resell or in bulk?',
    description: 'Retail orders start at 10 units per product.',
  },
];

export default function ShopModePicker({ mode, onChange, compact = false }: ShopModePickerProps) {
  if (compact && mode) {
    return (
      <div
        role="group"
        aria-label="Pricing mode"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          flexWrap: 'wrap',
        }}
      >
        {choices.map((choice) => {
          const active = mode === choice.mode;
          return (
            <button
              key={choice.mode}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(choice.mode)}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '999px',
                border: '1px solid transparent',
                background: active ? 'var(--gold-400)' : 'transparent',
                color: active ? 'var(--on-gold)' : 'var(--ash-300)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                WebkitTapHighlightColor: 'transparent',
                transition: 'background-color 180ms var(--ease-out), color 180ms var(--ease-out)',
              }}
            >
              {choice.mode === 'consumer' ? 'Personal · 1–9' : 'Retail / Bulk · 10+'}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="shop-mode-title"
      style={{
        minHeight: '70vh',
        padding: '4rem 1.25rem',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--ash-950)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>Choose how you shop</div>
        <h1 id="shop-mode-title" className="section-heading" style={{ marginBottom: '0.75rem' }}>
          Shopping for yourself or your business?
        </h1>
        <p style={{ color: 'var(--ash-400)', margin: '0 auto 2rem', maxWidth: '560px', lineHeight: 1.7 }}>
          Choose a shopping option to see the right quantity limits. You can change it any time.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {choices.map((choice) => (
            <button
              key={choice.mode}
              type="button"
              className="card"
              onClick={() => onChange(choice.mode)}
              style={{
                minHeight: '168px',
                padding: '1.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border-gold)',
                background: 'var(--surface)',
                color: 'var(--heading)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                {choice.title}
              </span>
              <span style={{ color: 'var(--ash-300)', lineHeight: 1.6 }}>{choice.description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
