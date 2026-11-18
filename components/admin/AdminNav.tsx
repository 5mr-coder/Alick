'use client';

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
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Laptop },
  { label: 'Flash Sales & Hero', href: '/admin/flash-sales', icon: Zap },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Reviews & Messages', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      style={{
        width: '250px',
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
            fontSize: '1.2rem',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                textDecoration: 'none',
                color: active ? 'var(--on-gold)' : 'var(--ash-300)',
                background: active ? 'var(--gold-400)' : 'transparent',
                transition: 'all 150ms ease',
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.825rem',
            color: 'var(--ash-300)',
            textDecoration: 'none',
            border: '1px solid var(--border)',
          }}
        >
          <ExternalLink size={15} />
          View Storefront
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.825rem',
            color: 'var(--danger)',
            background: 'transparent',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
