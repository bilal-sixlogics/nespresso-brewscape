'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar }  from './AdminTopBar';
import { useAdminStore } from '@/store/adminStore';

const pageVariants: Variants = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

interface Props {
  children: React.ReactNode;
}

export function AdminShell({ children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, token, sidebarCollapsed, darkMode } = useAdminStore();
  const router   = useRouter();
  const pathname = usePathname();

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auth guard
  useEffect(() => {
    if (!token && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
    if (token && pathname === '/admin/login') {
      router.replace('/admin/dashboard');
    }
  }, [token, pathname, router]);

  if (!token && pathname !== '/admin/login') return null;
  if (token && pathname === '/admin/login') return null;

  // Login page renders without shell chrome
  if (pathname === '/admin/login') {
    return (
      <div className="admin-root" data-theme={darkMode ? 'dark' : undefined}>
        {children}
      </div>
    );
  }

  // On mobile, never offset the content — sidebar is overlay
  // Sidebar has 8px left margin + 8px visual spacing from the rounded container
  const sidebarW = isMobile ? 0 : (sidebarCollapsed ? (64 + 8) : (260 + 8));

  return (
    <div className="admin-root" data-theme={darkMode ? 'dark' : undefined}>
      <div className="admin-shell">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main content — offset by sidebar width on desktop only */}
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
