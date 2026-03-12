'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from '@/components/admin/ui/AdminDataTable';
import { AdminModal }      from '@/components/admin/ui/AdminModal';
import { adminApi }        from '@/lib/admin/api';
import type { Tag }        from '@/types/admin';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

const PRESETS = [
  { name: 'Best Seller',     color: '#E67E22' },
  { name: 'Nouveau',         color: '#27AE60' },
  { name: 'Éco',             color: '#2ECC71' },
  { name: 'Bio',             color: '#16A085' },
  { name: 'Vegan',           color: '#1ABC9C' },
  { name: 'Édition Limitée', color: '#8E44AD' },
  { name: 'Award Winner',    color: '#F39C12' },
  { name: 'Staff Pick',      color: '#3C7A58' },
];

const COLS: Column<Tag>[] = [
  {
    key: 'name', label: 'Tag', sortable: true,
    render: (r) => (
      <span style={{
        background: r.color, color: 'white', padding: '3px 12px', borderRadius: 999,
        fontSize: 12, fontWeight: 700, display: 'inline-block',
        boxShadow: `0 1px 4px ${r.color}33`,
      }}>
        {r.name}
      </span>
    ),
  },
  { key: 'name_en', label: 'EN Name', render: (r) => r.name_en || <span style={{ color: 'var(--a-text-dim)' }}>—</span> },
  { key: 'slug', label: 'Slug', render: (r) => <code style={{ fontSize: 11, opacity: 0.7, background: 'var(--a-surface-2)', padding: '2px 8px', borderRadius: 6 }}>{r.slug}</code> },
  { key: 'products_count', label: 'Products', width: '80px',
    render: (r) => <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text-muted)' }}>{r.products_count ?? 0}</span> },
  { key: 'sort_order', label: 'Order', width: '60px', render: (r) => <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--a-text-muted)' }}>{r.sort_order}</span> },
];

const blank = () => ({ name: '', name_en: '', slug: '', color: '#3C7A58', sort_order: 0, is_active: true });

export default function TagsPage() {
  const [tags, setTags]       = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<Partial<Tag>>(blank());
  const [editId, setEditId]   = useState<number | null>(null);
  const [open, setOpen]       = useState(false);
  const [delId, setDelId]     = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.tags.list() as { data?: Tag[] } | Tag[];
      setTags(Array.isArray(res) ? res : (res as { data?: Tag[] }).data ?? []);
    } catch { setTags([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(blank()); setError(''); setOpen(true); };
  const openEdit   = (t: Tag) => { setEditId(t.id); setForm({ ...t }); setError(''); setOpen(true); };

  const handleSave = async () => {
    if (!form.name) { setError('Name required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name!) };
      if (editId) await adminApi.tags.update(editId, payload);
      else        await adminApi.tags.create(payload);
      setOpen(false); load();
    } catch (e: unknown) { setError((e as Error)?.message ?? 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await adminApi.tags.delete(delId); setDelId(null); load(); } catch { /* */ }
  };

  const actions: TableAction<Tag>[] = [
    { label: 'Edit',   icon: Pencil, onClick: openEdit },
    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: (t) => setDelId(t.id) },
  ];

  return (
    <>
      <AdminPageHeader title="Tags" subtitle="Reusable labels to highlight products across all categories."
        actions={<button className="admin-btn admin-btn-primary" onClick={openCreate}><Plus size={15} />Add Tag</button>}
      />

      {/* Preset chips for quick creation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="admin-card"
        style={{ padding: '14px 18px', marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Sparkles size={13} style={{ color: 'var(--a-green)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--a-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Add Presets</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => {
            const exists = tags.some((t) => t.name === p.name);
            return (
              <button
                key={p.name}
                style={{
                  padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: exists ? 'var(--a-surface-2)' : p.color, color: exists ? 'var(--a-text-dim)' : 'white',
                  border: 'none', cursor: exists ? 'default' : 'pointer',
                  opacity: exists ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: exists ? 'none' : `0 2px 6px ${p.color}33`,
                }}
                disabled={exists}
                onClick={() => { setEditId(null); setForm({ name: p.name, color: p.color, slug: slugify(p.name), sort_order: 0, is_active: true }); setOpen(true); }}
              >
                {exists ? `✓ ${p.name}` : p.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="admin-card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <AdminDataTable data={tags} columns={COLS} actions={actions} keyFn={(t) => t.id}
          loading={loading} searchPlaceholder="Search tags…" emptyTitle="No tags yet"
          emptySubtitle="Tags let you highlight products across all pages." onRowClick={openEdit}
        />
      </motion.div>

      <AdminModal open={open} onClose={() => setOpen(false)}
        title={editId ? 'Edit Tag' : 'New Tag'} size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save' : 'Create'}
            </button>
          </>
        }
      >
        {error && <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="admin-label">Name (FR) *</label>
              <input className="admin-input" value={form.name ?? ''} placeholder="Best Seller"
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: editId ? p.slug : slugify(e.target.value) }))} required />
            </div>
            <div>
              <label className="admin-label">Name (EN)</label>
              <input className="admin-input" value={form.name_en ?? ''} placeholder="Best Seller"
                onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="admin-label">Slug</label>
              <input className="admin-input" value={form.slug ?? ''} placeholder="best-seller"
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
            </div>
            <div>
              <label className="admin-label">Badge Colour</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color ?? '#3C7A58'}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  style={{ width: 40, height: 38, borderRadius: 10, border: '1px solid var(--a-border)', cursor: 'pointer', padding: 2, background: 'var(--a-surface-2)' }}
                />
                <span style={{ padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: form.color, color: 'white', boxShadow: `0 1px 4px ${form.color}33` }}>
                  {form.name || 'Preview'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="admin-label">Sort Order</label>
              <input className="admin-input" type="number" value={form.sort_order ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
            </div>
            <div style={{ paddingBottom: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  style={{ width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', background: form.is_active ? 'var(--a-green)' : 'var(--a-surface-3)', border: '1px solid var(--a-border)', transition: 'all 0.25s ease' }}>
                  <div style={{ position: 'absolute', top: 2, left: form.is_active ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--a-text)' }}>Active</span>
              </label>
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal open={!!delId} onClose={() => setDelId(null)} title="Delete Tag" size="sm"
        footer={<><button className="admin-btn admin-btn-ghost" onClick={() => setDelId(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></>}
      >
        <p style={{ fontSize: 14, color: 'var(--a-text-muted)' }}>Delete this tag? It will be removed from all products it's applied to.</p>
      </AdminModal>
    </>
  );
}
