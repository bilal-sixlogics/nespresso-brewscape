'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Globe, Store, Percent, Bell, Database, Loader2,
  CheckCircle2, AlertCircle, User, Lock, Shield, Clock,
  Camera, Mail, Phone, MapPin, Calendar, Monitor,
  Eye, EyeOff, KeyRound,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { adminApi } from '@/lib/admin/api';
import { useAdminStore } from '@/store/adminStore';

// ── Types ───────────────────────────────────────────────────────────────────

interface SettingItem {
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
}

type SettingsMap = Record<string, string>;
type RawGroup = Record<string, SettingItem[]>;

// ── Section config ──────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',  label: 'My Profile',     icon: User },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'store',    label: 'Store',           icon: Store },
  { id: 'tax',      label: 'Tax / VAT',       icon: Percent },
  { id: 'locale',   label: 'Locale',          icon: Globe },
  { id: 'notifs',   label: 'Notifications',   icon: Bell },
  { id: 'advanced', label: 'Advanced',        icon: Database },
];

// ── Card wrapper ────────────────────────────────────────────────────────────

function SettingsCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      className="admin-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [section, setSection]     = useState('profile');
  const [settings, setSettings]   = useState<SettingsMap>({});
  const [rawItems, setRawItems]   = useState<SettingItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [apiError, setApiError]   = useState('');
  const [savedMsg, setSavedMsg]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const raw = await adminApi.settings.get() as RawGroup;
      const flat: SettingsMap = {};
      const items: SettingItem[] = [];
      Object.values(raw).forEach((group) => {
        (group as SettingItem[]).forEach((item) => {
          flat[item.key] = item.value ?? '';
          items.push(item);
        });
      });
      setSettings(flat);
      setRawItems(items);
    } catch (e) {
      setApiError((e as Error).message ?? 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setApiError('');
    setSavedMsg('');
    try {
      const payload = rawItems.map((item) => ({
        ...item,
        value: settings[item.key] ?? item.value,
      }));
      await adminApi.settings.update(payload);
      setSavedMsg('Settings saved successfully');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (e) {
      setApiError((e as Error).message ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showSaveBtn = section !== 'profile' && section !== 'password';

  return (
    <>
      <AdminPageHeader
        title="Settings"
        subtitle="Manage your profile, store configuration, and preferences."
        actions={
          showSaveBtn ? (
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
              ) : savedMsg ? (
                <><CheckCircle2 size={14} /> Saved!</>
              ) : (
                <><Save size={14} /> Save Changes</>
              )}
            </button>
          ) : undefined
        }
      />

      {apiError && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 14px', borderRadius: 12,
          background: 'var(--a-danger-bg)', border: '1px solid rgba(224,82,82,0.20)',
          marginBottom: 16, color: 'var(--a-danger)', fontSize: 13,
        }}>
          <AlertCircle size={14} />
          {apiError}
          <button onClick={load} style={{
            marginLeft: 'auto', fontSize: 12, textDecoration: 'underline',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--a-danger)',
          }}>Retry</button>
        </div>
      )}

      {savedMsg && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 14px', borderRadius: 12,
          background: 'var(--a-success-bg)', border: '1px solid rgba(26,154,92,0.20)',
          marginBottom: 16, color: 'var(--a-success)', fontSize: 13,
        }}>
          <CheckCircle2 size={14} />
          {savedMsg}
        </div>
      )}

      <div className="admin-grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Section sidebar */}
        <motion.div
          className="admin-card"
          style={{ padding: 10, height: 'fit-content', position: 'sticky', top: 24 }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 12,
                width: '100%', border: 'none', cursor: 'pointer',
                background: section === id ? 'var(--a-accent-light)' : 'transparent',
                color: section === id ? 'var(--a-accent)' : 'var(--a-text-muted)',
                fontWeight: section === id ? 600 : 500,
                fontSize: 13.5,
                transition: 'all 0.15s',
                marginBottom: 2,
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Section content */}
        <div>
          {loading && section !== 'profile' && section !== 'password' ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 300, gap: 10, color: 'var(--a-text-muted)',
            }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Loading settings…
            </div>
          ) : (
            <>
              {section === 'profile'  && <ProfileSection />}
              {section === 'password' && <PasswordSection />}
              {section === 'store'    && <StoreSection    s={settings} set={set} />}
              {section === 'tax'      && <TaxSection      s={settings} set={set} />}
              {section === 'locale'   && <LocaleSection   s={settings} set={set} />}
              {section === 'notifs'   && <NotifsSection   s={settings} set={set} />}
              {section === 'advanced' && <AdvancedSection  s={settings} set={set} />}
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ── Shared helpers ──────────────────────────────────────────────────────────

interface SectionProps { s: SettingsMap; set: (k: string, v: string) => void; }

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: 'var(--a-text-muted)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--a-text-dim)', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 11, position: 'relative',
        cursor: 'pointer',
        background: on ? 'var(--a-green)' : 'var(--a-surface-3)',
        border: `1px solid ${on ? 'var(--a-green)' : 'var(--a-border-2)'}`,
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  );
}

