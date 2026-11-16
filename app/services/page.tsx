import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';

const services = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Laptop Repair',
    description: 'Comprehensive diagnostics and repair for all laptop brands. We identify and fix hardware faults, component failures, and system errors quickly and professionally.',
    features: ['Free diagnostic check', 'All major brands', 'Genuine parts used', '90-day repair warranty'],
    price: 'From ₦5,000',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'General Laptop Repair',
    description: 'From cracked screens and broken keyboards to charging port replacements and hinge repairs — our technicians handle all physical laptop damage.',
    features: ['Screen replacement', 'Keyboard repair', 'Charging port fix', 'Hinge & casing repair'],
    price: 'From ₦8,000',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'OS Installation',
    description: 'Fresh Windows, Linux, or macOS installation with all necessary drivers, updates, and essential software pre-configured for you.',
    features: ['Windows 10 & 11', 'Ubuntu / Linux Mint', 'Driver installation', 'Software setup'],
    price: 'From ₦5,000',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 10h16M4 14h8" />
        <rect x="2" y="3" width="20" height="18" rx="2" />
      </svg>
    ),
    title: 'RAM & Memory Upgrades',
    description: 'Dramatically improve your laptop\'s speed and multitasking capability with a professional RAM upgrade or SSD installation service.',
    features: ['RAM upgrade (8GB to 32GB)', 'SSD installation', 'Data migration included', 'Before/after benchmark'],
    price: 'From ₦15,000',
  },
];

const steps = [
  { step: '01', title: 'Drop Off', desc: 'Bring your device to our Ikeja store or reach us on WhatsApp to schedule.' },
  { step: '02', title: 'Diagnose', desc: 'We run a thorough diagnostic check — completely free of charge.' },
  { step: '03', title: 'Repair', desc: 'Our certified technicians fix your device using quality parts.' },
  { step: '04', title: 'Pick Up', desc: 'Collect your repaired device, fully tested and ready to use.' },
];

export default function ServicesPage() {
  return (
    <>

      <section
        style={{
          position: 'relative',
          padding: '5rem 0 4rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1400&q=80"
            alt=""
            aria-hidden
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.12)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(14,15,17,0.98) 45%, transparent 100%)' }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection style={{ maxWidth: '640px' }}>
            <div className="section-label">What we offer</div>
            <h1 className="section-heading">Professional Repair Services</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '1rem', fontSize: '1rem', lineHeight: 1.7 }}>
              Expert laptop repairs and upgrades by certified technicians at our Ikeja workshop. Fast turnaround, quality guaranteed.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button href="https://wa.me/2348030841357" size="lg">Book a Repair</Button>
              <Button href="/contact" variant="outline" size="lg">Call Us</Button>
            </div>
          </AnimatedSection>
        </div>
      </section>


      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {services.map((service, i) => (
              <AnimatedSection key={service.title} delay={i * 90}>
                <div
                  className="card"
                  style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{
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
                  }}>
                    {service.icon}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                    {service.title}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ash-400)', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 }}>
                    {service.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {service.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--ash-300)' }}>
                        <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--gold-400)' }}>
                      {service.price}
                    </span>
                    <Button size="sm" href="https://wa.me/2348030841357" variant="secondary">
                      Book Now
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>


      <section className="section" style={{ background: 'var(--ash-900)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <AnimatedSection style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>The process</div>
            <h2 className="section-heading" style={{ textAlign: 'center' }}>How It Works</h2>
          </AnimatedSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {steps.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 80} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--gold-400)',
                  }}
                >
                  {step.step}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ash-400)', lineHeight: 1.6 }}>{step.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
