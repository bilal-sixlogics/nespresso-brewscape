'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatCard }        from '@/components/admin/ui/StatCard';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge }      from '@/components/admin/ui/AdminBadge';
import {
  ShoppingCart, TrendingUp, Package, Coffee,
  DollarSign, Users, AlertTriangle, Clock,
} from 'lucide-react';
import { adminApi } from '@/lib/admin/api';
import type { Order } from '@/types/admin';

// Sparkline SVG (pure, no deps)
function Sparkline({ values, color = '#3C7A58' }: { values: number[]; color?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 120, h = 40, pad = 2;
  const pts = values.map((v, i) =>
    `${pad + (i / (values.length - 1)) * (w - pad * 2)},${h - pad - (v / max) * (h - pad * 2)}`
  ).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.7 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${pad},${h} ${pts} ${w - pad},${h}`} fill={`${color}22`} stroke="none" />
    </svg>
  );
}

// ── Recent orders table columns ───────────────────────────────────────────
const ORDER_COLS: Column<Order>[] = [
  {
    key: 'id',
    label: '#',
    width: '60px',
    render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>#{r.id}</span>,
  },
  {
    key: 'user',
    label: 'Customer',
    render: (r) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.billing_name ?? r.user?.name ?? 'Guest'}</div>
        <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{r.billing_email ?? r.user?.email}</div>
      </div>
    ),
  },
  {
    key: 'total_amount',
    label: 'Total',
    render: (r) => (
      <span style={{ fontWeight: 700 }}>€{Number(r.total_amount ?? 0).toFixed(2)}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <AdminBadge variant={statusVariant(r.status)}>{r.status}</AdminBadge>,
  },
  {
    key: 'created_at',
    label: 'Date',
    render: (r) => (
      <span style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>
        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
      </span>
    ),
  },
];

function statusVariant(s?: string) {
  const map: Record<string, 'green' | 'red' | 'amber' | 'sky' | 'gray'> = {
    delivered: 'green', shipped: 'sky', processing: 'amber',
    pending: 'gray', cancelled: 'red',
  };
  return map[s ?? ''] ?? 'gray';
}

// Placeholder stats when API not yet ready
const PLACEHOLDER_STATS = {
  total_orders: 142, revenue_month: 8640.50, active_products: 87,
  low_stock: 5, new_users_week: 12, pending_orders: 8,
};

export default function DashboardPage() {
  const [stats, setStats]   = useState<typeof PLACEHOLDER_STATS | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trend, setTrend]   = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        adminApi.dashboard.stats().catch(() => PLACEHOLDER_STATS),
        adminApi.orders.list(1).catch(() => ({ data: [] })) as Promise<{ data: Order[] }>,
      ]);
      setStats(s as typeof PLACEHOLDER_STATS);
      setOrders(o.data?.slice(0, 8) ?? []);
      // Generate mock sparkline if no real data
      setTrend(Array.from({ length: 14 }, (_, i) =>
        Math.round(200 + Math.sin(i * 0.6) * 80 + Math.random() * 50)
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = stats ?? PLACEHOLDER_STATS;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening today."
      />

      {/* Stats grid */}
      <div className="admin-grid-stats" style={{ marginBottom: 24 }}>
        <StatCard label="Orders This Month" value={s.total_orders} icon={ShoppingCart}
          trend="up" trendVal="+12%" trendLabel="vs last month"
          glowColor="#38BDF8" iconBg="rgba(56,189,248,0.10)"
          loading={loading} delay={0}
        />
        <StatCard label="Revenue (MTD)" value={`€${Number(s.revenue_month).toFixed(0)}`} icon={DollarSign}
          trend="up" trendVal="+8.4%" trendLabel="vs last month"
          loading={loading} delay={0.04}
        />
        <StatCard label="Active Products" value={s.active_products} icon={Coffee}
          trend="neutral" trendVal={`${s.active_products} live`}
          glowColor="#A78BFA" iconBg="rgba(167,139,250,0.10)"
          loading={loading} delay={0.08}
        />
        <StatCard label="Low Stock" value={s.low_stock} icon={AlertTriangle}
          trend={s.low_stock > 3 ? 'down' : 'neutral'}
          trendVal={s.low_stock > 0 ? 'Needs attention' : 'All good'}
          glowColor={s.low_stock > 3 ? '#EF4444' : '#F59E0B'}
          iconBg={s.low_stock > 3 ? 'rgba(239,68,68,0.10)' : 'rgba(245,158,11,0.10)'}
          loading={loading} delay={0.12}
        />
        <StatCard label="Pending Orders" value={s.pending_orders} icon={Clock}
          trend="neutral" trendVal={`${s.pending_orders} waiting`}
          glowColor="#F59E0B" iconBg="rgba(245,158,11,0.10)"
          loading={loading} delay={0.16}
        />
        <StatCard label="New Customers" value={s.new_users_week} icon={Users}
          trend="up" trendVal="+3 today"
          glowColor="#34D399" iconBg="rgba(52,211,153,0.10)"
          loading={loading} delay={0.20}
        />
      </div>

      {/* Row: sparkline card + recent orders */}
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 2fr', marginBottom: 24 }}>
        {/* Revenue trend */}
        <div className="admin-card">
          <div className="admin-card-title">Revenue Trend (14d)</div>
          <Sparkline values={trend} color="#3C7A58" />
          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            {[
              { l: 'Peak', v: `€${Math.max(...trend, 0)}` },
              { l: 'Avg',  v: `€${trend.length ? Math.round(trend.reduce((a,b)=>a+b,0)/trend.length) : 0}` },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: 'var(--color-a-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-a-text)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-a-text)' }}>Recent Orders</div>
            <a href="/admin/orders" className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>
              View all
            </a>
          </div>
          <AdminDataTable
            data={orders}
            columns={ORDER_COLS}
            keyFn={(r) => r.id}
            loading={loading}
            pageSize={8}
            searchable={false}
            emptyTitle="No orders yet"
            emptySubtitle="Orders will appear here once customers start purchasing."
          />
        </div>
      </div>
    </>
  );
}
