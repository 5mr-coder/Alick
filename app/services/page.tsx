import { Check } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import SkeletonImage from '@/components/ui/SkeletonImage';
import { ServiceIcon } from '@/components/home/ServicesPreview';
import { getActiveServices, getPublicSiteSettings } from '@/lib/db/queries';
import { formatNaira } from '@/lib/utils';

export const revalidate = 60;

const steps = [
  {
    step: '01',
    title: 'Drop Off',
    desc: 'Bring your device to our Ikeja store or reach us on WhatsApp to schedule.',
  },
  {
    step: '02',
    title: 'Diagnose',
    desc: 'We run a thorough diagnostic check — completely free of charge.',
  },
  {
    step: '03',
    title: 'Repair',
    desc: 'Our certified technicians fix your device using quality parts.',
  },
  {
    step: '04',
    title: 'Pick Up',
    desc: 'Collect your repaired device, fully tested and ready to use.',
  },
];

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getActiveServices(),
    getPublicSiteSettings(),
  ]);

  const whatsappDigits =
    settings.whatsapp_number.replace(/\D/g, '') || '2348030841357';

  return (
    <>
      <section
        className="force-dark"
        style={{
          position: 'relative',
          padding: '5rem 0 4rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <SkeletonImage
            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1400&q=80"
            alt=""
            ariaHidden
            loading="eager"
            style={{ filter: 'brightness(0.12)' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(14,15,17,0.98) 45%, transparent 100%)',
            }}
          />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection style={{ maxWidth: '640px' }}>
            <div className="section-label">What we offer</div>
            <h1 className="section-heading" style={{ color: '#F8FAFC' }}>
              Professional Repair Services
            </h1>
            <p
              style={{
                color: 'var(--ash-400)',
                marginTop: '1rem',
                fontSize: '1rem',
                lineHeight: 1.7,
              }}
            >
              Expert laptop repairs and upgrades by certified technicians at our
              Ikeja workshop. Fast turnaround, quality guaranteed.
            </p>
            <div
              style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Button href={`https://wa.me/${whatsappDigits}`} size="lg">
                Book a Repair
              </Button>
              <Button
                href="/contact"
                variant="outline"
                size="lg"
                style={{ color: '#F8FAFC', borderColor: '#F8FAFC' }}
              >
                Contact Us
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <AnimatedSection key={service.id} delay={i * 90}>
                <div
                  className="card"
                  style={{
                    padding: '2rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--heading)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {service.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--ash-400)',
                      lineHeight: 1.7,
                      marginBottom: '1.5rem',
                      flex: 1,
                    }}
                  >
                    {service.description}
                  </p>
                  {service.turnaround && (
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--cyan-400)',
                        marginBottom: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Turnaround: {service.turnaround}
                    </p>
                  )}
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {service.features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8125rem',
                          color: 'var(--ash-300)',
                        }}
                      >
                        <Check
                          size={14}
                          style={{ color: 'var(--gold-400)', flexShrink: 0 }}
                          aria-hidden="true"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--gold-400)',
                      }}
                    >
                      {service.price_from !== null &&
                      service.price_from !== undefined
                        ? `From ${formatNaira(service.price_from)}`
                        : 'Free Quote'}
                    </span>
                    <Button
                      size="sm"
                      href={`/contact?service=${encodeURIComponent(service.slug)}`}
                      variant="secondary"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{
          background: 'var(--ash-900)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <AnimatedSection style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              The process
            </div>
            <h2 className="section-heading" style={{ textAlign: 'center' }}>
              How It Works
            </h2>
          </AnimatedSection>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {steps.map((step, i) => (
              <AnimatedSection
                key={step.step}
                delay={i * 80}
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(212,160,23,0.1)',
                    border: '1px solid rgba(212,160,23,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--gold-400)',
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--heading)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--ash-400)',
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
