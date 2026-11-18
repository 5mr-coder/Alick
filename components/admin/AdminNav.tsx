'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Laptop,
  Zap,
  ShoppingBag,
  Wrench,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Laptop },
  { label: 'Flash Sales & Hero', href: '/admin/flash-sales', icon: Zap },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Reviews & Inbox', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Store Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem =
    navItems.find((item) =>
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(item.href)
    ) ?? navItems[0];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const renderLinks = (onNavigate?: () => void) => (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        flex: 1,
      }}
    >
      {navItems.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.7rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: active ? 700 : 500,
              textDecoration: 'none',
              color: active ? 'var(--on-gold)' : 'var(--ash-300)',
              background: active ? 'var(--gold-400)' : 'transparent',
              transition: 'all 150ms ease',
            }}
          >
            <Icon size={17} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderFooterActions = (onNavigate?: () => void) => (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <Link
        href="/"
        onClick={onNavigate}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--gold-400)',
          textDecoration: 'none',
          border: '1px solid var(--border-gold)',
          background: 'rgba(245, 200, 66, 0.08)',
        }}
      >
        <ExternalLink size={15} />
        View Live Store
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--danger)',
          background: 'transparent',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <LogOut size={15} />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      <div className="admin-mobile-bar">
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--heading)',
              lineHeight: 1.1,
            }}
          >
            Alick <span style={{ color: 'var(--gold-400)' }}>Admin</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
            {activeItem.label}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            href="/"
            style={{
              padding: '0.45rem 0.7rem',
              borderRadius: '8px',
              border: '1px solid var(--border-gold)',
              color: 'var(--gold-400)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Live Store
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--heading)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          role="presentation"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              background: 'var(--ash-900)',
              borderRight: '1px solid var(--border)',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--heading)',
                  }}
                >
                  Alick <span style={{ color: 'var(--gold-400)' }}>Admin</span>
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--ash-400)',
                    wordBreak: 'break-all',
                  }}
                >
                  {userEmail}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--heading)',
                  cursor: 'pointer',
                  padding: '0.35rem',
                }}
              >
                <X size={20} />
              </button>
            </div>
            {renderLinks(() => setMobileOpen(false))}
            {renderFooterActions(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      <aside
        style={{
          width: '255px',
          flexShrink: 0,
          background: 'var(--ash-900)',
          borderRight: '1px solid var(--border)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minHeight: '100vh',
        }}
        className="admin-sidebar"
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--heading)',
            }}
          >
            Alick <span style={{ color: 'var(--gold-400)' }}>Admin</span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--ash-400)',
              marginTop: '0.25rem',
              wordBreak: 'break-all',
            }}
          >
            {userEmail}
          </div>
        </div>

        {renderLinks()}
        {renderFooterActions()}
      </aside>
    </>
  );
}
