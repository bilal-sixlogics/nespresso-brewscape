'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, RefreshCw, Package, DollarSign, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
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

// ── Format a billing/shipping address that may come as object or string ──────
function fmtAddress(v: unknown): string {
  if (!v) return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const a = v as Record<string, string>;
    return [a.address, a.city, a.postal_code, a.country].filter(Boolean).join(', ') || '—';
  }
  return String(v);
}

const COLS: Column<Product>[] = [
  {
    key: 'name',
    label: 'Product',
    sortable: true,
    render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, maxWidth: '100%' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
            background: 'var(--a-surface-2)',
            border: '1px solid var(--a-border)',
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
              fontSize: 13, fontWeight: 700, color: 'var(--a-text-dim)',
              background: 'var(--a-green-light)',
            }}>
              {r.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontWeight: 600, fontSize: 13,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {r.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--a-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {r.sku ? <span style={{ fontFamily: 'monospace' }}>{r.sku}</span> : '—'}
            {r.category?.name && <span> · {r.category.name}</span>}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'brand',
    label: 'Brand',
    width: '130px',
    render: (r) => r.brand?.name
      ? <AdminBadge variant="gray">{r.brand.name}</AdminBadge>
      : <span style={{ color: 'var(--a-text-dim)', fontSize: 12 }}>—</span>,
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    width: '100px',
    render: (r) => (
      <div>
        <span style={{ fontWeight: 700, fontSize: 13 }}>€{Number(r.price).toFixed(2)}</span>
        {r.original_price && Number(r.original_price) > Number(r.price) && (
          <div style={{ fontSize: 10.5, color: 'var(--a-text-dim)', textDecoration: 'line-through' }}>
            €{Number(r.original_price).toFixed(2)}
          </div>
        )}
      </div>
    ),
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
    label: 'Active',
    width: '75px',
    render: (r) => (
      <AdminBadge variant={r.is_active ? 'green' : 'gray'} dot>
        {r.is_active ? 'Yes' : 'No'}
      </AdminBadge>
    ),
  },
  {
    key: 'is_featured',
    label: 'Featured',
    width: '75px',
    render: (r) => r.is_featured
      ? <AdminBadge variant="amber" dot>Yes</AdminBadge>
      : <span style={{ color: 'var(--a-text-dim)', fontSize: 12 }}>—</span>,
  },
  {
    key: 'updated_at',
    label: 'Updated',
    sortable: true,
    width: '90px',
    render: (r) => (
      <span style={{ fontSize: 11, color: 'var(--a-text-muted)', whiteSpace: 'nowrap' }}>
        {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—'}
      </span>
    ),
  },
];

type FilterVal = 'all' | 'active' | 'inactive';

export function ProductListPage({ type, title, subtitle, typeLabel }: Props) {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);
  const [editItem, setEditItem]   = useState<Product | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [total, setTotal]         = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterVal>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.products.byType(type, 1, '', 100) as {
        data?: Product[];
        total?: number;
        current_page?: number;
      } | Product[];

      if (Array.isArray(res)) {
        setProducts(res);
        setTotal(res.length);
      } else {
        const list = (res as { data?: Product[] }).data ?? [];
        setProducts(list);
        setTotal((res as { total?: number }).total ?? list.length);
      }
    } catch {
      setProducts([]);
      setTotal(0);
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

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'active') return p.is_active;
    if (activeFilter === 'inactive') return !p.is_active;
    return true;
  });

  // ── Computed stats ──────────
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const outOfStock = products.filter(p => !p.in_stock).length;
    const totalRevenue = products.reduce((sum, p) => sum + Number(p.price ?? 0), 0);
    const avgPrice = totalProducts > 0 ? totalRevenue / totalProducts : 0;
    const featured = products.filter(p => p.is_featured).length;

    // Top selling = highest review count (proxy for popularity)
    const topSelling = [...products].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))[0];

    return { totalProducts, activeProducts, outOfStock, totalRevenue, avgPrice, featured, topSelling };
  }, [products]);

  // ── Actions ──────────
  const actions: TableAction<Product>[] = [
    { label: 'Edit',   icon: Pencil,     onClick: openEdit },
    { label: 'Toggle', icon: ToggleLeft, onClick: toggleActive },
    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: (p) => setDeleteId(p.id) },
  ];

  const filters: { label: string; value: FilterVal }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle={
          subtitle ??
          `${total > 0 ? `${total} ` : ''}${typeLabel ?? title.toLowerCase()} in catalogue.`
        }
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={15} />
            Add {typeLabel ?? 'Product'}
          </button>
        }
      />

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        {/* Total Products */}
        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--a-green-light)', color: 'var(--a-green)', flexShrink: 0,
          }}>
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--a-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total Products</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--a-text)', lineHeight: 1.2 }}>{stats.totalProducts}</div>
            <div style={{ fontSize: 11, color: 'var(--a-green)', fontWeight: 600 }}>{stats.activeProducts} active</div>
          </div>
        </div>

        {/* Avg Price / Revenue */}
        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--a-accent-light)', color: 'var(--a-accent)', flexShrink: 0,
          }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--a-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Avg Price</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--a-text)', lineHeight: 1.2 }}>€{stats.avgPrice.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: 'var(--a-text-dim)' }}>across catalogue</div>
          </div>
        </div>

        {/* Top Selling */}
        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(251, 191, 36, 0.12)', color: '#F59E0B', flexShrink: 0,
          }}>
            <TrendingUp size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--a-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Top Rated</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--a-text)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.topSelling?.name ?? '—'}
            </div>
            <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
              {stats.topSelling ? `★ ${Number(stats.topSelling.average_rating ?? 0).toFixed(1)} · ${stats.topSelling.review_count ?? 0} reviews` : 'No data'}
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: stats.outOfStock > 0 ? 'rgba(239, 68, 68, 0.10)' : 'var(--a-green-light)',
            color: stats.outOfStock > 0 ? 'var(--a-danger)' : 'var(--a-green)', flexShrink: 0,
          }}>
            {stats.outOfStock > 0 ? <AlertTriangle size={20} /> : <Star size={20} />}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--a-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {stats.outOfStock > 0 ? 'Out of Stock' : 'Featured'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stats.outOfStock > 0 ? 'var(--a-danger)' : 'var(--a-text)', lineHeight: 1.2 }}>
              {stats.outOfStock > 0 ? stats.outOfStock : stats.featured}
            </div>
            <div style={{ fontSize: 11, color: stats.outOfStock > 0 ? 'var(--a-danger)' : 'var(--a-green)', fontWeight: 600 }}>
              {stats.outOfStock > 0 ? 'need restocking' : 'highlighted items'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick filter row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {filters.map(({ label, value }) => (
          <button
            key={value}
            className="admin-btn admin-btn-ghost"
            style={{
              padding: '6px 14px', fontSize: 12, borderRadius: 10,
              fontWeight: activeFilter === value ? 600 : 400,
              ...(activeFilter === value ? {
                background: 'var(--a-green-light)',
                color: 'var(--a-green-hover)',
                borderColor: 'var(--a-green-muted)',
              } : {}),
              transition: 'all 0.2s ease',
            }}
            onClick={() => setActiveFilter(value)}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={load}
            style={{ padding: '6px 10px', fontSize: 12, borderRadius: 10 }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="admin-card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <AdminDataTable
          data={filteredProducts}
          columns={COLS}
          actions={actions}
          keyFn={(p) => p.id}
          loading={loading}
          searchPlaceholder={`Search ${typeLabel ?? title.toLowerCase()}…`}
          emptyTitle={`No ${typeLabel ?? title.toLowerCase()} yet`}
          emptySubtitle="Click 'Add' to create your first product."
          onRowClick={openEdit}
          pageSize={25}
        />
      </motion.div>

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
            marginBottom: 12, padding: '8px 12px', borderRadius: 10,
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
        <p style={{ fontSize: 14, color: 'var(--a-text-muted)' }}>
          Are you sure you want to delete this product? All images, sale units and related data will also be removed.
        </p>
      </AdminModal>
    </>
  );
}

// Export the address formatter so orders page can use it too
export { fmtAddress };
