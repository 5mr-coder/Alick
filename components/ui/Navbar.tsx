"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { SunMoonThemeToggle } from './sun-moon-theme-toggle';

const navLinks = [
  { label: 'Laptops',       href: '/products' },
  { label: 'Desktops',      href: '/desktops' },
  { label: 'Smart Gadgets', href: '/smart-gadgets' },
  { label: 'Services',      href: '/services' },
  { label: 'Reviews',       href: '/reviews' },
  { label: 'Blog',          href: '/blog' },
  { label: 'About',         href: '/about' },
];

const mobileNavLinks = [
  { label: 'Home',          href: '/' },
  ...navLinks,
  { label: 'Track Order',   href: '/orders/track' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const pathname                    = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [hoveredPath, setHoveredPath] = useState(pathname);
  const { items, setIsCartOpen }    = useCart();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setHoveredPath(pathname);
  }

  const cartBadge = (
    <span
      className="tabular-nums"
      style={{
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        background: 'var(--gold-400)',
        color: 'var(--on-gold)',
        borderRadius: '999px',
        minWidth: '18px',
        height: '18px',
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        fontWeight: 700,
      }}
    >
      {cartCount}
    </span>
  );

  return (
    <>
      <nav
        className="header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'background-color 220ms var(--ease-out), border-color 220ms var(--ease-out)',
          background: 'var(--header-background)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          borderBottom: '1px solid var(--header-border)',
          boxShadow: '0 1px 0 var(--header-border), 0 8px 24px rgba(0,0,0,0.16)',
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

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid var(--header-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src="/logo.png"
                alt="Alick System Services"
                style={{ width: '30px', height: '30px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--header-foreground)',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                Alick
              </span>
              <span className="brand-tagline">System Services</span>
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
                      color: isActiveRoute ? 'var(--gold-400)' : (isHovered ? 'var(--header-foreground)' : 'var(--header-muted)'),
                      transition: 'color 180ms var(--ease-out)',
                      letterSpacing: '0.01em',
                      position: 'relative',
                      WebkitTapHighlightColor: 'transparent',
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
                        transition: 'width 200ms var(--ease-out)',
                        borderRadius: '2px',
                      }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>


          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            <SunMoonThemeToggle storageKey="adammant-theme" size={40} sky duration={900} />

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
              {cartCount > 0 && cartBadge}
            </button>

            <Link
              href="/contact"
              style={{
                padding: '0.5rem 1.125rem',
                background: 'var(--gold-fill)',
                color: 'var(--on-gold-fill)',
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
            <SunMoonThemeToggle storageKey="adammant-theme" size={44} sky duration={900} />
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
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && cartBadge}
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: 'var(--header-foreground)',
              }}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
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
              background: 'var(--header-background)',
              borderTop: '1px solid var(--header-border)',
              padding: '1rem 1.5rem 1.5rem',
              maxHeight: 'calc(100dvh - 72px)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {mobileNavLinks.map((link) => {
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
                        color: active ? 'var(--on-gold)' : 'var(--header-muted)',
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
                    background: 'var(--gold-fill)',
                    color: 'var(--on-gold-fill)',
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
        @media (max-width: 1200px) and (min-width: 1025px) {
          ul.desktop-nav {
            gap: 0.85rem !important;
          }
        }
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
