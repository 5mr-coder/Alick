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
      >
        {children}
      </main>
      <style>{`
        @media (max-width: 900px) {
          .admin-layout-root {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100% !important;
            min-height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
        }
      `}</style>
    </div>
  );
}
