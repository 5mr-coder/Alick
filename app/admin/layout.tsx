import type { ReactNode } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { requireAdminPage } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireAdminPage('/admin');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--ash-950)',
        color: 'var(--ash-100)',
      }}
      className="admin-layout-root"
    >
      <AdminNav userEmail={user.email ?? 'Admin'} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '2rem',
          maxWidth: '1280px',
        }}
        className="admin-main-content"
      >
        {children}
      </main>
      <style>{`
        .admin-mobile-bar {
          display: none;
        }
        @media (max-width: 900px) {
          .admin-layout-root {
            flex-direction: column;
          }
          .admin-sidebar {
            display: none !important;
          }
          .admin-mobile-bar {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            padding: 0.85rem 1.25rem;
            background: var(--ash-900);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 40;
          }
          .admin-main-content {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}
