'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar }  from './AdminTopBar';
import { useAdminStore } from '@/store/adminStore';

const pageVariants = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit:     { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

interface Props {
  children: React.ReactNode;
}

export function AdminShell({ children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, sidebarCollapsed, darkMode } = useAdminStore();
  const router   = useRouter();
  const pathname = usePathname();

  // Auth guard
  useEffect(() => {
    if (!token && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
    // Already logged in — skip login page
    if (token && pathname === '/admin/login') {
      router.replace('/admin/dashboard');
    }
  }, [token, pathname, router]);

  if (!token && pathname !== '/admin/login') return null;
  if (token && pathname === '/admin/login') return null; // redirecting

  // Login page renders without shell chrome
  if (pathname === '/admin/login') {
    return (
      <div className="admin-root" data-theme={darkMode ? 'dark' : undefined}>
        {children}
      </div>
    );
  }

  const sidebarW = sidebarCollapsed ? 64 : 260;

  return (
    <div className="admin-root" data-theme={darkMode ? 'dark' : undefined}>
      <div className="admin-shell">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main content — offset by sidebar width */}
        <div
          className="admin-content-wrap"
          style={{ marginLeft: sidebarW }}
        >
          <AdminTopBar onMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="admin-page-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
