import { Check } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <>
      <section
        style={{
          padding: '5rem 0 3rem',
          background: 'var(--ash-900)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <AnimatedSection style={{ maxWidth: '600px' }}>
            <div className="section-label">Who we are</div>
            <h1 className="section-heading">About Us</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '0.75rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>
              Our story, our mission, and why customers trust us with their laptops.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <AnimatedSection>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--heading)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                About Us – Alick System Services
              </h1>

              <p style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem', marginBottom: '1.5rem' }}>
                Welcome to Alick System Services – Your Trusted Laptop Partner.
              </p>

              <p style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem', marginBottom: '1.5rem' }}>
                At Alick System Services, we are committed to providing quality, affordable, and reliable computing solutions to individuals, businesses, students, and professionals.
              </p>

              <p style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem', marginBottom: '1.5rem' }}>
                We specialize in the importation, sales, and repair of UK and USA-used laptops, offering a wide range of reliable devices from leading brands such as HP, Dell, and Lenovo.
              </p>

              <p style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem', marginBottom: '1.5rem' }}>
                Our mission is to make quality technology accessible and affordable to everyone by providing dependable laptops and professional technical services at competitive prices.
              </p>

              <p style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem', marginBottom: '1.5rem' }}>
                We believe that every customer deserves value for money, excellent service, and a satisfying shopping experience. That is why we are dedicated to building lasting relationships with our customers through honesty, professionalism, and customer satisfaction.
              </p>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--heading)', marginTop: '2rem', marginBottom: '1rem' }}>
                Why Choose Alick System Services?
              </h2>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Quality UK and USA-used laptops.',
                  'Affordable and competitive prices.',
                  'Professional laptop repairs and technical support.',
                  'Wide selection of HP, Dell, and Lenovo laptops.',
                  'Customer-focused service and satisfaction.',
                  'Reliable solutions for students, individuals, and businesses.',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ash-300)', lineHeight: 1.7, fontSize: '1.0625rem' }}>
                    <Check size={17} style={{ color: 'var(--gold-400)', flexShrink: 0 }} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--heading)', marginTop: '2rem', marginBottom: '1rem' }}>
                Our Location
              </h2>

              <p style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem', marginBottom: '2rem' }}>
                No. 5 Awolowo Way, opposite Ikeja Local Government, Computer Village, Lagos, Nigeria.
              </p>

              <div
                style={{
                  padding: '2rem',
                  borderRadius: '12px',
                  background: 'rgba(245,200,66,0.08)',
                  border: '1px solid rgba(245,200,66,0.3)',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--gold-400)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', margin: 0, lineHeight: 1.6 }}>
                  Alick System Services – Quality Laptops, Reliable Services, Customer Satisfaction.
                </p>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button href="/products" size="lg">
                  Shop Laptops
                </Button>
                <Button href="/services" variant="outline" size="lg">
                  Book a Repair
                </Button>
                <Button href="/contact" variant="ghost" size="lg">
                  Contact Us
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
