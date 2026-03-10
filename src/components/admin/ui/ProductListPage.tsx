'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { AdminPageHeader }  from './AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from './AdminDataTable';
import { AdminBadge }       from './AdminBadge';
import { AdminModal }       from './AdminModal';
import { ProductForm }      from './ProductForm';
import { adminApi }         from '@/lib/admin/api';
import type { Product }     from '@/types/admin';

type ProductType = 'coffee' | 'machine' | 'accessory' | 'sweet';

interface Props {
  type:        ProductType;
  title:       string;
  subtitle?:   string;
  typeLabel?:  string;
}

const TYPE_PREFIX: Record<ProductType, string> = {
  coffee: 'COF', machine: 'MCH', accessory: 'ACC', sweet: 'SWT',
};

const COLS: Column<Product>[] = [
  {
    key: 'name',
    label: 'Product',
    sortable: true,
    render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Thumbnail */}
        <div
          style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
            background: 'var(--color-a-surface-2)',
            border: '1px solid var(--color-a-border)',
          }}
        >
          {r.images?.[0]?.path ? (
            <img
              src={`/storage/${r.images[0].path}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'var(--color-a-text-dim)',
            }}>
              {r.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>
            {r.sku ?? '—'} · {r.category?.name ?? 'Uncategorised'}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    width: '90px',
    render: (r) => (
      <div>
        <span style={{ fontWeight: 700 }}>€{Number(r.price).toFixed(2)}</span>
        {r.original_price && Number(r.original_price) > Number(r.price) && (
          <div style={{ fontSize: 10.5, color: 'var(--color-a-text-dim)', textDecoration: 'line-through' }}>
            €{Number(r.original_price).toFixed(2)}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'brand',
    label: 'Brand',
    render: (r) => r.brand?.name
      ? <AdminBadge variant="gray">{r.brand.name}</AdminBadge>
      : <span style={{ color: 'var(--color-a-text-dim)' }}>—</span>,
  },
  {
    key: 'in_stock',
    label: 'Stock',
    width: '90px',
    render: (r) => (
      <AdminBadge variant={r.in_stock ? 'green' : 'red'} dot>
        {r.in_stock ? 'In Stock' : 'Out'}
      </AdminBadge>
    ),
  },
  {
    key: 'is_active',
    label: 'Status',
    width: '80px',
    render: (r) => (
      <AdminBadge variant={r.is_active ? 'green' : 'gray'} dot>
        {r.is_active ? 'Active' : 'Inactive'}
      </AdminBadge>
    ),
  },
  {
    key: 'updated_at',
    label: 'Updated',
    sortable: true,
    width: '100px',
    render: (r) => (
      <span style={{ fontSize: 11.5, color: 'var(--color-a-text-muted)' }}>
        {new Date(r.updated_at).toLocaleDateString()}
      </span>
    ),
  },
];

export function ProductListPage({ type, title, subtitle, typeLabel }: Props) {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);
  const [editItem, setEditItem]   = useState<Product | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.products.byType(type) as { data?: Product[] } | Product[];
      const list = Array.isArray(res) ? res : (res as { data?: Product[] }).data ?? [];
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setFormOpen(true); setError(''); };
  const openEdit   = (p: Product) => { setEditItem(p); setFormOpen(true); setError(''); };
  const closeForm  = () => { setFormOpen(false); setEditItem(null); };

  const handleSave = async (data: Partial<Product>) => {
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await adminApi.products.update(editItem.id, { ...data, product_type: type });
      } else {
        await adminApi.products.create({ ...data, product_type: type });
      }
      closeForm();
      await load();
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.products.delete(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      await adminApi.products.update(p.id, { is_active: !p.is_active });
      await load();
    } catch { /* ignore */ }
  };

  const actions: TableAction<Product>[] = [
    { label: 'Edit',   icon: Pencil,      onClick: openEdit },
    {
      label: 'Toggle', icon: p => p.is_active ? ToggleLeft : ToggleRight,
      onClick: toggleActive,
    },
    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: (p) => setDeleteId(p.id) },
  ];

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle={subtitle ?? `Manage all ${typeLabel ?? title.toLowerCase()} in the catalogue.`}
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={15} />
            Add {typeLabel ?? 'Product'}
          </button>
        }
      />

      {/* Quick filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'All', filter: null },
          { label: 'Active', filter: true },
          { label: 'Inactive', filter: false },
        ].map(({ label }) => (
          <button key={label} className="admin-btn admin-btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="admin-btn admin-btn-ghost" onClick={load} style={{ padding: '5px 10px', fontSize: 12 }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <AdminDataTable
        data={products}
        columns={COLS}
        actions={actions}
        keyFn={(p) => p.id}
        loading={loading}
        searchPlaceholder={`Search ${typeLabel ?? title.toLowerCase()}…`}
        emptyTitle={`No ${typeLabel ?? title.toLowerCase()} yet`}
        emptySubtitle="Click 'Add' to create your first product."
        onRowClick={openEdit}
      />

      {/* Create / Edit modal */}
      <AdminModal
        open={formOpen}
        onClose={closeForm}
        title={editItem ? `Edit ${typeLabel ?? 'Product'}` : `New ${typeLabel ?? 'Product'}`}
        subtitle={editItem ? `Editing: ${editItem.name}` : undefined}
        size="xl"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={closeForm}>Cancel</button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => document.getElementById('product-form-submit')?.click()}
              disabled={saving}
            >
              {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create'}
            </button>
          </>
        }
      >
        {error && (
          <div style={{
            marginBottom: 12, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', fontSize: 13,
          }}>
            {error}
          </div>
        )}
        <ProductForm
          product={editItem}
          type={type}
          skuPrefix={TYPE_PREFIX[type]}
          onSubmit={handleSave}
        />
      </AdminModal>

      {/* Delete confirm modal */}
      <AdminModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        subtitle="This cannot be undone."
        size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="admin-btn admin-btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--color-a-text-muted)' }}>
          Are you sure you want to delete this product? All images, sale units and related data will also be removed.
        </p>
      </AdminModal>
    </>
  );
}
