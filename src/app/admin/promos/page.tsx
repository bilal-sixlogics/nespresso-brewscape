'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign, Gift, Zap } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

interface PromoCode {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  minimum_order?: number;
}

const MOCK_PROMOS: PromoCode[] = [
  { id: 1, code: 'WELCOME10', type: 'percent', value: 10, usage_limit: 500, used_count: 143, expires_at: '2025-12-31', is_active: true, minimum_order: 20 },
  { id: 2, code: 'SUMMER5',   type: 'fixed',   value: 5,  usage_limit: 200, used_count: 88,  expires_at: '2025-08-31', is_active: true, minimum_order: 0 },
  { id: 3, code: 'VIP20',     type: 'percent', value: 20, usage_limit: 50,  used_count: 50,  expires_at: '2025-06-30', is_active: false, minimum_order: 50 },
  { id: 4, code: 'FREESHIP',  type: 'fixed',   value: 0,  usage_limit: null,used_count: 22,  expires_at: null, is_active: true, minimum_order: 30 },
];

const empty = (): Partial<PromoCode> => ({ code: '', type: 'percent', value: 10, usage_limit: null, used_count: 0, expires_at: null, is_active: true, minimum_order: 0 });

export default function PromosPage() {
  const [promos, setPromos]   = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PromoCode> | null>(null);
  const [del, setDel]         = useState<PromoCode | null>(null);
  const [saving, setSaving]   = useState(false);
  const [tab, setTab]         = useState<'codes' | 'sitewide' | 'shipping'>('codes');

  // Sitewide promo state
  const [sitewideEnabled, setSitewideEnabled] = useState(false);
  const [sitewidePercent, setSitewidePercent] = useState('15');
  const [sitewideLabel, setSitewideLabel]     = useState('Soldes d\'été ! -15% sur tout le site');
  const [freeShipEnabled, setFreeShipEnabled] = useState(true);
  const [freeShipThreshold, setFreeShipThreshold] = useState('50');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.tags.list(); // Replace with adminApi.promos.list()
      setPromos(MOCK_PROMOS);
    } catch {
      setPromos(MOCK_PROMOS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        setPromos(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as PromoCode : p));
      } else {
        setPromos(prev => [...prev, { ...editing, id: Date.now(), used_count: 0 } as PromoCode]);
      }
    } catch { /* ignore */ }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!del) return;
    setPromos(prev => prev.filter(p => p.id !== del.id));
    setDel(null);
  };

  const handleToggle = (id: number) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
  };

  const set = (f: keyof PromoCode, v: unknown) => setEditing(prev => prev ? { ...prev, [f]: v } : prev);

  const expired = (p: PromoCode) => p.expires_at && new Date(p.expires_at) < new Date();
  const exhausted = (p: PromoCode) => p.usage_limit !== null && p.used_count >= p.usage_limit;

  return (
    <>
      <AdminPageHeader
        title="Promotions"
        subtitle="Manage promo codes, sitewide discounts and free shipping thresholds."
        actions={
          tab === 'codes' ? (
            <button className="admin-btn admin-btn-primary" onClick={() => setEditing(empty())}>
              <Plus size={15} /> New Code
            </button>
          ) : (
            <button className="admin-btn admin-btn-primary">
              Save Changes
            </button>
          )
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--color-a-surface)', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 18 }}>
        {[
          { key: 'codes',    label: 'Promo Codes',      icon: Tag },
          { key: 'sitewide', label: 'Sitewide Discount', icon: Percent },
          { key: 'shipping', label: 'Free Shipping',     icon: Gift },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`admin-btn ${tab === key ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            style={{ padding: '7px 16px', fontSize: 12 }}
            onClick={() => setTab(key as any)}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Promo Codes Tab */}
      {tab === 'codes' && (
        <div className="admin-card" style={{ overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Used / Limit</th>
                <th>Min Order</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j}><div className="admin-skeleton" style={{ height: 14, borderRadius: 4 }} /></td>)}</tr>)
              ) : promos.map((p, idx) => {
                const isExpired = expired(p);
                const isExhausted = exhausted(p);
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}>
                    <td>
                      <code style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', color: 'var(--color-a-green)' }}>{p.code}</code>
                    </td>
                    <td>
                      <span className="admin-badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {p.type === 'percent' ? <Percent size={10} /> : <DollarSign size={10} />}
                        {p.type === 'percent' ? 'Percent' : 'Fixed'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {p.type === 'percent' ? `${p.value}%` : p.value === 0 ? 'Free Ship' : `€${p.value}`}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ color: isExhausted ? '#EF4444' : 'inherit' }}>{p.used_count}</span>
                      {p.usage_limit !== null && <> / {p.usage_limit}</>}
                    </td>
                    <td style={{ fontSize: 12 }}>{p.minimum_order ? `€${p.minimum_order}` : '—'}</td>
                    <td style={{ fontSize: 12, color: isExpired ? '#EF4444' : 'var(--color-a-text-muted)' }}>
                      {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      {isExpired ? <AdminBadge variant="red">Expired</AdminBadge>
                        : isExhausted ? <AdminBadge variant="red">Exhausted</AdminBadge>
                        : <AdminBadge variant={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Active' : 'Disabled'}</AdminBadge>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditing({ ...p })}>
                          <Pencil size={12} />
                        </button>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleToggle(p.id)}
                        >
                          <Zap size={12} /> {p.is_active ? 'Off' : 'On'}
                        </button>
                        <button className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDel(p)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sitewide Tab */}
      {tab === 'sitewide' && (
        <div className="admin-card">
          <div className="admin-card-title">Sitewide Discount Banner</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => setSitewideEnabled(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: sitewideEnabled ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: sitewideEnabled ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Enable Sitewide Discount</span>
            </label>
            {sitewideEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <div>
                  <label className="admin-label">Discount Percentage (%)</label>
                  <input className="admin-input" type="number" value={sitewidePercent} onChange={e => setSitewidePercent(e.target.value)} min="1" max="90" />
                </div>
                <div>
                  <label className="admin-label">Banner Message (FR)</label>
                  <input className="admin-input" value={sitewideLabel} onChange={e => setSitewideLabel(e.target.value)} />
                </div>
              </div>
            )}
            {sitewideEnabled && (
              <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--color-a-green)', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'white' }}>
                Preview: {sitewideLabel} ({sitewidePercent}% off)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Free Shipping Tab */}
      {tab === 'shipping' && (
        <div className="admin-card">
          <div className="admin-card-title">Free Shipping Threshold</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => setFreeShipEnabled(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: freeShipEnabled ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: freeShipEnabled ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Enable Free Shipping Promo</span>
            </label>
            {freeShipEnabled && (
              <div style={{ maxWidth: 300 }}>
                <label className="admin-label">Free Shipping Above (€)</label>
                <input className="admin-input" type="number" value={freeShipThreshold} onChange={e => setFreeShipThreshold(e.target.value)} min="0" />
                <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)', marginTop: 6 }}>
                  Customers with orders above €{freeShipThreshold} get free shipping automatically.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AdminModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Promo Code' : 'New Promo Code'}
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        }
      >
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="admin-label">Code</label>
              <input className="admin-input" value={editing.code ?? ''} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="PROMO20" style={{ fontFamily: 'monospace', letterSpacing: '0.05em', fontWeight: 700 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="admin-label">Type</label>
                <select className="admin-input admin-select" value={editing.type} onChange={e => set('type', e.target.value)}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (€)</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Value</label>
                <input className="admin-input" type="number" value={editing.value ?? ''} onChange={e => set('value', parseFloat(e.target.value) || 0)} min="0" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="admin-label">Usage Limit</label>
                <input className="admin-input" type="number" value={editing.usage_limit ?? ''} onChange={e => set('usage_limit', e.target.value ? parseInt(e.target.value) : null)} placeholder="Unlimited" min="1" />
              </div>
              <div>
                <label className="admin-label">Min Order (€)</label>
                <input className="admin-input" type="number" value={editing.minimum_order ?? ''} onChange={e => set('minimum_order', parseFloat(e.target.value) || 0)} min="0" />
              </div>
            </div>
            <div>
              <label className="admin-label">Expires At</label>
              <input className="admin-input" type="date" value={editing.expires_at?.split('T')[0] ?? ''} onChange={e => set('expires_at', e.target.value || null)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => set('is_active', !editing.is_active)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: editing.is_active ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: editing.is_active ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Active</span>
            </label>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal open={!!del} onClose={() => setDel(null)} title="Delete Promo Code" size="sm"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setDel(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></div>}
      >
        <p style={{ fontSize: 14 }}>Delete code <strong>{del?.code}</strong>? This cannot be undone.</p>
      </AdminModal>
    </>
  );
}
