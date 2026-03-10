'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, BarChart2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

// ── Simple SVG mini chart helpers ────────────────────────────────────────────
function Sparkline({ data, color = '#3C7A58', height = 60, filled = true }: { data: number[]; color?: string; height?: number; filled?: boolean }) {
  if (!data.length) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const w = 100 / (data.length - 1);
  const pts = data.map((v, i) => `${i * w},${height - ((v - min) / (max - min || 1)) * (height - 4) - 2}`).join(' ');
  const area = `0,${height} ${pts} ${(data.length - 1) * w},${height}`;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {filled && <polygon points={area} fill={`${color}22`} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = 40;
  const cx = 55;
  const cy = 55;
  const circum = 2 * Math.PI * r;

  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circum;
    const offset = circum - cumulative * circum;
    cumulative += pct;
    return { ...d, dash, offset, color: colors[i % colors.length] };
  });

  return (
    <svg viewBox="0 0 110 110" style={{ width: 110, height: 110 }}>
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={`${s.dash} ${circum - s.dash}`}
          strokeDashoffset={s.offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.5s' }}
        />
      ))}
      <circle cx={cx} cy={cy} r={30} fill="var(--color-a-surface)" />
    </svg>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const genTrend = (base: number, len = 30) => Array.from({ length: len }, (_, i) => Math.max(0, base + Math.round((Math.random() - 0.4) * base * 0.4) + i * (base * 0.01)));

const MOCK = {
  revenue_trend: genTrend(3200),
  orders_trend:  genTrend(18),
  revenue_today: 4821,
  orders_today:  31,
  avg_order:     155.5,
  new_customers: 8,
  revenue_by_category: [
    { label: 'Coffee', value: 14200 },
    { label: 'Machines', value: 9800 },
    { label: 'Accessories', value: 3400 },
    { label: 'Sweets', value: 1200 },
  ],
  top_products: [
    { name: 'Espresso Intense 50 caps', revenue: 4200, units: 84 },
    { name: 'Inissia Machine',          revenue: 3900, units: 13 },
    { name: 'Lungo Classico 50 caps',   revenue: 2800, units: 56 },
    { name: 'Lattissima Pro',           revenue: 2600, units: 8  },
    { name: 'Travel Kit',               revenue: 1800, units: 36 },
  ],
  recent_days: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
    revenue: Math.round(2000 + Math.random() * 3000),
    orders:  Math.round(10 + Math.random() * 25),
  })),
};

const CAT_COLORS = ['#3C7A58', '#5BA07A', '#84C19A', '#B2D9BF'];
const PERIOD_OPTIONS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function AnalyticsPage() {
  const [period, setPeriod]   = useState(30);
  const [stats, setStats]     = useState(MOCK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.dashboard.stats()
      .then((d: any) => setStats({ ...MOCK, ...d }))
      .catch(() => setStats(MOCK))
      .finally(() => setLoading(false));
  }, [period]);

  const kpis = [
    { label: "Revenue Today",  value: `€${stats.revenue_today.toLocaleString()}`, icon: DollarSign, color: '#3C7A58', trend: '+12%' },
    { label: "Orders Today",   value: stats.orders_today,                           icon: ShoppingCart, color: '#60A5FA', trend: '+8%'  },
    { label: "Avg Order Value",value: `€${stats.avg_order.toFixed(2)}`,             icon: BarChart2,    color: '#A78BFA', trend: '+3%'  },
    { label: "New Customers",  value: stats.new_customers,                          icon: Users,        color: '#F59E0B', trend: '+5%'  },
  ];

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        subtitle="Revenue, orders, and product performance insights."
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            {PERIOD_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`admin-btn ${period === o.value ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                onClick={() => setPeriod(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {kpis.map(({ label, value, icon: Icon, color, trend }, idx) => (
          <motion.div
            key={label}
            className="admin-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            style={{ padding: '18px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} style={{ color }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#34D399' }}>{trend}</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 24, fontWeight: 700 }}>{loading ? '—' : value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend + Category Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="admin-card-title" style={{ marginBottom: 0 }}>Revenue Trend ({period}d)</div>
            <TrendingUp size={15} style={{ color: 'var(--color-a-green)' }} />
          </div>
          <Sparkline data={stats.revenue_trend.slice(-period)} height={100} />
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Revenue by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <DonutChart data={stats.revenue_by_category} colors={CAT_COLORS} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats.revenue_by_category.map((d, i) => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[i] }} />
                    <span>{d.label}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>€{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="admin-card">
          <div className="admin-card-title">Orders Trend ({period}d)</div>
          <Sparkline data={stats.orders_trend.slice(-period)} color="#60A5FA" height={80} />
        </div>

        {/* Daily breakdown */}
        <div className="admin-card">
          <div className="admin-card-title">Last 7 Days</div>
          <table className="admin-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenue</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_days.map(d => (
                <tr key={d.date}>
                  <td style={{ color: 'var(--color-a-text-muted)' }}>{d.date}</td>
                  <td style={{ fontWeight: 600 }}>€{d.revenue.toLocaleString()}</td>
                  <td>{d.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="admin-card">
        <div className="admin-card-title">Top Products by Revenue</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Revenue</th>
              <th>Units Sold</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {stats.top_products.map((p, i) => {
              const maxRev = stats.top_products[0].revenue;
              return (
                <tr key={p.name}>
                  <td style={{ fontWeight: 700, color: i === 0 ? 'var(--color-a-green)' : 'var(--color-a-text-muted)', width: 30 }}>#{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontWeight: 700 }}>€{p.revenue.toLocaleString()}</td>
                  <td>{p.units}</td>
                  <td style={{ minWidth: 120 }}>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--color-a-surface-3)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.revenue / maxRev) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                        style={{ height: '100%', background: 'var(--color-a-green)', borderRadius: 3 }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
