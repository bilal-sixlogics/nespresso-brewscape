'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star, Globe } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';

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

const MOCK: Testimonial[] = [
  { id: 1, author_name: 'Marie Dupont',   role: 'Amatrice de café', role_en: 'Coffee Lover',  review_text: 'Le meilleur café que j\'ai goûté!', review_text_en: 'The best coffee I\'ve tasted!', rating: 5, product_id: 1, avatar_path: null, is_active: true,  sort_order: 1 },
  { id: 2, author_name: 'Thomas Bernard', role: 'Chef pâtissier',   role_en: 'Pastry Chef',    review_text: 'Qualité exceptionnelle, livraison rapide.', review_text_en: 'Exceptional quality, fast delivery.', rating: 5, product_id: 2, avatar_path: null, is_active: true,  sort_order: 2 },
  { id: 3, author_name: 'Sophie Martin',  role: 'Blogueuse food',   role_en: 'Food Blogger',   review_text: 'Je recommande vivement!', review_text_en: 'Highly recommended!', rating: 4, product_id: null, avatar_path: null, is_active: false, sort_order: 3 },
];

const emptyT = (): Partial<Testimonial> => ({
  author_name: '', role: '', role_en: '', review_text: '', review_text_en: '',
  rating: 5, product_id: null, avatar_path: null, is_active: true, sort_order: 0,
});

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
        >
          <Star size={20} fill={(hover || value) >= n ? '#F59E0B' : 'none'} color={(hover || value) >= n ? '#F59E0B' : 'var(--color-a-border)'} />
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
  const [lang, setLang]       = useState<'fr'|'en'>('fr');

  const load = useCallback(async () => {
    setLoading(true);
    try { /* fetch from API */ } catch { /* ignore */ }
    setItems(MOCK);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      setItems(prev => prev.map(t => t.id === editing.id ? { ...t, ...editing } as Testimonial : t));
    } else {
      setItems(prev => [...prev, { ...editing, id: Date.now() } as Testimonial]);
    }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!del) return;
    setItems(prev => prev.filter(t => t.id !== del.id));
    setDel(null);
  };

  const toggleActive = (id: number) => setItems(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));

  const set = (f: keyof Testimonial, v: unknown) => setEditing(prev => prev ? { ...prev, [f]: v } : prev);

  return (
    <>
      <AdminPageHeader
        title="Testimonials"
        subtitle="Manage customer reviews displayed on the storefront."
        actions={<button className="admin-btn admin-btn-primary" onClick={() => { setEditing(emptyT()); setLang('fr'); }}><Plus size={15} /> New Testimonial</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-card" style={{ padding: 20 }}>
              <div className="admin-skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }} />
              <div className="admin-skeleton" style={{ height: 40, borderRadius: 4, marginBottom: 8 }} />
              <div className="admin-skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
            </div>
          ))
        ) : items.map((t, idx) => (
          <motion.div key={t.id} className="admin-card" style={{ padding: 18, opacity: t.is_active ? 1 : 0.6 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: t.is_active ? 1 : 0.6, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-a-green)22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-a-green)', fontSize: 15 }}>
                  {t.author_name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.author_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{t.role}</div>
                </div>
              </div>
              <AdminBadge variant={t.is_active ? 'green' : 'gray'}>{t.is_active ? 'Active' : 'Hidden'}</AdminBadge>
            </div>
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < t.rating ? '#F59E0B' : 'none'} color={i < t.rating ? '#F59E0B' : 'var(--color-a-border)'} />
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-a-text-muted)', fontStyle: 'italic', marginBottom: 12 }}>
              "{t.review_text}"
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px', flex: 1 }} onClick={() => { setEditing({ ...t }); setLang('fr'); }}>
                <Pencil size={12} /> Edit
              </button>
              <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => toggleActive(t.id)}>
                {t.is_active ? 'Hide' : 'Show'}
              </button>
              <button className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDel(t)}>
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
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
            <div style={{ display: 'flex', gap: 2, background: 'var(--color-a-surface-2)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {(['fr','en'] as const).map(l => (
                <button key={l} className={`admin-btn ${lang === l ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '5px 16px', fontSize: 12 }} onClick={() => setLang(l)}>
                  <Globe size={11} /> {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div>
              <label className="admin-label">Author Name</label>
              <input className="admin-input" value={editing.author_name ?? ''} onChange={e => set('author_name', e.target.value)} placeholder="Marie Dupont" />
            </div>
            {lang === 'fr' ? (
              <>
                <div>
                  <label className="admin-label">Role (FR)</label>
                  <input className="admin-input" value={editing.role ?? ''} onChange={e => set('role', e.target.value)} placeholder="Amatrice de café" />
                </div>
                <div>
                  <label className="admin-label">Review (FR)</label>
                  <textarea className="admin-input" rows={3} value={editing.review_text ?? ''} onChange={e => set('review_text', e.target.value)} placeholder="Le meilleur café…" style={{ resize: 'vertical' }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="admin-label">Role (EN)</label>
                  <input className="admin-input" value={editing.role_en ?? ''} onChange={e => set('role_en', e.target.value)} placeholder="Coffee Lover" />
                </div>
                <div>
                  <label className="admin-label">Review (EN)</label>
                  <textarea className="admin-input" rows={3} value={editing.review_text_en ?? ''} onChange={e => set('review_text_en', e.target.value)} placeholder="The best coffee…" style={{ resize: 'vertical' }} />
                </div>
              </>
            )}
            <div>
              <label className="admin-label">Rating</label>
              <StarPicker value={editing.rating ?? 5} onChange={v => set('rating', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="admin-label">Sort Order</label>
                <input className="admin-input" type="number" value={editing.sort_order ?? 0} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} min="0" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div onClick={() => set('is_active', !editing.is_active)} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: editing.is_active ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
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
