'use client';

import { useRef, useState, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, Search, LogOut, Settings, X, ChevronDown, Globe } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { usePathname, useRouter } from 'next/navigation';
import { adminApi, setApiLocale, getApiLocale } from '@/lib/admin/api';

const CRUMBS: Record<string, string[]> = {
  '/admin/dashboard':    ['Dashboard'],
  '/admin/coffee':       ['Catalogue', 'Coffee & Capsules'],
  '/admin/machines':     ['Catalogue', 'Machines'],
  '/admin/accessories':  ['Catalogue', 'Accessories'],
  '/admin/sweets':       ['Catalogue', 'Treats & Sweets'],
  '/admin/categories':   ['Setup', 'Categories'],
  '/admin/brands':       ['Setup', 'Brands'],
  '/admin/tags':         ['Setup', 'Tags'],
  '/admin/orders':       ['Commerce', 'Orders'],
  '/admin/inventory':    ['Commerce', 'Inventory'],
  '/admin/promos':       ['Commerce', 'Promotions'],
  '/admin/delivery':     ['Commerce', 'Delivery'],
  '/admin/blog':         ['Content', 'Blog'],
  '/admin/testimonials': ['Content', 'Testimonials'],
  '/admin/banners':      ['Content', 'Banners'],
  '/admin/import-export':['Content', 'Import / Export'],
  '/admin/users':        ['Admin', 'Users'],
  '/admin/analytics':    ['Admin', 'Analytics'],
  '/admin/settings':     ['Admin', 'Settings'],
};

const LOCALES = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷', short: 'FR' },
  { code: 'en', label: 'English',   flag: '🇬🇧', short: 'EN' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪', short: 'DE' },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺', short: 'RU' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', short: 'NL' },
];

interface Props {
  onMobileMenu: () => void;
}

export function AdminTopBar({ onMobileMenu }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { toggleSidebar, darkMode, toggleDarkMode, user, logout } = useAdminStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [locale, setLocale]         = useState(getApiLocale());
  const [localeOpen, setLocaleOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const localeRef = useRef<HTMLDivElement>(null);

  const base   = '/' + pathname.split('/').slice(1, 3).join('/');
  const crumbs = CRUMBS[base] ?? ['Admin'];
  const currentLocale = LOCALES.find(l => l.code === locale) ?? LOCALES[0];

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // CMD+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setLocaleOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close locale dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
        setLocaleOpen(false);
      }
    };
    if (localeOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [localeOpen]);

  // Restore persisted locale on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cafrezzo-locale') : null;
    if (saved) { setApiLocale(saved); setLocale(saved); }
  }, []);

  const handleLocale = (code: string) => {
    setApiLocale(code);
    setLocale(code);
    setLocaleOpen(false);
    if (typeof window !== 'undefined') localStorage.setItem('cafrezzo-locale', code);
  };

  const handleLogout = async () => {
    try { await adminApi.auth.logout(); } catch { /* ignore */ }
    logout();
    router.push('/admin/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <header className="admin-topbar">
      {/* Single burger menu — toggleSidebar on desktop, onMobileMenu on mobile */}
      <button
        className="admin-topbar-toggle"
        onClick={isMobile ? onMobileMenu : toggleSidebar}
        aria-label={isMobile ? 'Open menu' : 'Toggle sidebar'}
      >
        <Menu size={17} />
      </button>

      {/* Separator — desktop only */}
      {!isMobile && <div className="admin-topbar-sep" />}

      {/* Breadcrumb — desktop only */}
      {!isMobile && (
        <nav className="admin-breadcrumb" style={{ display: 'flex' }}>
          {crumbs.map((c, i) => (
            <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ color: 'var(--a-border-2)', padding: '0 2px' }}>/</span>}
              <span style={{
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
                color: i === crumbs.length - 1 ? 'var(--a-text)' : 'var(--a-text-muted)',
                fontSize: 13,
              }}>
                {c}
              </span>
            </span>
          ))}
        </nav>
      )}

      {/* Flex spacer + centered search */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <div
          className="admin-topbar-search"
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
        >
          <Search size={13} style={{ color: 'var(--a-text-dim)', flexShrink: 0 }} />
          {searchOpen ? (
            <input
              ref={searchRef}
              className="admin-topbar-search-input"
              placeholder="Search pages, products, orders…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onBlur={() => { if (!searchVal) setSearchOpen(false); }}
              autoFocus
            />
          ) : (
            <span className="admin-topbar-search-hint">
              Search <kbd className="admin-topbar-kbd">⌘K</kbd>
            </span>
          )}
          {searchOpen && searchVal && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--a-text-dim)', display: 'flex' }}
              onClick={(e) => { e.stopPropagation(); setSearchVal(''); setSearchOpen(false); }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Right actions ───────────────────────────────────────────────────── */}
      <div className="admin-topbar-actions">

        {/* Locale dropdown */}
        {!isMobile && (
          <div ref={localeRef} style={{ position: 'relative' }}>
            <button
              className="admin-topbar-btn"
              onClick={() => setLocaleOpen(!localeOpen)}
              title="Change language"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 10,
                fontSize: 13, fontWeight: 500,
                background: localeOpen ? 'var(--a-surface-2)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{currentLocale.flag}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{currentLocale.short}</span>
              <ChevronDown size={12} style={{
                transition: 'transform 0.2s',
                transform: localeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.5,
              }} />
            </button>

            {localeOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--a-surface)', border: '1px solid var(--a-border)',
                borderRadius: 14, padding: '6px 0', minWidth: 170,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                zIndex: 300, overflow: 'hidden',
              }}>
                {LOCALES.map(({ code, flag, label, short }) => (
                  <button
                    key={code}
                    onClick={() => handleLocale(code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 14px', border: 'none',
                      background: locale === code ? 'var(--a-green-light)' : 'transparent',
                      cursor: 'pointer', fontSize: 13, color: 'var(--a-text)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (locale !== code) (e.currentTarget as HTMLElement).style.background = 'var(--a-surface-2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = locale === code ? 'var(--a-green-light)' : 'transparent';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{flag}</span>
                    <span style={{ flex: 1, fontWeight: locale === code ? 600 : 400 }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--a-text-dim)', fontWeight: 600 }}>{short}</span>
                    {locale === code && (
                      <span style={{ color: 'var(--a-green)', fontSize: 14, marginLeft: 2 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isMobile && <div className="admin-topbar-sep" />}

        {/* Theme */}
        <button
          className={`admin-topbar-btn${darkMode ? ' active-theme' : ''}`}
          onClick={toggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button className="admin-topbar-btn" title="Notifications">
          <Bell size={15} />
          <span className="admin-topbar-notif-dot" />
        </button>

        {/* Settings shortcut */}
        <button
          className="admin-topbar-btn"
          onClick={() => router.push('/admin/settings')}
          title="Settings"
        >
          <Settings size={15} />
        </button>

        <div className="admin-topbar-sep" />

        {/* Avatar — navigates to settings, no popup */}
        {user && (
          <button
            className="admin-topbar-user"
            onClick={() => router.push('/admin/settings')}
            title={`${user.name} — Profile & Settings`}
          >
            <div className="admin-topbar-avatar">{initials}</div>
            {!isMobile && (
              <span className="admin-topbar-username">{user.name.split(' ')[0]}</span>
            )}
          </button>
        )}

        {/* Logout */}
        <button
          className="admin-topbar-btn"
          onClick={handleLogout}
          title="Sign out"
          style={{ color: 'var(--a-danger)' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
