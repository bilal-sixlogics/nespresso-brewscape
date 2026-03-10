'use client';

import { useState } from 'react';
import { Save, Globe, Store, Percent, Bell, Database } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'store',    label: 'Store',    icon: Store },
  { id: 'tax',      label: 'Tax / VAT', icon: Percent },
  { id: 'locale',   label: 'Locale',   icon: Globe },
  { id: 'notifs',   label: 'Notifications', icon: Bell },
  { id: 'advanced', label: 'Advanced', icon: Database },
];

export default function SettingsPage() {
  const [section, setSection] = useState('store');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <AdminPageHeader
        title="Site Settings"
        subtitle="Configure your store, taxes, locales and notifications."
        actions={
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Saving…
              </>
            ) : saved ? '✓ Saved!' : (
              <><Save size={15} />Save Changes</>
            )}
          </button>
        }
      />

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
          {section === 'store' && <StoreSettings />}
          {section === 'tax'   && <TaxSettings />}
          {section === 'locale'&& <LocaleSettings />}
          {section === 'notifs'&& <NotificationSettings />}
          {section === 'advanced' && <AdvancedSettings />}
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function field(label: string, node: React.ReactNode) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {node}
    </div>
  );
}

function StoreSettings() {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Store Configuration</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {field('Store Name', <input className="admin-input" defaultValue="Cafrezzo" />)}
        {field('Store Tagline', <input className="admin-input" defaultValue="Premium Coffee Delivered" />)}
        {field('Contact Email', <input className="admin-input" type="email" defaultValue="hello@cafrezzo.com" />)}
        {field('Contact Phone', <input className="admin-input" defaultValue="+33 1 23 45 67 89" />)}
        {field('Currency', (
          <select className="admin-input admin-select" defaultValue="EUR">
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        ))}
        {field('Min Order Amount (€)', <input className="admin-input" type="number" defaultValue="0" />)}
      </div>
      <div style={{ marginTop: 14 }}>
        {field('Store Address', <textarea className="admin-input" rows={3} defaultValue="123 Rue du Café, 75001 Paris, France" style={{ resize: 'vertical' }} />)}
      </div>
    </div>
  );
}

function TaxSettings() {
  const [taxEnabled, setTaxEnabled] = useState(true);
  return (
    <div className="admin-card">
      <div className="admin-card-title">Tax / VAT Configuration</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div onClick={() => setTaxEnabled((v) => !v)}
            style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: taxEnabled ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: taxEnabled ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-a-text)' }}>Enable Tax / VAT</span>
        </label>
        {taxEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {field('Tax Label (FR)', <input className="admin-input" defaultValue="TVA" />)}
            {field('Tax Label (EN)', <input className="admin-input" defaultValue="VAT" />)}
            {field('Default Tax Rate (%)', <input className="admin-input" type="number" step="0.1" defaultValue="20" />)}
            {field('Tax Mode', (
              <select className="admin-input admin-select" defaultValue="exclusive">
                <option value="exclusive">Exclusive (added on top)</option>
                <option value="inclusive">Inclusive (included in price)</option>
              </select>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LocaleSettings() {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Localisation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {field('Default Language', (
          <select className="admin-input admin-select" defaultValue="fr">
            {[['fr','French'],['en','English'],['de','German'],['nl','Dutch'],['ru','Russian']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        {field('Timezone', (
          <select className="admin-input admin-select" defaultValue="Europe/Paris">
            {['Europe/Paris','Europe/London','America/New_York','Asia/Tokyo'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        ))}
        {field('Date Format', (
          <select className="admin-input admin-select" defaultValue="DD/MM/YYYY">
            {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        ))}
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Email Notifications</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          ['New Order',        'Send email when a new order is placed'],
          ['Low Stock Alert',  'Notify when product stock drops below threshold'],
          ['New User Sign-up', 'Alert when a new customer registers'],
          ['Order Shipped',    'Confirmation email to customer on shipment'],
        ].map(([label, desc]) => (
          <label key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <div style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', background: 'var(--color-a-green)', border: '1px solid var(--color-a-border)', marginTop: 2, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: 18, width: 14, height: 14, borderRadius: '50%', background: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-a-text)' }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Advanced</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {field('Google Analytics ID', <input className="admin-input" placeholder="G-XXXXXXXXXX" />)}
        {field('Low Stock Threshold', <input className="admin-input" type="number" defaultValue="5" />)}
        {field('Items per Page (API)', <input className="admin-input" type="number" defaultValue="20" />)}
        {field('Max Upload Size (MB)', <input className="admin-input" type="number" defaultValue="5" />)}
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
