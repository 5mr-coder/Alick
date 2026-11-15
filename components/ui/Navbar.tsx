"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'Home',          href: '/' },
  { label: 'Laptops',       href: '/products' },
  { label: 'Desktops',      href: '/desktops' },
  { label: 'Smart Gadgets', href: '/smart-gadgets' },
  { label: 'Services',      href: '/services' },
  { label: 'Reviews',       href: '/reviews' },
  { label: 'Blog',          href: '/blog' },
  { label: 'Contact',       href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const pathname                    = usePathname();
  const [hoveredPath, setHoveredPath] = useState(pathname);
  const { items, setIsCartOpen }    = useCart();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setHoveredPath(pathname);
  }, [pathname]);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'all 300ms ease',
          background: '#1E2028',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Alick System Services"
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                Alick
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  color: 'var(--gold-400)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                System Services
              </span>
            </div>
          </Link>


          <ul
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
            className="desktop-nav"
            onMouseLeave={() => setHoveredPath(pathname)}
          >
            {navLinks.map((link) => {
              const isActiveRoute = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const isHovered = hoveredPath === link.href || (hoveredPath === pathname && isActiveRoute);

              return (
                <li key={link.href} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Link
                    href={link.href}
                    onMouseEnter={() => setHoveredPath(link.href)}
                    style={{
                      display: 'block',
                      padding: '0.25rem 0',
                      fontSize: '0.875rem',
                      fontWeight: isActiveRoute ? 600 : 500,
                      textDecoration: 'none',
                      color: isActiveRoute ? 'var(--gold-400)' : (isHovered ? 'white' : '#D0D0D0'),
                      transition: 'all 250ms ease',
                      letterSpacing: '0.01em',
                      position: 'relative',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                  >
                    {link.label}


                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isHovered || isActiveRoute ? '100%' : '0%',
                        height: '2px',
                        background: 'var(--gold-400)',
                        transition: 'width 250ms ease',
                        borderRadius: '2px',
                      }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>


          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                                  background: 'rgba(245,200,66,0.1)',
                border: '1px solid rgba(245,200,66,0.25)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--gold-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
              }}
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--gold-400)',
                    color: '#0F0F0F',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

                          <Link
              href="/contact"
              style={{
                padding: '0.5rem 1.125rem',
                background: 'var(--gold-400)',
                color: '#0F0F0F',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Get in Touch
            </Link>
          </div>


          <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="mobile-nav-actions">
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                                  background: 'rgba(245,200,66,0.1)',
                border: '1px solid rgba(245,200,66,0.25)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--gold-400)',
                display: 'flex',
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--gold-400)',
                    color: '#0F0F0F',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: 'white',
              }}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>


        {menuOpen && (
          <div
            style={{
              background: '#1E2028',
              borderTop: '1px solid rgba(245,200,66,0.35)',
              padding: '1rem 1.5rem 1.5rem',
            }}
          >
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: active ? 600 : 500,
                        textDecoration: 'none',
                        color: active ? '#0F0F0F' : '#D0D0D0',
                        background: active ? 'var(--gold-400)' : 'transparent',
                        borderLeft: active ? 'none' : '2px solid transparent',
                        transition: 'all 200ms ease',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li style={{ marginTop: '0.75rem' }}>
                <Link
                  href="/contact"
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    background: 'var(--gold-400)',
                    color: '#0F0F0F',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-actions {
            display: flex !important;
          }
        }
      `}} />
    </>
  );
}
