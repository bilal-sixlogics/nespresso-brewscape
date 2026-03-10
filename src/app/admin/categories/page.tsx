'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge }      from '@/components/admin/ui/AdminBadge';
import { AdminModal }      from '@/components/admin/ui/AdminModal';
import { adminApi }        from '@/lib/admin/api';
import type { Category }   from '@/types/admin';

const TYPE_OPTIONS = [
  { value: 'all',       label: 'All Types' },
  { value: 'coffee',    label: 'Coffee & Capsules' },
  { value: 'machine',   label: 'Machines' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'sweet',     label: 'Treats & Sweets' },
];

const COLS: Column<Category>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (r) => (
      <div>
        <div style={{ fontWeight: 600 }}>{r.name}</div>
        {r.name_en && <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{r.name_en}</div>}
      </div>
    ),
  },
  { key: 'slug', label: 'Slug', render: (r) => <code style={{ fontSize: 11, opacity: 0.7 }}>{r.slug}</code> },
  {
    key: 'product_type',
    label: 'Type',
    render: (r) => <AdminBadge variant="primary">{r.product_type}</AdminBadge>,
  },
  {
    key: 'is_active',
    label: 'Active',
    width: '70px',
    render: (r) => <AdminBadge variant={r.is_active ? 'green' : 'gray'} dot>{r.is_active ? 'Yes' : 'No'}</AdminBadge>,
  },
  { key: 'sort_order', label: 'Order', width: '60px', render: (r) => <span style={{ fontSize: 12 }}>{r.sort_order}</span> },
];

const blank = (): Partial<Category> => ({
  name: '', name_en: '', slug: '', description: '', product_type: 'coffee', sort_order: 0, is_active: true,
});

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

export default function CategoriesPage() {
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<Partial<Category>>(blank());
  const [editId, setEditId]   = useState<number | null>(null);
  const [open, setOpen]       = useState(false);
  const [delId, setDelId]     = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.categories.list() as { data?: Category[] } | Category[];
      setCats(Array.isArray(res) ? res : (res as { data?: Category[] }).data ?? []);
    } catch { setCats([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(blank()); setError(''); setOpen(true); };
  const openEdit   = (c: Category) => { setEditId(c.id); setForm({ ...c }); setError(''); setOpen(true); };

  const handleSave = async () => {
    if (!form.name) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editId) { await adminApi.categories.update(editId, form); }
      else        { await adminApi.categories.create(form); }
      setOpen(false); load();
    } catch (e: unknown) { setError((e as Error)?.message ?? 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await adminApi.categories.delete(delId); setDelId(null); load(); } catch { /* */ }
  };

  const actions: TableAction<Category>[] = [
    { label: 'Edit',   icon: Pencil, onClick: openEdit },
    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: (c) => setDelId(c.id) },
  ];

  const f = (label: string, node: React.ReactNode) => (
    <div><label className="admin-label">{label}</label>{node}</div>
  );

  return (
    <>
      <AdminPageHeader title="Categories" subtitle="Organise your catalogue into categories per product type."
        actions={<button className="admin-btn admin-btn-primary" onClick={openCreate}><Plus size={15} />Add Category</button>}
      />
      <AdminDataTable data={cats} columns={COLS} actions={actions} keyFn={(c) => c.id}
        loading={loading} searchPlaceholder="Search categories…" emptyTitle="No categories yet"
        emptySubtitle="Create your first category to organise products." onRowClick={openEdit}
      />

      <AdminModal open={open} onClose={() => setOpen(false)}
        title={editId ? 'Edit Category' : 'New Category'} size="md"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create'}
            </button>
          </>
        }
      >
        {error && <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {f('Name (FR) *', <input className="admin-input" value={form.name ?? ''} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value, slug: editId ? p.slug : slugify(e.target.value) })); }} required />)}
            {f('Name (EN)',   <input className="admin-input" value={form.name_en ?? ''} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {f('Slug', <input className="admin-input" value={form.slug ?? ''} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />)}
            {f('Product Type', (
              <select className="admin-input admin-select" value={form.product_type ?? 'all'} onChange={(e) => setForm((p) => ({ ...p, product_type: e.target.value as Category['product_type'] }))}>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            ))}
          </div>
          {f('Description (FR)', <textarea className="admin-input" rows={2} value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {f('Sort Order', <input className="admin-input" type="number" value={form.sort_order ?? 0} onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} />)}
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
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

      <AdminModal open={!!delId} onClose={() => setDelId(null)} title="Delete Category" size="sm"
        footer={<><button className="admin-btn admin-btn-ghost" onClick={() => setDelId(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></>}
      >
        <p style={{ fontSize: 14, color: 'var(--color-a-text-muted)' }}>Delete this category? Products in this category will be uncategorised.</p>
      </AdminModal>
    </>
  );
}
