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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {choices.map((choice) => (
          <button
            key={choice.mode}
            type="button"
            aria-pressed={mode === choice.mode}
            onClick={() => onChange(choice.mode)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '999px',
              border: `1px solid ${mode === choice.mode ? 'var(--gold-400)' : 'var(--border)'}`,
              background: mode === choice.mode ? 'rgba(212,160,23,0.12)' : 'var(--surface)',
              color: mode === choice.mode ? 'var(--gold-400)' : 'var(--ash-300)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {choice.mode === 'consumer' ? 'Personal shopping · max 9' : 'Retail / bulk · min 10'}
          </button>
        ))}
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
              onClick={() => onChange(choice.mode)}
              style={{
                minHeight: '180px',
                padding: '1.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border-gold)',
                background: 'var(--surface)',
                color: 'var(--heading)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 180ms ease, border-color 180ms ease',
              }}
              onMouseEnter={(event) => { event.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(event) => { event.currentTarget.style.transform = 'none'; }}
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
