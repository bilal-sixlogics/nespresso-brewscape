'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AdminPageHeader }  from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge }       from '@/components/admin/ui/AdminBadge';
import { adminApi }         from '@/lib/admin/api';
import type { Order }       from '@/types/admin';

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABELS: Record<string, 'green' | 'red' | 'amber' | 'sky' | 'gray'> = {
  pending:    'gray',
  processing: 'amber',
  shipped:    'sky',
  delivered:  'green',
  cancelled:  'red',
};

const COLS: Column<Order>[] = [
  {
    key: 'id',
    label: '#',
    width: '70px',
    render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--a-text-muted)' }}>#{r.id}</span>,
  },
  {
    key: 'billing_name',
    label: 'Customer',
    sortable: true,
    render: (r) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.billing_name ?? r.user?.name ?? 'Guest'}</div>
        <div style={{ fontSize: 11, color: 'var(--a-text-muted)' }}>
          {r.billing_email ?? r.user?.email ?? '—'}
        </div>
      </div>
    ),
  },
  {
    key: 'total_amount',
    label: 'Total',
    sortable: true,
    width: '90px',
    render: (r) => <span style={{ fontWeight: 700 }}>€{Number(r.total_amount ?? 0).toFixed(2)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    width: '120px',
    render: (r) => (
      <AdminBadge variant={STATUS_LABELS[r.status] ?? 'gray'} dot>
        {r.status}
      </AdminBadge>
    ),
  },
  {
    key: 'payment_method',
    label: 'Payment',
    width: '100px',
    render: (r) => <span style={{ fontSize: 12, color: 'var(--a-text-muted)' }}>{r.payment_method ?? '—'}</span>,
  },
  {
    key: 'created_at',
    label: 'Date',
    sortable: true,
    width: '100px',
    render: (r) => (
      <span style={{ fontSize: 12, color: 'var(--a-text-muted)' }}>
        {new Date(r.created_at).toLocaleDateString()}
      </span>
    ),
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.orders.list(1, filterStatus) as { data?: Order[] } | Order[];
      const list = Array.isArray(res) ? res : (res as { data?: Order[] }).data ?? [];
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const actions: TableAction<Order>[] = [
    { label: 'View', icon: Eye, onClick: (o) => router.push(`/admin/orders/${o.id}`) },
  ];

  return (
    <>
      <AdminPageHeader
        title="Orders"
        subtitle="Manage customer orders and update fulfilment status."
      />

      {/* Status filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {['', ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            className="admin-btn admin-btn-ghost"
            style={{
              padding: '6px 14px', fontSize: 12, borderRadius: 10,
              fontWeight: filterStatus === s ? 600 : 400,
              textTransform: 'capitalize',
              ...(filterStatus === s ? {
                background: 'var(--a-green-light)',
                color: 'var(--a-green-hover)',
                borderColor: 'var(--a-green-muted)',
              } : {}),
              transition: 'all 0.2s ease',
            }}
            onClick={() => setFilter(s)}
          >
            {s || 'All'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={load}
            style={{ padding: '6px 10px', borderRadius: 10 }}
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
          data={orders}
          columns={COLS}
          actions={actions}
          keyFn={(o) => o.id}
          loading={loading}
          searchPlaceholder="Search by customer, email, order #…"
          emptyTitle="No orders found"
          emptySubtitle="Orders will appear here once customers start purchasing."
          onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
        />
      </motion.div>
    </>
  );
}