// ── Profile Section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const { user } = useAdminStore();
  const [name, setName]     = useState(user?.name ?? '');
  const [email, setEmail]   = useState(user?.email ?? '');
  const [phone, setPhone]   = useState('');
  const [bio, setBio]       = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const loginHistory = [
    { date: '2026-03-12 09:15', device: 'Chrome on macOS', ip: '192.168.1.***', icon: Monitor },
    { date: '2026-03-11 14:22', device: 'Safari on iPhone', ip: '10.0.0.***', icon: Phone },
    { date: '2026-03-10 08:45', device: 'Chrome on macOS', ip: '192.168.1.***', icon: Monitor },
    { date: '2026-03-08 16:30', device: 'Firefox on Windows', ip: '172.16.0.***', icon: Monitor },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile Card */}
      <SettingsCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--a-accent), var(--a-accent-hover))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              boxShadow: '0 8px 24px rgba(232,115,74,0.25)',
              letterSpacing: '-0.02em',
            }}>
              {initials}
            </div>
            <button style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--a-surface)', border: '2px solid var(--a-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--a-text-muted)',
              boxShadow: 'var(--a-shadow-sm)',
            }}>
              <Camera size={12} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--a-text)', letterSpacing: '-0.02em' }}>
              {user?.name ?? 'Admin User'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--a-text-muted)', marginTop: 2 }}>
              {user?.email ?? 'admin@cafrezzo.com'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span style={{
                padding: '4px 10px', borderRadius: 8,
                background: 'var(--a-green-light)', color: 'var(--a-green)',
                fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
              }}>
                <Shield size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                {user?.role?.replace('_', ' ') ?? 'Super Admin'}
              </span>
              <span style={{
                padding: '4px 10px', borderRadius: 8,
                background: 'var(--a-info-bg)', color: 'var(--a-info)',
                fontSize: 11, fontWeight: 600,
              }}>
                <Calendar size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                Member since 2024
              </span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Edit Profile */}
      <SettingsCard delay={0.08}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <div className="admin-card-title" style={{ marginBottom: 2 }}>Edit Profile</div>
            <div style={{ fontSize: 12, color: 'var(--a-text-dim)' }}>
              Update your personal information
            </div>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 18px', fontSize: 13 }}
          >
            {saving ? (
              <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={13} /> Saved!</>
            ) : (
              <><Save size={13} /> Save Profile</>
            )}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Full Name">
            <div style={{ position: 'relative' }}>
              <User size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </Field>
          <Field label="Email Address">
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </Field>
          <Field label="Phone Number">
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </Field>
          <Field label="Location">
            <div style={{ position: 'relative' }}>
              <MapPin size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                placeholder="Paris, France"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Bio" hint="Brief description visible to your team.">
              <textarea
                className="admin-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your team a bit about yourself…"
                style={{ resize: 'vertical' }}
              />
            </Field>
          </div>
        </div>
      </SettingsCard>

      {/* Login History */}
      <SettingsCard delay={0.16}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 16,
        }}>
          <Clock size={16} style={{ color: 'var(--a-text-muted)' }} />
          <div className="admin-card-title" style={{ marginBottom: 0 }}>Login History</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {loginHistory.map((entry, i) => {
            const LIcon = entry.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px',
                  borderBottom: i < loginHistory.length - 1 ? '1px solid var(--a-border)' : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: i === 0 ? 'var(--a-green-light)' : 'var(--a-surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <LIcon size={16} style={{
                    color: i === 0 ? 'var(--a-green)' : 'var(--a-text-dim)',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)' }}>
                    {entry.device}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--a-text-dim)' }}>
                    IP: {entry.ip}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--a-text-muted)', fontWeight: 500 }}>
                    {entry.date.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--a-text-dim)' }}>
                    {entry.date.split(' ')[1]}
                  </div>
                </div>
                {i === 0 && (
                  <span style={{
                    padding: '3px 8px', borderRadius: 6,
                    background: 'var(--a-green-light)', color: 'var(--a-green)',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    CURRENT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}

// ── Password Section ────────────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showCurrent, setShowCur] = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  const handleChange = async () => {
    setError('');
    if (!current || !newPass || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (newPass.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      setCurrent(''); setNewPass(''); setConfirm('');
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const strength = (() => {
    if (!newPass) return { label: '', color: '', pct: 0 };
    let score = 0;
    if (newPass.length >= 8) score++;
    if (newPass.length >= 12) score++;
    if (/[A-Z]/.test(newPass)) score++;
    if (/[0-9]/.test(newPass)) score++;
    if (/[^A-Za-z0-9]/.test(newPass)) score++;
    if (score <= 2) return { label: 'Weak', color: 'var(--a-danger)', pct: 33 };
    if (score <= 3) return { label: 'Fair', color: 'var(--a-warning)', pct: 60 };
    return { label: 'Strong', color: 'var(--a-success)', pct: 100 };
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SettingsCard>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 20,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--a-accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <KeyRound size={18} style={{ color: 'var(--a-accent)' }} />
          </div>
          <div>
            <div className="admin-card-title" style={{ marginBottom: 2 }}>Change Password</div>
            <div style={{ fontSize: 12, color: 'var(--a-text-dim)' }}>
              Keep your account secure with a strong password
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--a-danger-bg)', color: 'var(--a-danger)',
            fontSize: 13, marginBottom: 16,
          }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <Field label="Current Password">
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current password"
                style={{ paddingLeft: 36, paddingRight: 40 }}
              />
              <button
                onClick={() => setShowCur(!showCurrent)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--a-text-dim)', display: 'flex',
                }}
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          <Field label="New Password">
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setError(''); }}
                placeholder="Enter new password"
                style={{ paddingLeft: 36, paddingRight: 40 }}
              />
              <button
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--a-text-dim)', display: 'flex',
                }}
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPass && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 4, background: 'var(--a-surface-3)', borderRadius: 99,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${strength.pct}%`,
                    background: strength.color, borderRadius: 99,
                    transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
                  {strength.label}
                </div>
              </div>
            )}
          </Field>

          <Field label="Confirm New Password">
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--a-text-dim)',
              }} />
              <input
                className="admin-input"
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                placeholder="Confirm new password"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </Field>

          <button
            className="admin-btn admin-btn-primary"
            onClick={handleChange}
            disabled={saving}
            style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: 13 }}
          >
            {saving ? (
              <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</>
            ) : saved ? (
              <><CheckCircle2 size={13} /> Updated!</>
            ) : (
              <>Update Password</>
            )}
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

// ── Store Section ───────────────────────────────────────────────────────────

function StoreSection({ s, set }: SectionProps) {
  return (
    <SettingsCard>
      <div className="admin-card-title">Store Configuration</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Store Name">
          <input className="admin-input" value={s.store_name ?? ''} onChange={(e) => set('store_name', e.target.value)} />
        </Field>
        <Field label="Store Tagline">
          <input className="admin-input" value={s.store_tagline ?? ''} onChange={(e) => set('store_tagline', e.target.value)} />
        </Field>
        <Field label="Contact Email">
          <input className="admin-input" type="email" value={s.contact_email ?? ''} onChange={(e) => set('contact_email', e.target.value)} />
        </Field>
        <Field label="Contact Phone">
          <input className="admin-input" value={s.contact_phone ?? ''} onChange={(e) => set('contact_phone', e.target.value)} />
        </Field>
        <Field label="Currency">
          <select className="admin-input admin-select" value={s.currency ?? 'EUR'} onChange={(e) => set('currency', e.target.value)}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </Field>
        <Field label="Min Order Amount">
          <input className="admin-input" type="number" value={s.min_order_amount ?? '0'} onChange={(e) => set('min_order_amount', e.target.value)} />
        </Field>
      </div>
      <div style={{ marginTop: 16 }}>
        <Field label="Store Address">
          <textarea className="admin-input" rows={3} value={s.store_address ?? ''} onChange={(e) => set('store_address', e.target.value)} style={{ resize: 'vertical' }} />
        </Field>
      </div>
    </SettingsCard>
  );
}

// ── Tax Section ─────────────────────────────────────────────────────────────

function TaxSection({ s, set }: SectionProps) {
  const taxEnabled = s.tax_enabled === '1' || s.tax_enabled === 'true';
  return (
    <SettingsCard>
      <div className="admin-card-title">Tax / VAT Configuration</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Toggle on={taxEnabled} onChange={(v) => set('tax_enabled', v ? '1' : '0')} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)' }}>Enable Tax / VAT</span>
        </label>
        {taxEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Field label="Tax Label (FR)">
              <input className="admin-input" value={s.tax_label_fr ?? 'TVA'} onChange={(e) => set('tax_label_fr', e.target.value)} />
            </Field>
            <Field label="Tax Label (EN)">
              <input className="admin-input" value={s.tax_label_en ?? 'VAT'} onChange={(e) => set('tax_label_en', e.target.value)} />
            </Field>
            <Field label="Default Tax Rate (%)">
              <input className="admin-input" type="number" step="0.1" value={s.tax_rate ?? '20'} onChange={(e) => set('tax_rate', e.target.value)} />
            </Field>
            <Field label="Tax Mode">
              <select className="admin-input admin-select" value={s.tax_mode ?? 'exclusive'} onChange={(e) => set('tax_mode', e.target.value)}>
                <option value="exclusive">Exclusive (added on top)</option>
                <option value="inclusive">Inclusive (included in price)</option>
              </select>
            </Field>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

// ── Locale Section ──────────────────────────────────────────────────────────

function LocaleSection({ s, set }: SectionProps) {
  return (
    <SettingsCard>
      <div className="admin-card-title">Localisation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Default Language">
          <select className="admin-input admin-select" value={s.default_language ?? 'fr'} onChange={(e) => set('default_language', e.target.value)}>
            {[['fr','French'],['en','English'],['de','German'],['nl','Dutch'],['ru','Russian']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Timezone">
          <select className="admin-input admin-select" value={s.timezone ?? 'Europe/Paris'} onChange={(e) => set('timezone', e.target.value)}>
            {['Europe/Paris','Europe/London','America/New_York','Asia/Tokyo'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Date Format">
          <select className="admin-input admin-select" value={s.date_format ?? 'DD/MM/YYYY'} onChange={(e) => set('date_format', e.target.value)}>
            {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </div>
    </SettingsCard>
  );
}

// ── Notifications Section ───────────────────────────────────────────────────

const NOTIF_ITEMS: [string, string, string][] = [
  ['notif_new_order',    'New Order',        'Send email when a new order is placed'],
  ['notif_low_stock',    'Low Stock Alert',  'Notify when product stock drops below threshold'],
  ['notif_new_user',     'New User Sign-up', 'Alert when a new customer registers'],
  ['notif_order_shipped','Order Shipped',    'Confirmation email to customer on shipment'],
];

function NotifsSection({ s, set }: SectionProps) {
  return (
    <SettingsCard>
      <div className="admin-card-title">Email Notifications</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {NOTIF_ITEMS.map(([key, label, desc]) => {
          const on = s[key] === '1' || s[key] === 'true' || s[key] === undefined;
          return (
            <label key={key} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              cursor: 'pointer', padding: '12px 14px', borderRadius: 12,
              border: '1px solid var(--a-border)',
              transition: 'background 0.15s, border-color 0.15s',
              background: on ? 'var(--a-green-light)' : 'transparent',
              borderColor: on ? 'rgba(26,107,90,0.15)' : 'var(--a-border)',
            }}>
              <Toggle on={on} onChange={(v) => set(key, v ? '1' : '0')} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--a-text-muted)', marginTop: 2 }}>{desc}</div>
              </div>
            </label>
          );
        })}
      </div>
    </SettingsCard>
  );
}

// ── Advanced Section ────────────────────────────────────────────────────────

function AdvancedSection({ s, set }: SectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SettingsCard>
        <div className="admin-card-title">Advanced</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Google Analytics ID">
            <input className="admin-input" placeholder="G-XXXXXXXXXX" value={s.google_analytics_id ?? ''} onChange={(e) => set('google_analytics_id', e.target.value)} />
          </Field>
          <Field label="Low Stock Threshold">
            <input className="admin-input" type="number" value={s.low_stock_threshold ?? '5'} onChange={(e) => set('low_stock_threshold', e.target.value)} />
          </Field>
          <Field label="Items per Page (API)">
            <input className="admin-input" type="number" value={s.items_per_page ?? '20'} onChange={(e) => set('items_per_page', e.target.value)} />
          </Field>
          <Field label="Max Upload Size (MB)">
            <input className="admin-input" type="number" value={s.max_upload_size ?? '5'} onChange={(e) => set('max_upload_size', e.target.value)} />
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard delay={0.08}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--a-danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={15} /> Danger Zone
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--a-text-muted)', marginBottom: 14 }}>
          These actions may affect the stability of your store. Proceed with caution.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn" style={{
            padding: '8px 16px', fontSize: 12,
            background: 'var(--a-danger-bg)', color: 'var(--a-danger)',
            border: '1px solid rgba(224,82,82,0.20)', borderRadius: 10,
          }}>
            Clear Cache
          </button>
          <button className="admin-btn" style={{
            padding: '8px 16px', fontSize: 12,
            background: 'var(--a-danger-bg)', color: 'var(--a-danger)',
            border: '1px solid rgba(224,82,82,0.20)', borderRadius: 10,
          }}>
            Flush Sessions
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}
