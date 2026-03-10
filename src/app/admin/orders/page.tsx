'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { AdminPageHeader }  from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge }       from '@/components/admin/ui/AdminBadge';
import { AdminModal }       from '@/components/admin/ui/AdminModal';
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
    render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>#{r.id}</span>,
  },
  {
    key: 'billing_name',
    label: 'Customer',
    sortable: true,
    render: (r) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.billing_name ?? r.user?.name ?? 'Guest'}</div>
        <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>
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
    render: (r) => <span style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{r.payment_method ?? '—'}</span>,
  },
  {
    key: 'created_at',
    label: 'Date',
    sortable: true,
    width: '100px',
    render: (r) => (
      <span style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>
        {new Date(r.created_at).toLocaleDateString()}
      </span>
    ),
  },
];

export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState('');
  const [detail, setDetail]         = useState<Order | null>(null);
  const [updating, setUpdating]     = useState(false);

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

  const handleUpdateStatus = async (id: number, status: string) => {
    setUpdating(true);
    try {
      await adminApi.orders.updateStatus(id, status);
      // Update local state + close detail
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o));
      setDetail((d) => d ? { ...d, status: status as Order['status'] } : d);
    } finally {
      setUpdating(false);
    }
  };

  const actions: TableAction<Order>[] = [
    { label: 'View', icon: Eye, onClick: (o) => setDetail(o) },
  ];

  return (
    <>
      <AdminPageHeader
        title="Orders"
        subtitle="Manage customer orders and update fulfilment status."
      />

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            className={`admin-btn admin-btn-ghost`}
            style={{
              padding: '5px 12px', fontSize: 12,
              ...(filterStatus === s ? {
                background: 'var(--color-a-green-light)',
                color: 'var(--color-a-green-hover)',
                borderColor: 'var(--color-a-green-muted)',
              } : {}),
            }}
            onClick={() => setFilter(s)}
          >
            {s || 'All'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="admin-btn admin-btn-ghost" onClick={load} style={{ padding: '5px 10px' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <AdminDataTable
        data={orders}
        columns={COLS}
        actions={actions}
        keyFn={(o) => o.id}
        loading={loading}
        searchPlaceholder="Search by customer, email, order #…"
        emptyTitle="No orders found"
        emptySubtitle="Orders will appear here once customers start purchasing."
        onRowClick={(o) => setDetail(o)}
      />

      {/* Order detail modal */}
      <AdminModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`Order #${detail?.id}`}
        subtitle={detail ? `Placed ${new Date(detail.created_at).toLocaleDateString()}` : undefined}
        size="lg"
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status pipeline */}
            <div className="admin-card">
              <div className="admin-card-title">Order Status</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUS_FLOW.filter((s) => s !== 'cancelled').map((s, i) => {
                  const idx = STATUS_FLOW.indexOf(detail.status);
                  const stepIdx = STATUS_FLOW.indexOf(s);
                  const done = stepIdx <= idx;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="admin-btn"
                        style={{
                          padding: '5px 12px', fontSize: 12,
                          background: detail.status === s ? 'var(--color-a-green)' : done ? 'var(--color-a-green-light)' : 'var(--color-a-surface-2)',
                          color: detail.status === s ? 'white' : done ? 'var(--color-a-green-hover)' : 'var(--color-a-text-muted)',
                          border: `1px solid ${detail.status === s ? 'var(--color-a-green)' : done ? 'var(--color-a-green-muted)' : 'var(--color-a-border)'}`,
                          cursor: detail.status !== s ? 'pointer' : 'default',
                        }}
                        onClick={() => detail.status !== s && handleUpdateStatus(detail.id, s)}
                        disabled={updating}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                      {i < 3 && <div style={{ width: 16, height: 1, background: 'var(--color-a-border-2)' }} />}
                    </div>
                  );
                })}
                <button
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => handleUpdateStatus(detail.id, 'cancelled')}
                  disabled={updating || detail.status === 'cancelled'}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Customer + totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-card">
                <div className="admin-card-title">Customer</div>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <tbody>
                    {[
                      ['Name',    detail.billing_name ?? detail.user?.name ?? 'Guest'],
                      ['Email',   detail.billing_email ?? detail.user?.email ?? '—'],
                      ['Phone',   detail.billing_phone ?? '—'],
                      ['Billing', detail.billing_address ?? '—'],
                      ['Shipping',detail.shipping_address ?? detail.billing_address ?? '—'],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ color: 'var(--color-a-text-muted)', paddingBottom: 6, width: '35%' }}>{k}</td>
                        <td style={{ fontWeight: 500 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-card">
                <div className="admin-card-title">Payment & Totals</div>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <tbody>
                    {[
                      ['Payment',  detail.payment_method ?? '—'],
                      ['Delivery', detail.delivery_type ?? '—'],
                      ['Promo',    detail.promo_code ?? '—'],
                      ['Subtotal', `€${Number(detail.subtotal ?? detail.total_amount).toFixed(2)}`],
                      ['Tax',      `€${Number(detail.tax_amount ?? 0).toFixed(2)}`],
                      ['Discount', detail.discount_amount ? `-€${Number(detail.discount_amount).toFixed(2)}` : '—'],
                      ['Total',    `€${Number(detail.total_amount).toFixed(2)}`],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ color: 'var(--color-a-text-muted)', paddingBottom: 6, width: '40%' }}>{k}</td>
                        <td style={{ fontWeight: k === 'Total' ? 700 : 500, fontSize: k === 'Total' ? 15 : 13 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Items */}
            {detail.items && detail.items.length > 0 && (
              <div className="admin-card">
                <div className="admin-card-title">Items ({detail.items.length})</div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                          {item.unit_label && (
                            <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{item.unit_label}</div>
                          )}
                        </td>
                        <td>{item.quantity}</td>
                        <td>€{Number(item.unit_price).toFixed(2)}</td>
                        <td style={{ fontWeight: 700 }}>€{Number(item.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            {detail.notes && (
              <div className="admin-card">
                <div className="admin-card-title">Notes</div>
                <p style={{ fontSize: 13, color: 'var(--color-a-text-muted)' }}>{detail.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </>
  );
}
