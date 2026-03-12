'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Coffee, Cpu, Wrench, Cake,
  Tag, FolderOpen, Award, ShoppingCart, Users,
  BarChart3, Settings, LogOut, FileText,
  Package, ArrowUpDown, ChevronRight, X,
  Megaphone, Star, Truck, Percent,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { adminApi } from '@/lib/admin/api';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard',    href: '/admin/dashboard',   icon: LayoutDashboard },
      { label: 'Analytics',    href: '/admin/analytics',   icon: BarChart3 },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { label: 'Coffee & Capsules', href: '/admin/coffee',      icon: Coffee },
      { label: 'Machines',          href: '/admin/machines',    icon: Cpu },
      { label: 'Treats & Sweets',   href: '/admin/sweets',      icon: Cake },
      { label: 'Accessories',       href: '/admin/accessories', icon: Wrench },
      { label: 'Categories',        href: '/admin/categories',  icon: FolderOpen },
      { label: 'Brands',            href: '/admin/brands',      icon: Award },
      { label: 'Tags',              href: '/admin/tags',         icon: Tag },
    ],
  },
  {
    group: 'Store',
    items: [
      { label: 'Orders',         href: '/admin/orders',    icon: ShoppingCart },
      { label: 'Inventory',      href: '/admin/inventory', icon: Package },
      { label: 'Promotions',     href: '/admin/promos',    icon: Percent },
      { label: 'Delivery & Pay', href: '/admin/delivery',  icon: Truck },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Blog Posts',    href: '/admin/blog',          icon: FileText },
      { label: 'Banners',       href: '/admin/banners',       icon: Megaphone },
      { label: 'Testimonials',  href: '/admin/testimonials',  icon: Star },
      { label: 'Import/Export', href: '/admin/import-export', icon: ArrowUpDown },
    ],
  },
  {
    group: 'Admin',
    items: [
      { label: 'Users',    href: '/admin/users',    icon: Users },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

interface Props {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, sidebarCollapsed, logout } = useAdminStore();

  const handleLogout = async () => {
    try { await adminApi.auth.logout(); } catch { /* ignore */ }
    logout();
    router.push('/admin/login');
  };

  const isActive = (href: string) =>
    href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <nav
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 200 }}
      >
        {/* Brand header */}
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <Coffee size={17} color="white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                className="admin-brand-name"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                Cafrezzo
              </motion.span>
            )}
          </AnimatePresence>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              className="admin-topbar-btn ml-auto md:hidden"
              onClick={onMobileClose}
              aria-label="Close menu"
              style={{ marginLeft: 'auto' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav scroll */}
        <div className="admin-nav-scroll">
          {NAV.map((group) => (
            <div key={group.group}>
              <div className="admin-nav-group-label">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-item ${active ? 'active' : ''}`}
                    onClick={onMobileClose}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="admin-nav-icon" />
                    <span className="admin-nav-label">{item.label}</span>
                    {item.badge ? (
                      <span className="admin-nav-badge">{item.badge}</span>
                    ) : null}
                    {active && !sidebarCollapsed && (
                      <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.45 }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {(user?.name?.[0] ?? 'A').toUpperCase()}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  className="admin-sidebar-user-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="admin-sidebar-user-name">{user?.name ?? 'Admin'}</div>
                  <div className="admin-sidebar-user-role">{user?.role ?? 'Administrator'}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="admin-nav-item w-full mt-1"
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} className="admin-nav-icon" style={{ color: 'var(--a-danger)' }} />
            {!sidebarCollapsed && (
              <span className="admin-nav-label" style={{ color: 'var(--a-danger)' }}>Sign out</span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
