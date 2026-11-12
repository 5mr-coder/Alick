'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Replace with: await submitContactMessage(form);
      await new Promise((r) => setTimeout(r, 1200));
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--ash-800)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'white',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 200ms ease',
    fontFamily: 'var(--font-body)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--ash-300)',
    marginBottom: '0.375rem',
  };

  return (
    <>
      {/* Header */}
      <section style={{ padding: '5rem 0 3rem', background: 'var(--ash-900)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <AnimatedSection style={{ maxWidth: '560px' }}>
            <div className="section-label">Get in touch</div>
            <h1 className="section-heading">Contact Us</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '0.75rem', fontSize: '0.9375rem' }}>
              Visit our store in Ikeja, send us a message, or reach us instantly on WhatsApp.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '3rem', alignItems: 'start' }}>

            {/* Info column */}
            <AnimatedSection direction="right">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  {
                    icon: '📍',
                    title: 'Visit Our Store',
                    lines: ['5 Obafemi Awolowo Way,', 'Ikeja, Lagos, 101233', 'Nigeria'],
                  },
                  {
                    icon: '📞',
                    title: 'Call or WhatsApp',
                    lines: ['+234 803 084 1357'],
                  },
                  {
                    icon: '✉️',
                    title: 'Email Us',
                    lines: ['alickmgt@gmail.com'],
                  },
                  {
                    icon: '🕐',
                    title: 'Opening Hours',
                    lines: ['Mon – Sat: 9:00 AM – 6:00 PM', 'Sunday: 12:00 PM – 4:00 PM'],
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="card"
                    style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                  >
                    <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                        {item.title}
                      </div>
                      {item.lines.map((line) => (
                        <div key={line} style={{ fontSize: '0.9rem', color: 'var(--ash-300)' }}>{line}</div>
                      ))}
                    </div>
                  </div>
                ))}

                <a
                  href="https://wa.me/2348030841357"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    background: 'var(--cyan-400)',
                    color: '#0b1a23',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    transition: 'all 250ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px var(--cyan-glow)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Message us on WhatsApp
                </a>

                {/* Google Maps Embed */}
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.3523025!2d3.3372!3d6.6018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b923b5e54df01%3A0x5b3e96b9b29f8f6b!2s5%20Obafemi%20Awolowo%20Way%2C%20Ikeja%2C%20Lagos!5e0!3m2!1sen!2sng!4v1699999999999!5m2!1sen!2sng"
                    width="100%"
                    height="240"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Alick System Services Location"
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Form column */}
            <AnimatedSection direction="left">
              <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
                  Send a Message
                </h2>

                {status === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Message Sent!</h3>
                    <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem' }}>We&apos;ll get back to you within 24 hours.</p>
                    <button onClick={() => setStatus('idle')} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer', fontWeight: 600 }}>
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input required style={inputStyle} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')} />
                      </div>
                      <div>
                        <label style={labelStyle}>Phone</label>
                        <input style={inputStyle} placeholder="+234..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" style={inputStyle} placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')} />
                    </div>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <input style={inputStyle} placeholder="e.g. Laptop repair enquiry" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')} />
                    </div>
                    <div>
                      <label style={labelStyle}>Message *</label>
                      <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} placeholder="Tell us what you need..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')} />
                    </div>
                    {status === 'error' && (
                      <p style={{ color: 'var(--cyan-400)', fontSize: '0.875rem' }}>Something went wrong. Please try again or WhatsApp us directly.</p>
                    )}
                    <Button type="submit" size="lg" loading={status === 'loading'}>
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
