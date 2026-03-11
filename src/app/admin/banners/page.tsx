'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Globe, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

interface Banner {
  id: number;
  message: string;
  message_en: string;
  cta_label: string;
  cta_label_en: string;
  cta_url: string;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  sort_order: number;
}

const emptyB = (): Partial<Banner> => ({
  message: '', message_en: '', cta_label: '', cta_label_en: '',
  cta_url: '', bg_color: '#3C7A58', text_color: '#FFFFFF', is_active: true, sort_order: 0,
});

function toArr(r: unknown): Banner[] {
  if (Array.isArray(r)) return r as Banner[];
  const x = r as Record<string, unknown>;
  return Array.isArray(x?.data) ? (x.data as Banner[]) : [];
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [del, setDel]         = useState<Banner | null>(null);
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [lang, setLang]       = useState<'fr'|'en'>('fr');

  const load = useCallback(async () => {
    setLoading(true); setApiError('');
    try { setBanners(toArr(await adminApi.banners.list())); }
    catch (e) { setApiError((e as Error).message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const u = await adminApi.banners.update(editing.id, editing) as Banner;
        setBanners(prev => prev.map(b => b.id === editing.id ? u : b));
      } else {
        const c = await adminApi.banners.create(editing) as Banner;
        setBanners(prev => [...prev, c]);
      }
      setEditing(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!del) return;
    try {
      await adminApi.banners.delete(del.id);
      setBanners(prev => prev.filter(b => b.id !== del.id));
      setDel(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to delete'); }
  };

  const toggle = async (id: number) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    const next = banners.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b);
    setBanners(next);
    try {
      const u = await adminApi.banners.update(id, { ...banner, is_active: !banner.is_active }) as Banner;
      setBanners(prev => prev.map(b => b.id === id ? u : b));
    } catch { setBanners(banners); }
  };

  const set = (f: keyof Banner, v: unknown) => setEditing(prev => prev ? { ...prev, [f]: v } : prev);

  return (
    <>
      <AdminPageHeader
        title="Site Banners"
        subtitle="Top-of-page announcement banners for promotions and shipping notices."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={14} /></button>
            <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(emptyB()); setLang('fr'); }}><Plus size={15} /> New Banner</button>
          </div>
        }
      />

      {apiError && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--a-danger-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--a-danger)', fontSize: 13, marginBottom: 16 }}>
          {apiError} — <button style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={load}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="admin-card" style={{ height: 80 }}><div className="admin-skeleton" style={{ height: '100%', borderRadius: 8 }} /></div>
          ))
        ) : banners.length === 0 ? (
          <div className="admin-card" style={{ padding: 40, textAlign: 'center', color: 'var(--a-text-muted)' }}>
            No banners yet. Click <strong>New Banner</strong> to create one.
          </div>
        ) : banners.map((b, idx) => (
          <motion.div key={b.id} className="admin-card" style={{ padding: '14px 16px', opacity: b.is_active ? 1 : 0.6 }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: b.is_active ? 1 : 0.6, y: 0 }} transition={{ delay: idx * 0.06 }}>
            <div style={{ borderRadius: 6, padding: '8px 14px', marginBottom: 12, background: b.bg_color, color: b.text_color, fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{b.message}</span>
              {b.cta_label && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, border: `1px solid ${b.text_color}50` }}>{b.cta_label}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GripVertical size={14} style={{ color: 'var(--a-text-dim)', cursor: 'grab' }} />
                <AdminBadge variant={b.is_active ? 'green' : 'gray'}>#{b.sort_order} — {b.is_active ? 'Active' : 'Hidden'}</AdminBadge>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => toggle(b.id)}>{b.is_active ? 'Hide' : 'Show'}</button>
                <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditing({ ...b }); setLang('fr'); }}><Pencil size={12} /></button>
                <button className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDel(b)}><Trash2 size={12} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AdminModal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Banner' : 'New Banner'} size="md"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>}
      >
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--a-surface-2)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {(['fr','en'] as const).map(l => <button key={l} className={`admin-btn ${lang === l ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '5px 16px', fontSize: 12 }} onClick={() => setLang(l)}><Globe size={11} /> {l.toUpperCase()}</button>)}
            </div>
            {lang === 'fr' ? (
              <>
                <div><label className="admin-label">Message (FR)</label><input className="admin-input" value={editing.message ?? ''} onChange={e => set('message', e.target.value)} placeholder="Livraison gratuite dès 50€" /></div>
                <div><label className="admin-label">CTA Label (FR)</label><input className="admin-input" value={editing.cta_label ?? ''} onChange={e => set('cta_label', e.target.value)} placeholder="Commander" /></div>
              </>
            ) : (
              <>
                <div><label className="admin-label">Message (EN)</label><input className="admin-input" value={editing.message_en ?? ''} onChange={e => set('message_en', e.target.value)} placeholder="Free shipping from €50" /></div>
                <div><label className="admin-label">CTA Label (EN)</label><input className="admin-input" value={editing.cta_label_en ?? ''} onChange={e => set('cta_label_en', e.target.value)} placeholder="Shop Now" /></div>
              </>
            )}
            <div><label className="admin-label">CTA URL</label><input className="admin-input" value={editing.cta_url ?? ''} onChange={e => set('cta_url', e.target.value)} placeholder="/shop" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label className="admin-label">Background</label><input className="admin-input" type="color" value={editing.bg_color ?? '#3C7A58'} onChange={e => set('bg_color', e.target.value)} style={{ height: 38, padding: 4, cursor: 'pointer' }} /></div>
              <div><label className="admin-label">Text Color</label><input className="admin-input" type="color" value={editing.text_color ?? '#FFFFFF'} onChange={e => set('text_color', e.target.value)} style={{ height: 38, padding: 4, cursor: 'pointer' }} /></div>
              <div><label className="admin-label">Sort Order</label><input className="admin-input" type="number" value={editing.sort_order ?? 0} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} min="0" /></div>
            </div>
            <div style={{ borderRadius: 6, padding: '10px 14px', background: editing.bg_color, color: editing.text_color, fontSize: 13, fontWeight: 600 }}>
              {editing.message || 'Preview…'}{editing.cta_label && <span style={{ marginLeft: 12, fontSize: 11, opacity: 0.8 }}>{editing.cta_label}</span>}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div onClick={() => set('is_active', !editing.is_active)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: editing.is_active ? 'var(--a-green)' : 'var(--a-surface-3)', border: '1px solid var(--a-border)', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: editing.is_active ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Active</span>
            </label>
          </div>
        )}
      </AdminModal>

      <AdminModal open={!!del} onClose={() => setDel(null)} title="Delete Banner" size="sm"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setDel(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></div>}
      >
        <p style={{ fontSize: 14 }}>Delete this banner? This cannot be undone.</p>
      </AdminModal>
    </>
  );
}
