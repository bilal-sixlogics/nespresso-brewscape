'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star, Globe, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

interface Testimonial {
  id: number;
  author_name: string;
  role: string;
  role_en: string;
  review_text: string;
  review_text_en: string;
  rating: number;
  product_id: number | null;
  avatar_path: string | null;
  is_active: boolean;
  sort_order: number;
}

const emptyT = (): Partial<Testimonial> => ({
  author_name: '', role: '', role_en: '', review_text: '', review_text_en: '',
  rating: 5, product_id: null, avatar_path: null, is_active: true, sort_order: 0,
});

function toArr(r: unknown): Testimonial[] {
  if (Array.isArray(r)) return r as Testimonial[];
  const x = r as Record<string, unknown>;
  return Array.isArray(x?.data) ? (x.data as Testimonial[]) : [];
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}>
          <Star size={20} fill={(hover || value) >= n ? '#F59E0B' : 'none'} color={(hover || value) >= n ? '#F59E0B' : 'var(--a-border)'} />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [items, setItems]     = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [del, setDel]         = useState<Testimonial | null>(null);
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [lang, setLang]       = useState<'fr'|'en'>('fr');

  const load = useCallback(async () => {
    setLoading(true); setApiError('');
    try { setItems(toArr(await adminApi.testimonials.list())); }
    catch (e) { setApiError((e as Error).message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const u = await adminApi.testimonials.update(editing.id, editing) as Testimonial;
        setItems(prev => prev.map(t => t.id === editing.id ? u : t));
      } else {
        const c = await adminApi.testimonials.create(editing) as Testimonial;
        setItems(prev => [...prev, c]);
      }
      setEditing(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!del) return;
    try {
      await adminApi.testimonials.delete(del.id);
      setItems(prev => prev.filter(t => t.id !== del.id));
      setDel(null);
    } catch (e) { alert((e as Error).message ?? 'Failed to delete'); }
  };

  const toggleActive = async (id: number) => {
    const item = items.find(t => t.id === id);
    if (!item) return;
    setItems(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));
    try {
      const u = await adminApi.testimonials.update(id, { ...item, is_active: !item.is_active }) as Testimonial;
      setItems(prev => prev.map(t => t.id === id ? u : t));
    } catch { setItems(items); }
  };

  const set = (f: keyof Testimonial, v: unknown) => setEditing(prev => prev ? { ...prev, [f]: v } : prev);

  return (
    <>
      <AdminPageHeader
        title="Testimonials"
        subtitle="Manage customer reviews displayed on the storefront."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={14} /></button>
            <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(emptyT()); setLang('fr'); }}><Plus size={15} /> New Testimonial</button>
          </div>
        }
      />

      {apiError && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--a-danger-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--a-danger)', fontSize: 13, marginBottom: 16 }}>
          {apiError} — <button style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={load}>Retry</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-card" style={{ padding: 20 }}>
              <div className="admin-skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }} />
              <div className="admin-skeleton" style={{ height: 40, borderRadius: 4, marginBottom: 8 }} />
              <div className="admin-skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="admin-card" style={{ padding: 40, textAlign: 'center', color: 'var(--a-text-muted)', gridColumn: '1/-1' }}>
            No testimonials yet.
          </div>
        ) : items.map((t, idx) => (
          <motion.div key={t.id} className="admin-card" style={{ padding: 18, opacity: t.is_active ? 1 : 0.6 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: t.is_active ? 1 : 0.6, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--a-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--a-green)', fontSize: 15 }}>
                  {t.author_name[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.author_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--a-text-muted)' }}>{t.role}</div>
                </div>
              </div>
              <AdminBadge variant={t.is_active ? 'green' : 'gray'}>{t.is_active ? 'Active' : 'Hidden'}</AdminBadge>
            </div>
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < t.rating ? '#F59E0B' : 'none'} color={i < t.rating ? '#F59E0B' : 'var(--a-border)'} />
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--a-text-muted)', fontStyle: 'italic', marginBottom: 12 }}>"{t.review_text}"</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px', flex: 1 }} onClick={() => { setEditing({ ...t }); setLang('fr'); }}><Pencil size={12} /> Edit</button>
              <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => toggleActive(t.id)}>{t.is_active ? 'Hide' : 'Show'}</button>
              <button className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDel(t)}><Trash2 size={12} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AdminModal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Testimonial' : 'New Testimonial'} size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        }
      >
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--a-surface-2)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {(['fr','en'] as const).map(l => <button key={l} className={`admin-btn ${lang === l ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '5px 16px', fontSize: 12 }} onClick={() => setLang(l)}><Globe size={11} /> {l.toUpperCase()}</button>)}
            </div>
            <div><label className="admin-label">Author Name</label><input className="admin-input" value={editing.author_name ?? ''} onChange={e => set('author_name', e.target.value)} placeholder="Marie Dupont" /></div>
            {lang === 'fr' ? (
              <>
                <div><label className="admin-label">Role (FR)</label><input className="admin-input" value={editing.role ?? ''} onChange={e => set('role', e.target.value)} placeholder="Amatrice de café" /></div>
                <div><label className="admin-label">Review (FR)</label><textarea className="admin-input" rows={3} value={editing.review_text ?? ''} onChange={e => set('review_text', e.target.value)} placeholder="Le meilleur café…" style={{ resize: 'vertical' }} /></div>
              </>
            ) : (
              <>
                <div><label className="admin-label">Role (EN)</label><input className="admin-input" value={editing.role_en ?? ''} onChange={e => set('role_en', e.target.value)} placeholder="Coffee Lover" /></div>
                <div><label className="admin-label">Review (EN)</label><textarea className="admin-input" rows={3} value={editing.review_text_en ?? ''} onChange={e => set('review_text_en', e.target.value)} placeholder="The best coffee…" style={{ resize: 'vertical' }} /></div>
              </>
            )}
            <div><label className="admin-label">Rating</label><StarPicker value={editing.rating ?? 5} onChange={v => set('rating', v)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="admin-label">Sort Order</label><input className="admin-input" type="number" value={editing.sort_order ?? 0} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} min="0" /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div onClick={() => set('is_active', !editing.is_active)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: editing.is_active ? 'var(--a-green)' : 'var(--a-surface-3)', border: '1px solid var(--a-border)', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: editing.is_active ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Active</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal open={!!del} onClose={() => setDel(null)} title="Delete Testimonial" size="sm"
        footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button className="admin-btn admin-btn-ghost" onClick={() => setDel(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></div>}
      >
        <p style={{ fontSize: 14 }}>Delete testimonial from <strong>{del?.author_name}</strong>?</p>
      </AdminModal>
    </>
  );
}
