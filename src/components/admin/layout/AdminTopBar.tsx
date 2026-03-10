'use client';

import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { usePathname } from 'next/navigation';

const CRUMBS: Record<string, string[]> = {
  '/admin/dashboard':    ['Dashboard'],
  '/admin/coffee':       ['Catalog', 'Coffee & Capsules'],
  '/admin/machines':     ['Catalog', 'Machines'],
  '/admin/accessories':  ['Catalog', 'Accessories'],
  '/admin/sweets':       ['Catalog', 'Treats & Sweets'],
  '/admin/categories':   ['Catalog Setup', 'Categories'],
  '/admin/brands':       ['Catalog Setup', 'Brands'],
  '/admin/tags':         ['Catalog Setup', 'Tags'],
  '/admin/orders':       ['Commerce', 'Orders'],
  '/admin/inventory':    ['Commerce', 'Inventory'],
  '/admin/promos':       ['Commerce', 'Promotions'],
  '/admin/delivery':     ['Commerce', 'Delivery & Payment'],
  '/admin/blog':         ['Content', 'Blog Posts'],
  '/admin/testimonials': ['Content', 'Testimonials'],
  '/admin/banners':      ['Content', 'Site Banners'],
  '/admin/import-export':['Content', 'Import / Export'],
  '/admin/users':        ['Admin', 'Users'],
  '/admin/analytics':    ['Admin', 'Analytics'],
  '/admin/settings':     ['Admin', 'Settings'],
};

interface Props {
  onMobileMenu: () => void;
}

export function AdminTopBar({ onMobileMenu }: Props) {
  const pathname  = usePathname();
  const { toggleSidebar, darkMode, toggleDarkMode, user } = useAdminStore();

  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  const crumbs = CRUMBS[base] ?? ['Admin'];

  return (
    <header className="admin-topbar">
      {/* Sidebar toggle (desktop) */}
      <button
        className="admin-topbar-toggle hidden md:flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={17} />
      </button>

      {/* Mobile menu */}
      <button
        className="admin-topbar-toggle md:hidden"
        onClick={onMobileMenu}
        aria-label="Open menu"
      >
        <Menu size={17} />
      </button>

      {/* Breadcrumb */}
      <nav className="admin-breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c} className="flex items-center gap-1.5">
            {i > 0 && <span className="admin-breadcrumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'admin-breadcrumb-current' : ''}>
              {c}
            </span>
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="admin-topbar-actions">
        {/* Dark mode toggle */}
        <button
          className={`admin-topbar-btn ${darkMode ? 'active-theme' : ''}`}
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button className="admin-topbar-btn" aria-label="Notifications">
          <Bell size={15} />
          <span className="admin-topbar-notif-dot" />
        </button>

        {/* User chip */}
        {user && (
          <div className="admin-topbar-user">
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--a-green), #2A5840)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user.name[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)' }}>
              {user.name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
