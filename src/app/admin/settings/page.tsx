'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Globe, Store, Percent, Bell, Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { adminApi } from '@/lib/admin/api';
import { motion } from 'framer-motion';

interface SettingItem {
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
}

type SettingsMap = Record<string, string>;
type RawGroup = Record<string, SettingItem[]>;

const SECTIONS = [
  { id: 'store',    label: 'Store',         icon: Store   },
  { id: 'tax',      label: 'Tax / VAT',     icon: Percent },
  { id: 'locale',   label: 'Locale',        icon: Globe   },
  { id: 'notifs',   label: 'Notifications', icon: Bell    },
  { id: 'advanced', label: 'Advanced',      icon: Database },
];

export default function SettingsPage() {
  const [section, setSection]     = useState('store');
  const [settings, setSettings]   = useState<SettingsMap>({});
  const [rawItems, setRawItems]   = useState<SettingItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [apiError, setApiError]   = useState('');
  const [savedMsg, setSavedMsg]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setApiError('');
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
    setSaving(true); setApiError(''); setSavedMsg('');
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10, color: 'var(--color-a-text-muted)' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
      Loading settings…
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <AdminPageHeader
        title="Site Settings"
        subtitle="Configure your store, taxes, locales and notifications."
        actions={
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Saving…</>
            ) : savedMsg ? (
              <><CheckCircle2 size={14} />Saved!</>
            ) : (
              <><Save size={14} />Save Changes</>
            )}
          </button>
        }
      />

      {apiError && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 16, color: '#F87171', fontSize: 13 }}>
          <AlertCircle size={14} />
          {apiError}
          <button onClick={load} style={{ marginLeft: 'auto', fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#F87171' }}>Retry</button>
        </div>
      )}

      {savedMsg && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.25)', marginBottom: 16, color: 'var(--color-a-green)', fontSize: 13 }}>
          <CheckCircle2 size={14} />
          {savedMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Section nav */}
        <div className="admin-card" style={{ padding: 8, height: 'fit-content' }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin-nav-item w-full ${section === id ? 'active' : ''}`}
              style={{ marginBottom: 1 }}
              onClick={() => setSection(id)}
            >
              <Icon size={16} className="admin-nav-icon" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Section content */}
        <motion.div
          key={section}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {section === 'store'    && <StoreSection    s={settings} set={set} />}
          {section === 'tax'      && <TaxSection      s={settings} set={set} />}
          {section === 'locale'   && <LocaleSection   s={settings} set={set} />}
          {section === 'notifs'   && <NotifsSection   s={settings} set={set} />}
          {section === 'advanced' && <AdvancedSection s={settings} set={set} />}
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

interface SectionProps { s: SettingsMap; set: (k: string, v: string) => void; }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: on ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
    </div>
  );
}

// ── Store ──────────────────────────────────────────────────────────────────────

function StoreSection({ s, set }: SectionProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Store Configuration</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
        <Field label="Min Order Amount (€)">
          <input className="admin-input" type="number" value={s.min_order_amount ?? '0'} onChange={(e) => set('min_order_amount', e.target.value)} />
        </Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Field label="Store Address">
          <textarea className="admin-input" rows={3} value={s.store_address ?? ''} onChange={(e) => set('store_address', e.target.value)} style={{ resize: 'vertical' }} />
        </Field>
      </div>
    </div>
  );
}

// ── Tax ────────────────────────────────────────────────────────────────────────

function TaxSection({ s, set }: SectionProps) {
  const taxEnabled = s.tax_enabled === '1' || s.tax_enabled === 'true';
  return (
    <div className="admin-card">
      <div className="admin-card-title">Tax / VAT Configuration</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Toggle on={taxEnabled} onChange={(v) => set('tax_enabled', v ? '1' : '0')} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-a-text)' }}>Enable Tax / VAT</span>
        </label>
        {taxEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
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
    </div>
  );
}

// ── Locale ─────────────────────────────────────────────────────────────────────

function LocaleSection({ s, set }: SectionProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Localisation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
    </div>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────────

const NOTIF_ITEMS: [string, string, string][] = [
  ['notif_new_order',   'New Order',        'Send email when a new order is placed'],
  ['notif_low_stock',   'Low Stock Alert',  'Notify when product stock drops below threshold'],
  ['notif_new_user',    'New User Sign-up', 'Alert when a new customer registers'],
  ['notif_order_shipped','Order Shipped',   'Confirmation email to customer on shipment'],
];

function NotifsSection({ s, set }: SectionProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Email Notifications</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {NOTIF_ITEMS.map(([key, label, desc]) => {
          const on = s[key] === '1' || s[key] === 'true' || s[key] === undefined;
          return (
            <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <Toggle on={on} onChange={(v) => set(key, v ? '1' : '0')} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-a-text)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{desc}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ── Advanced ───────────────────────────────────────────────────────────────────

function AdvancedSection({ s, set }: SectionProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Advanced</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
      <div style={{ marginTop: 20, padding: '14px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#F87171', marginBottom: 8 }}>Danger Zone</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn admin-btn-danger" style={{ padding: '7px 14px', fontSize: 12 }}>
            Clear Cache
          </button>
          <button className="admin-btn admin-btn-danger" style={{ padding: '7px 14px', fontSize: 12 }}>
            Flush Sessions
          </button>
        </div>
      </div>
    </div>
  );
}
