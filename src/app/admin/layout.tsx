import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../../styles/admin.css';
import { AdminShell } from '@/components/admin/layout/AdminShell';

export const metadata: Metadata = {
  title: { default: 'Cafrezzo Admin', template: '%s — Cafrezzo Admin' },
  robots: { index: false, follow: false },
};

/**
 * Admin route group layout.
 * Completely independent from the public site — no Header, Footer, or public providers.
 * AdminShell handles auth guard, sidebar, topbar and page transitions.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
