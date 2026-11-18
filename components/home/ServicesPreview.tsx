'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import type { Service } from '@/types';

export function ServiceIcon({ name }: { name?: string }) {
  switch (name) {
    case 'laptop':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'server':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
    case 'cpu':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 6h16M4 10h16M4 14h8" />
          <rect x="2" y="3" width="20" height="18" rx="2" />
        </svg>
      );
    case 'wrench':
    default:
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      );
  }
}

export default function ServicesPreview({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section className="section" style={{ background: 'var(--ash-950)' }}>
      <div className="container">
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            What we do
          </div>
          <h2 className="section-heading" style={{ textAlign: 'center' }}>
            Expert Repair Services
          </h2>
          <p
            style={{
              color: 'var(--ash-400)',
              maxWidth: '500px',
              margin: '1rem auto 0',
              fontSize: '0.9375rem',
            }}
          >
            Professional, fast, and reliable repairs by certified technicians
            right here in Ikeja, Lagos.
          </p>
        </AnimatedSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {services.slice(0, 4).map((service, i) => (
            <AnimatedSection key={service.id} delay={i * 80}>
              <div
                className="card"
                style={{ padding: '1.75rem', height: '100%' }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(212,160,23,0.4)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border)';
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'rgba(212,160,23,0.1)',
                    border: '1px solid rgba(212,160,23,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-400)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <ServiceIcon name={service.icon} />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--heading)',
                    marginBottom: '0.625rem',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--ash-400)',
                    lineHeight: 1.65,
                  }}
                >
                  {service.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Button href="/services" variant="secondary">
            View All Services
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
