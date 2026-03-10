'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Coffee, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { adminApi } from '@/lib/admin/api';
import { useAdminStore } from '@/store/adminStore';
import type { AdminUser } from '@/store/adminStore';

const DEMO = [
  { label: 'Super Admin', email: 'admin@cafrezzo.com',   password: 'Cafrezzo2024!', role: 'super_admin' },
  { label: 'Manager',     email: 'manager@cafrezzo.com', password: 'Manager2024!',  role: 'manager' },
];

const STATS = [
  { icon: TrendingUp,  value: '€24,891', label: 'Revenue this month' },
  { icon: ShoppingBag, value: '1,284',   label: 'Orders processed'   },
  { icon: Users,       value: '8,460',   label: 'Active customers'   },
];

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { setUser } = useAdminStore();
  const router      = useRouter();

  const submit = useCallback(async (em = email, pw = password) => {
    if (!em || !pw) { setError('Please enter email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.auth.login(em, pw) as { user: AdminUser; token: string };
      setUser(res.user, res.token);
      router.replace('/admin/dashboard');
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }, [email, password, setUser, router]);

  const demoLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    submit(em, pw);
  };

  return (
    <div className="admin-login-root">

      {/* ── Left visual panel ── */}
      <div className="admin-login-visual">
        <div className="admin-login-visual-bg" />

        {/* Decorative coffee ring circles */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: '8%', right: '-5%',
            width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(60,122,88,0.18) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', left: '-8%',
            width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(60,122,88,0.12) 0%, transparent 70%)',
          }} />
          {/* Floating coffee rings */}
          {[
            { top: '20%', left: '10%', size: 80, opacity: 0.08 },
            { top: '35%', left: '60%', size: 120, opacity: 0.06 },
            { top: '60%', left: '25%', size: 60,  opacity: 0.10 },
            { top: '75%', left: '70%', size: 90,  opacity: 0.07 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: c.top, left: c.left,
              width: c.size, height: c.size,
              borderRadius: '50%',
              border: `${c.size / 10}px solid rgba(255,255,255,${c.opacity})`,
            }} />
          ))}
          {/* Grid pattern */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="admin-login-visual-overlay" />

        {/* Content */}
        <div className="admin-login-visual-content">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #3C7A58, #2A5840)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(60,122,88,0.5)',
            }}>
              <Coffee size={22} color="white" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'white' }}>
              Cafrezzo
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 style={{
              fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em',
              color: 'white', lineHeight: 1.1, marginBottom: 16,
            }}>
              Manage your<br />
              <span style={{ color: '#4ADE80' }}>coffee empire</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 380 }}>
              Control products, orders, inventory and content from one powerful dashboard.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', gap: 24, marginTop: 44 }}
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 12, padding: '16px 20px',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon size={14} color="rgba(255,255,255,0.50)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                  {value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="admin-login-form-panel">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}
        >
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em',
              color: 'var(--a-text)', marginBottom: 6,
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: 'var(--a-text-muted)', lineHeight: 1.5 }}>
              Sign in to access the admin panel
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10, marginBottom: 20,
                background: 'var(--a-danger-bg)',
                border: '1px solid rgba(220,38,38,0.20)',
                color: 'var(--a-danger)', fontSize: 13.5,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="admin-label">Email address</label>
              <input
                type="email"
                className="admin-input"
                placeholder="admin@cafrezzo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="admin-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="admin-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--a-text-muted)', display: 'flex', padding: 4,
                  }}
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading}
              style={{ marginTop: 4, justifyContent: 'center', padding: '12px 20px', fontSize: 14, borderRadius: 10 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '28px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--a-border)' }} />
            <span style={{ fontSize: 11, color: 'var(--a-text-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Quick access
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--a-border)' }} />
          </div>

          {/* Demo logins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO.map((d) => (
              <button
                key={d.role}
                onClick={() => demoLogin(d.email, d.password)}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--a-surface-2)',
                  border: '1px solid var(--a-border)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  width: '100%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-green)'; e.currentTarget.style.background = 'var(--a-green-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--a-border)'; e.currentTarget.style.background = 'var(--a-surface-2)'; }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a-text)' }}>{d.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--a-text-muted)', fontFamily: 'monospace', marginTop: 1 }}>{d.email}</div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--a-text-dim)', flexShrink: 0 }} />
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--a-text-dim)', textAlign: 'center', marginTop: 28 }}>
            Cafrezzo Admin Panel — Authorized access only
          </p>
        </motion.div>
      </div>
    </div>
  );
}
