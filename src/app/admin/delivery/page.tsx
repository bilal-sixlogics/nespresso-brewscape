'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Truck, CreditCard, Globe, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

interface DeliveryType {
  id: number; name: string; name_en: string; description: string; description_en: string;
  price: number; estimated_days: string; icon: string; is_active: boolean; sort_order: number;
}
interface PaymentMethod {
  id: number; name: string; name_en: string; description: string; icon: string; is_active: boolean; sort_order: number;
}

function toArr<T>(r: unknown): T[] {
  if (Array.isArray(r)) return r as T[];
  const x = r as Record<string, unknown>;
  return Array.isArray(x?.data) ? (x.data as T[]) : [];
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
  const [payments, setPayments]     = useState<PaymentMethod[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<'delivery' | 'payment'>('delivery');
  const [editDel, setEditDel]       = useState<Partial<DeliveryType> | null>(null);
  const [editPay, setEditPay]       = useState<Partial<PaymentMethod> | null>(null);
  const [delTarget, setDelTarget]   = useState<{ type: 'delivery' | 'payment'; item: DeliveryType | PaymentMethod } | null>(null);
  const [saving, setSaving]         = useState(false);
  const [lang, setLang]             = useState<'fr'|'en'>('fr');
  const [apiError, setApiError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setApiError('');
    try {
      const [d, p] = await Promise.all([
        adminApi.delivery.list(),
        adminApi.payments.list(),
      ]);
      setDeliveries(toArr<DeliveryType>(d));
      setPayments(toArr<PaymentMethod>(p));
    } catch (e) { setApiError((e as Error).message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const emptyD = (): Partial<DeliveryType> => ({ name: '', name_en: '', description: '', description_en: '', price: 0, estimated_days: '', icon: '📦', is_active: true, sort_order: 0 });
  const emptyP = (): Partial<PaymentMethod> => ({ name: '', name_en: '', description: '', icon: '💳', is_active: true, sort_order: 0 });
  const setD = (f: keyof DeliveryType, v: unknown) => setEditDel(prev => prev ? { ...prev, [f]: v } : prev);
  const setP = (f: keyof PaymentMethod, v: unknown) => setEditPay(prev => prev ? { ...prev, [f]: v } : prev);

  const saveDelivery = async () => {
    if (!editDel) return;
    setSaving(true);
    try {
      if (editDel.id) {
        const u = await adminApi.delivery.update(editDel.id, editDel) as DeliveryType;
        setDeliveries(prev => prev.map(d => d.id === editDel.id ? u : d));
      } else {
        const c = await adminApi.delivery.create(editDel) as DeliveryType;
        setDeliveries(prev => [...prev, c]);
      }
      setEditDel(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  const savePayment = async () => {
    if (!editPay) return;
    setSaving(true);
    try {
      if (editPay.id) {
        const u = await adminApi.payments.update(editPay.id, editPay) as PaymentMethod;
        setPayments(prev => prev.map(p => p.id === editPay.id ? u : p));
      } else {
        const c = await adminApi.payments.create(editPay) as PaymentMethod;
        setPayments(prev => [...prev, c]);
      }
      setEditPay(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      if (delTarget.type === 'delivery') {
        await adminApi.delivery.delete(delTarget.item.id);
        setDeliveries(prev => prev.filter(d => d.id !== delTarget.item.id));
      } else {
        await adminApi.payments.delete(delTarget.item.id);
        setPayments(prev => prev.filter(p => p.id !== delTarget.item.id));
      }
      setDelTarget(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to delete'); }
  };

  const toggleD = async (id: number) => {
    const item = deliveries.find(d => d.id === id);
    if (!item) return;
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, is_active: !d.is_active } : d));
    try {
      const u = await adminApi.delivery.update(id, { ...item, is_active: !item.is_active }) as DeliveryType;
      setDeliveries(prev => prev.map(d => d.id === id ? u : d));
    } catch { setDeliveries(deliveries); }
  };

  const toggleP = async (id: number) => {
    const item = payments.find(p => p.id === id);
    if (!item) return;
    setPayments(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
    try {
      const u = await adminApi.payments.update(id, { ...item, is_active: !item.is_active }) as PaymentMethod;
      setPayments(prev => prev.map(p => p.id === id ? u : p));
    } catch { setPayments(payments); }
  };

  return (
    <>
      <AdminPageHeader
        title="Delivery & Payment"
        subtitle="Configure shipping options and available payment methods."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={14} /></button>
            <button className="admin-btn admin-btn-primary" onClick={() => tab === 'delivery' ? (setEditDel(emptyD()), setLang('fr')) : (setEditPay(emptyP()), setLang('fr'))}>
              <Plus size={15} /> {tab === 'delivery' ? 'Add Delivery Type' : 'Add Payment Method'}
            </button>
          </div>
        }
      />

      {apiError && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--a-danger-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--a-danger)', fontSize: 13, marginBottom: 16 }}>
          {apiError} — <button style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={load}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 2, background: 'var(--a-surface)', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 18 }}>
        {[{ k: 'delivery', l: 'Delivery Types', icon: Truck }, { k: 'payment', l: 'Payment Methods', icon: CreditCard }].map(({ k, l, icon: Icon }) => (
          <button key={k} className={`admin-btn ${tab === k ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '7px 16px', fontSize: 12 }} onClick={() => setTab(k as 'delivery' | 'payment')}>
            <Icon size={13} /> {l}
          </button>
        ))}
      </div>

      {tab === 'delivery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="admin-card" style={{ height: 70 }}><div className="admin-skeleton" style={{ height: '100%', borderRadius: 8 }} /></div>) :
            deliveries.length === 0 ? <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--a-text-muted)' }}>No delivery types yet.</div> :
            deliveries.map((d, idx) => (
              <motion.div key={d.id} className="admin-card" style={{ padding: '16px 18px', opacity: d.is_active ? 1 : 0.65 }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: d.is_active ? 1 : 0.65, y: 0 }} transition={{ delay: idx * 0.06 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 24 }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--a-text-muted)' }}>{d.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 16 }}>
                    <div style={{ fontWeight: 700 }}>{d.price === 0 ? 'FREE' : `€${Number(d.price).toFixed(2)}`}</div>
                    <div style={{ fontSize: 11, color: 'var(--a-text-muted)' }}>{d.estimated_days}</div>
                  </div>
                  <AdminBadge variant={d.is_active ? 'green' : 'gray'}>{d.is_active ? 'Active' : 'Disabled'}</AdminBadge>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => toggleD(d.id)}>{d.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditDel({ ...d }); setLang('fr'); }}><Pencil size={12} /></button>
                    <button className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDelTarget({ type: 'delivery', item: d })}><Trash2 size={12} /></button>
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>
      )}

      {tab === 'payment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="admin-card" style={{ height: 100 }}><div className="admin-skeleton" style={{ height: '100%', borderRadius: 8 }} /></div>) :
            payments.length === 0 ? <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--a-text-muted)', gridColumn: '1/-1' }}>No payment methods yet.</div> :
            payments.map((p, idx) => (
              <motion.div key={p.id} className="admin-card" style={{ padding: '16px 18px', opacity: p.is_active ? 1 : 0.65 }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: p.is_active ? 1 : 0.65, y: 0 }} transition={{ delay: idx * 0.06 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 22 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--a-text-muted)' }}>{p.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AdminBadge variant={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Active' : 'Off'}</AdminBadge>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '3px 8px', fontSize: 10 }} onClick={() => toggleP(p.id)}>{p.is_active ? 'Off' : 'On'}</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '3px 7px' }} onClick={() => { setEditPay({ ...p }); setLang('fr'); }}><Pencil size={11} /></button>
                    <button className="admin-btn admin-btn-danger" style={{ padding: '3px 7px' }} onClick={() => setDelTarget({ type: 'payment', item: p })}><Trash2 size={11} /></button>
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>
      )}

      {/* Edit Delivery Modal */}
      <AdminModal open={!!editDel} onClose={() => setEditDel(null)} title={editDel?.id ? 'Edit Delivery Type' : 'New Delivery Type'} size="md"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setEditDel(null)}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={saveDelivery} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>}
      >
        {editDel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--a-surface-2)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {(['fr','en'] as const).map(l => <button key={l} className={`admin-btn ${lang === l ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '5px 16px', fontSize: 12 }} onClick={() => setLang(l)}><Globe size={11} /> {l.toUpperCase()}</button>)}
            </div>
            {lang === 'fr' ? (
              <>
                <div><label className="admin-label">Name (FR)</label><input className="admin-input" value={editDel.name ?? ''} onChange={e => setD('name', e.target.value)} /></div>
                <div><label className="admin-label">Description (FR)</label><input className="admin-input" value={editDel.description ?? ''} onChange={e => setD('description', e.target.value)} /></div>
              </>
            ) : (
              <>
                <div><label className="admin-label">Name (EN)</label><input className="admin-input" value={editDel.name_en ?? ''} onChange={e => setD('name_en', e.target.value)} /></div>
                <div><label className="admin-label">Description (EN)</label><input className="admin-input" value={editDel.description_en ?? ''} onChange={e => setD('description_en', e.target.value)} /></div>
              </>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label className="admin-label">Price (€)</label><input className="admin-input" type="number" step="0.01" value={editDel.price ?? 0} onChange={e => setD('price', parseFloat(e.target.value) || 0)} min="0" /></div>
              <div><label className="admin-label">Est. Days</label><input className="admin-input" value={editDel.estimated_days ?? ''} onChange={e => setD('estimated_days', e.target.value)} placeholder="3-5 days" /></div>
              <div><label className="admin-label">Icon (emoji)</label><input className="admin-input" value={editDel.icon ?? ''} onChange={e => setD('icon', e.target.value)} placeholder="📦" /></div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Edit Payment Modal */}
      <AdminModal open={!!editPay} onClose={() => setEditPay(null)} title={editPay?.id ? 'Edit Payment Method' : 'New Payment Method'} size="sm"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setEditPay(null)}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={savePayment} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>}
      >
        {editPay && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="admin-label">Name (FR)</label><input className="admin-input" value={editPay.name ?? ''} onChange={e => setP('name', e.target.value)} /></div>
            <div><label className="admin-label">Name (EN)</label><input className="admin-input" value={editPay.name_en ?? ''} onChange={e => setP('name_en', e.target.value)} /></div>
            <div><label className="admin-label">Description</label><input className="admin-input" value={editPay.description ?? ''} onChange={e => setP('description', e.target.value)} /></div>
            <div><label className="admin-label">Icon (emoji)</label><input className="admin-input" value={editPay.icon ?? ''} onChange={e => setP('icon', e.target.value)} placeholder="💳" /></div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal open={!!delTarget} onClose={() => setDelTarget(null)} title="Confirm Delete" size="sm"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setDelTarget(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={confirmDelete}>Delete</button></div>}
      >
        <p style={{ fontSize: 14 }}>Delete <strong>{delTarget?.item?.name}</strong>? This cannot be undone.</p>
      </AdminModal>
    </>
  );
}
