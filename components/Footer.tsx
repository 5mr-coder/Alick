'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import type { PublicSiteSettings } from '@/types';

const footerLinks = {
  Shop: [
    { label: 'Laptops', href: '/products' },
    { label: 'Desktops', href: '/desktops' },
    { label: 'Smart Gadgets', href: '/smart-gadgets' },
    { label: 'Track Order', href: '/orders/track' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer({ settings }: { settings?: PublicSiteSettings }) {
  const year = new Date().getFullYear();
  const siteName = settings?.site_name || 'Alick System Services';
  const tagline = settings?.tagline || 'Smart Tech. Sharp Deals.';
  const address = settings?.address || '5 Obafemi Awolowo Way, Ikeja, Lagos';
  const phone = settings?.phone || '+234 803 084 1357';
  const email = settings?.email || 'alickmgt@gmail.com';
  const whatsappDigits =
    settings?.whatsapp_number?.replace(/\D/g, '') || '2348030841357';

  return (
    <footer
      style={{
        background: 'var(--ash-900)',
        borderTop: '1px solid var(--border)',
        paddingTop: '4rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="sm:col-span-2">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/logo.png"
                  alt={siteName}
                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    color: 'var(--heading)',
                    lineHeight: 1,
                  }}
                >
                  Alick
                </div>
                <span className="brand-tagline">System Services</span>
              </div>
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--ash-400)',
                lineHeight: 1.7,
                maxWidth: '280px',
                marginBottom: '1.25rem',
              }}
            >
              {tagline} Your trusted source for laptops, repairs, and gadgets in
              Lagos.
            </p>
            <div className="flex flex-col gap-2.5 text-[0.8125rem]" style={{ color: 'var(--ash-400)' }}>
              <div className="flex items-start gap-2">
                <MapPin size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-400)' }} aria-hidden="true" />
                <span>{address}</span>
              </div>
              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="footer-link inline-flex items-center gap-2 tabular-nums"
              >
                <Phone size={15} className="shrink-0" style={{ color: 'var(--gold-400)' }} aria-hidden="true" />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="footer-link inline-flex items-center gap-2"
              >
                <Mail size={15} className="shrink-0" style={{ color: 'var(--gold-400)' }} aria-hidden="true" />
                <span>{email}</span>
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-400)',
                  marginBottom: '1rem',
                }}
              >
                {group}
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--gold-400)',
                marginBottom: '1rem',
              }}
            >
              Quick Contact
            </h4>
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-wa-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--ash-500)' }}>
            © {year} {siteName}. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ash-500)' }}>
            {address}
          </p>
        </div>
      </div>
    </footer>
  );
}
