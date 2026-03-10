'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Globe } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';

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

const MOCK: Banner[] = [
  { id: 1, message: 'Livraison gratuite dès 50€', message_en: 'Free shipping from €50', cta_label: 'Commander', cta_label_en: 'Shop Now', cta_url: '/shop', bg_color: '#3C7A58', text_color: '#FFFFFF', is_active: true, sort_order: 1 },
  { id: 2, message: 'Soldes d\'été — -15% sur tout', message_en: 'Summer Sale — 15% off everything', cta_label: 'Voir les offres', cta_label_en: 'See Deals', cta_url: '/shop', bg_color: '#111111', text_color: '#F5F0E8', is_active: false, sort_order: 2 },
];

const emptyB = (): Partial<Banner> => ({ message: '', message_en: '', cta_label: '', cta_label_en: '', cta_url: '', bg_color: '#3C7A58', text_color: '#FFFFFF', is_active: true, sort_order: 0 });

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [del, setDel]         = useState<Banner | null>(null);
  const [saving, setSaving]   = useState(false);
  const [lang, setLang]       = useState<'fr'|'en'>('fr');

  useEffect(() => { setLoading(false); setBanners(MOCK); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      setBanners(prev => prev.map(b => b.id === editing.id ? { ...b, ...editing } as Banner : b));
    } else {
      setBanners(prev => [...prev, { ...editing, id: Date.now() } as Banner]);
    }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!del) return;
    setBanners(prev => prev.filter(b => b.id !== del.id));
    setDel(null);
  };

  const toggle = (id: number) => setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
  const set = (f: keyof Banner, v: unknown) => setEditing(prev => prev ? { ...prev, [f]: v } : prev);

  return (
    <>
      <AdminPageHeader
        title="Site Banners"
        subtitle="Top-of-page announcement banners for promotions and shipping notices."
        actions={<button className="admin-btn admin-btn-primary" onClick={() => { setEditing(emptyB()); setLang('fr'); }}><Plus size={15} /> New Banner</button>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="admin-card" style={{ height: 80 }}><div className="admin-skeleton" style={{ height: '100%', borderRadius: 8 }} /></div>)
        ) : banners.map((b, idx) => (
          <motion.div key={b.id} className="admin-card" style={{ padding: '14px 16px', opacity: b.is_active ? 1 : 0.6 }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: b.is_active ? 1 : 0.6, y: 0 }} transition={{ delay: idx * 0.06 }}>
            {/* Preview */}
            <div style={{ borderRadius: 6, padding: '8px 14px', marginBottom: 12, background: b.bg_color, color: b.text_color, fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{b.message}</span>
              {b.cta_label && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, border: `1px solid ${b.text_color}50` }}>{b.cta_label}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GripVertical size={14} style={{ color: 'var(--color-a-text-muted)', cursor: 'grab' }} />
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

      {/* Edit Modal */}
      <AdminModal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Banner' : 'New Banner'} size="md"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>}
      >
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--color-a-surface-2)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
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
            {/* Live preview */}
            <div style={{ borderRadius: 6, padding: '10px 14px', background: editing.bg_color, color: editing.text_color, fontSize: 13, fontWeight: 600 }}>
              {editing.message || 'Preview…'}
              {editing.cta_label && <span style={{ marginLeft: 12, fontSize: 11, opacity: 0.8 }}>{editing.cta_label}</span>}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div onClick={() => set('is_active', !editing.is_active)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: editing.is_active ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
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
