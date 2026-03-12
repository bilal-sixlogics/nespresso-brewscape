'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge }      from '@/components/admin/ui/AdminBadge';
import { AdminModal }      from '@/components/admin/ui/AdminModal';
import { adminApi }        from '@/lib/admin/api';
import type { Brand }      from '@/types/admin';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

const COLS: Column<Brand>[] = [
  {
    key: 'name', label: 'Brand', sortable: true,
    render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {r.logo_path ? (
          <img src={`/storage/${r.logo_path}`} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: '#fff', border: '1px solid var(--a-border)' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--a-green-light), var(--a-surface-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--a-green)' }}>
            {r.name[0]}
          </div>
        )}
        <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
      </div>
    ),
  },
  { key: 'slug', label: 'Slug', render: (r) => <code style={{ fontSize: 11, opacity: 0.7, background: 'var(--a-surface-2)', padding: '2px 8px', borderRadius: 6 }}>{r.slug}</code> },
  {
    key: 'website', label: 'Website',
    render: (r) => r.website ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--a-green-hover)' }}>
        <Globe size={11} />
        {r.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </span>
    ) : <span style={{ color: 'var(--a-text-dim)', fontSize: 12 }}>—</span>,
  },
  {
    key: 'is_active', label: 'Active', width: '70px',
    render: (r) => <AdminBadge variant={r.is_active ? 'green' : 'gray'} dot>{r.is_active ? 'Yes' : 'No'}</AdminBadge>,
  },
];

const blank = () => ({ name: '', slug: '', website: '', is_active: true });

export default function BrandsPage() {
  const [brands, setBrands]   = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<Partial<Brand>>(blank());
  const [editId, setEditId]   = useState<number | null>(null);
  const [open, setOpen]       = useState(false);
  const [delId, setDelId]     = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.brands.list() as { data?: Brand[] } | Brand[];
      setBrands(Array.isArray(res) ? res : (res as { data?: Brand[] }).data ?? []);
    } catch { setBrands([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(blank()); setError(''); setOpen(true); };
  const openEdit   = (b: Brand) => { setEditId(b.id); setForm({ ...b }); setError(''); setOpen(true); };

  const handleSave = async () => {
    if (!form.name) { setError('Name required.'); return; }
    setSaving(true); setError('');
    try {
      if (editId) await adminApi.brands.update(editId, form);
      else        await adminApi.brands.create(form);
      setOpen(false); load();
    } catch (e: unknown) { setError((e as Error)?.message ?? 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await adminApi.brands.delete(delId); setDelId(null); load(); } catch { /* */ }
  };

  const actions: TableAction<Brand>[] = [
    { label: 'Edit',   icon: Pencil, onClick: openEdit },
    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: (b) => setDelId(b.id) },
  ];

  return (
    <>
      <AdminPageHeader title="Brands" subtitle="Manage product brands shown in the catalogue."
        actions={<button className="admin-btn admin-btn-primary" onClick={openCreate}><Plus size={15} />Add Brand</button>}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="admin-card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <AdminDataTable data={brands} columns={COLS} actions={actions} keyFn={(b) => b.id}
          loading={loading} searchPlaceholder="Search brands…" emptyTitle="No brands yet" onRowClick={openEdit}
        />
      </motion.div>

      <AdminModal open={open} onClose={() => setOpen(false)}
        title={editId ? 'Edit Brand' : 'New Brand'} size="sm"
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
          {[
            { l: 'Brand Name *', k: 'name',    ph: 'e.g. Nespresso' },
            { l: 'Slug',         k: 'slug',    ph: 'nespresso' },
            { l: 'Website URL',  k: 'website', ph: 'https://nespresso.com' },
          ].map(({ l, k, ph }) => (
            <div key={k}>
              <label className="admin-label">{l}</label>
              <input className="admin-input" value={(form as Record<string, unknown>)[k] as string ?? ''} placeholder={ph}
                onChange={(e) => setForm((p) => ({
                  ...p, [k]: e.target.value,
                  ...(k === 'name' && !editId ? { slug: slugify(e.target.value) } : {}),
                }))}
              />
            </div>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              style={{ width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', background: form.is_active ? 'var(--a-green)' : 'var(--a-surface-3)', border: '1px solid var(--a-border)', transition: 'all 0.25s ease' }}>
              <div style={{ position: 'absolute', top: 2, left: form.is_active ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--a-text)' }}>Active</span>
          </label>
        </div>
      </AdminModal>

      <AdminModal open={!!delId} onClose={() => setDelId(null)} title="Delete Brand" size="sm"
        footer={<><button className="admin-btn admin-btn-ghost" onClick={() => setDelId(null)}>Cancel</button><button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button></>}
      >
        <p style={{ fontSize: 14, color: 'var(--a-text-muted)' }}>Delete this brand? Products using it will have no brand assigned.</p>
      </AdminModal>
    </>
  );
}
