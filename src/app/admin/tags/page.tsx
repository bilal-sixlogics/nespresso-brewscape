'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
      <span style={{ background: r.color, color: 'white', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
        {r.name}
      </span>
    ),
  },
  { key: 'name_en', label: 'EN Name', render: (r) => r.name_en || <span style={{ color: 'var(--color-a-text-dim)' }}>—</span> },
  { key: 'slug',    label: 'Slug',    render: (r) => <code style={{ fontSize: 11, opacity: 0.7 }}>{r.slug}</code> },
  { key: 'products_count', label: 'Products', width: '80px',
    render: (r) => <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-a-text-muted)' }}>{r.products_count ?? 0}</span> },
  { key: 'sort_order', label: 'Order', width: '60px', render: (r) => <span style={{ fontSize: 12 }}>{r.sort_order}</span> },
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
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--color-a-text-dim)', alignSelf: 'center', marginRight: 4 }}>Quick add:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: p.color, color: 'white', border: 'none', cursor: 'pointer',
              opacity: tags.some((t) => t.name === p.name) ? 0.35 : 1,
            }}
            disabled={tags.some((t) => t.name === p.name)}
            onClick={() => { setEditId(null); setForm({ name: p.name, color: p.color, slug: slugify(p.name), sort_order: 0, is_active: true }); setOpen(true); }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <AdminDataTable data={tags} columns={COLS} actions={actions} keyFn={(t) => t.id}
        loading={loading} searchPlaceholder="Search tags…" emptyTitle="No tags yet"
        emptySubtitle="Tags let you highlight products across all pages." onRowClick={openEdit}
      />

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
        {error && <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#F87171', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                  style={{ width: 40, height: 38, borderRadius: 8, border: '1px solid var(--color-a-border)', cursor: 'pointer', padding: 2, background: 'var(--color-a-surface-2)' }}
                />
                <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: form.color, color: 'white' }}>
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
                  style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: form.is_active ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: form.is_active ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-a-text)' }}>Active</span>
              </label>
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal open={!!delId} onClose={() => setDelId(null)} title="Delete Tag" size="sm"
        footer={<><button className="admin-btn admin-btn-ghost" onClick={() => setDelId(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></>}
      >
        <p style={{ fontSize: 14, color: 'var(--color-a-text-muted)' }}>Delete this tag? It will be removed from all products it's applied to.</p>
      </AdminModal>
    </>
  );
}
