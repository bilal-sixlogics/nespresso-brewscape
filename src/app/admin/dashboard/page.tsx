'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatCard }        from '@/components/admin/ui/StatCard';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge }      from '@/components/admin/ui/AdminBadge';
import {
  ShoppingCart, DollarSign, Coffee, AlertTriangle,
  Users, Clock, Plus, Package, Tag, ArrowRight,
  TrendingUp, Eye, BarChart3, ChevronDown,
} from 'lucide-react';
import { adminApi } from '@/lib/admin/api';
import type { Order } from '@/types/admin';

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

// ── Sales Analytics bar chart (SVG) ──────────────────────────────────────────

interface BarData { day: string; current: number; previous: number; }

function SalesBarChart({ data }: { data: BarData[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 620, H = 220, PL = 48, PR = 16, PT = 16, PB = 40;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  const maxVal = Math.max(...data.flatMap(d => [d.current, d.previous]), 1);
  const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
  const barGroupW = innerW / data.length;
  const barW = barGroupW * 0.28;
  const barGap = barGroupW * 0.06;

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="bar-current" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A6B5A" />
            <stop offset="100%" stopColor="#14554A" />
          </linearGradient>
          <linearGradient id="bar-previous" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8734A" />
            <stop offset="100%" stopColor="#D4633D" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {ticks.map((v, i) => {
          const y = PT + innerH - (v / maxVal) * innerH;
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke="var(--a-border)" strokeWidth={1}
                strokeDasharray={i === 0 ? 'none' : '3,3'} opacity={0.6}
              />
              <text x={PL - 8} y={y + 4} textAnchor="end" fontSize={10} fill="var(--a-text-dim)">
                {v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const cx = PL + barGroupW * i + barGroupW / 2;
          const h1 = (d.previous / maxVal) * innerH;
          const h2 = (d.current / maxVal) * innerH;
          const isHovered = hover === i;

          return (
            <g key={d.day}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Hover highlight bg */}
              {isHovered && (
                <rect
                  x={cx - barGroupW / 2 + 4} y={PT}
                  width={barGroupW - 8} height={innerH}
                  fill="var(--a-surface-2)" rx={8} opacity={0.5}
                />
              )}

              {/* Previous bar */}
              <rect
                x={cx - barW - barGap / 2} y={PT + innerH - h1}
                width={barW} height={h1}
                fill="url(#bar-previous)" rx={6}
                opacity={isHovered ? 1 : 0.8}
                style={{ transition: 'opacity 0.2s' }}
              />

              {/* Current bar */}
              <rect
                x={cx + barGap / 2} y={PT + innerH - h2}
                width={barW} height={h2}
                fill="url(#bar-current)" rx={6}
                opacity={isHovered ? 1 : 0.8}
                style={{ transition: 'opacity 0.2s' }}
              />

              {/* Value label on hover */}
              {isHovered && (
                <text
                  x={cx} y={PT + innerH - Math.max(h1, h2) - 8}
                  textAnchor="middle" fontSize={12} fontWeight={700}
                  fill="var(--a-text)"
                >
                  ${d.current.toLocaleString()}
                </text>
              )}

              {/* X label */}
              <text
                x={cx} y={H - 10}
                textAnchor="middle" fontSize={11} fontWeight={500}
                fill={isHovered ? 'var(--a-text)' : 'var(--a-text-dim)'}
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Revenue line chart (smooth bezier) ───────────────────────────────────────

interface RevenuePoint { day: string; value: number; }

function RevenueLineChart({ data }: { data: RevenuePoint[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; pt: RevenuePoint } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data.length) return null;

  const W = 600, H = 180, PL = 48, PR = 16, PT = 20, PB = 36;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const range = maxVal || 1;

  const px = (i: number) => PL + (i / (data.length - 1)) * innerW;
  const py = (v: number) => PT + innerH - (v / range) * innerH;

  // Smooth bezier path
  const points = data.map((d, i) => ({ x: px(i), y: py(d.value) }));
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
    path += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }
  const lastPt = points[points.length - 1];
  const areaPath = `${path} L ${lastPt.x},${PT + innerH} L ${points[0].x},${PT + innerH} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (range / ticks) * i);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * W - PL;
    const idx = Math.round((relX / innerW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const pt = data[clamped];
    setTooltip({ x: px(clamped), y: py(pt.value), pt });
  };

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="rev-grad-new" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A6B5A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1A6B5A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PL} y1={py(v)} x2={W - PR} y2={py(v)}
              stroke="var(--a-border)" strokeWidth={1}
              strokeDasharray={i === 0 ? 'none' : '3,3'} opacity={0.5}
            />
            <text x={PL - 6} y={py(v) + 4} textAnchor="end" fontSize={10} fill="var(--a-text-dim)">
              €{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, i) => i % 2 === 0 && (
          <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--a-text-dim)">
            {d.day}
          </text>
        ))}

        {/* Area + Line */}
        <path d={areaPath} fill="url(#rev-grad-new)" />
        <path d={path} fill="none" stroke="#1A6B5A" strokeWidth={2.5} strokeLinecap="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#1A6B5A" opacity={0.4} />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x} y1={PT} x2={tooltip.x} y2={PT + innerH}
              stroke="#1A6B5A" strokeWidth={1} strokeDasharray="3,3" opacity={0.5}
            />
            <circle cx={tooltip.x} cy={tooltip.y} r={5} fill="#1A6B5A" stroke="white" strokeWidth={2} />
          </>
        )}
      </svg>

      {tooltip && (
        <div style={{
          position: 'absolute',
          top: `${(tooltip.y / H) * 100 - 12}%`,
          left: `${(tooltip.x / W) * 100}%`,
          transform: 'translate(-50%, -100%)',
          background: '#1A3B34',
          color: 'white',
          padding: '6px 12px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          {tooltip.pt.day} — €{tooltip.pt.value.toFixed(0)}
        </div>
      )}
    </div>
  );
}

// ── Donut chart for sales by category ────────────────────────────────────────

interface CategoryStat { name: string; count: number; revenue: number; }

const DONUT_COLORS = ['#1A6B5A', '#3A8FD6', '#E8734A', '#E8A33A', '#E05252', '#8B5CF6'];

function SalesByCategoryDonut({ data }: { data: CategoryStat[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.revenue, 0) || 1;
  const size = 170;
  const cx = size / 2, cy = size / 2;
  const r = 64, strokeW = 22;

  let offset = 0;
  const slices = data.map((d, i) => {
    const pct = d.revenue / total;
    const dashLen = 2 * Math.PI * r * pct;
    const dashGap = 2 * Math.PI * r * (1 - pct);
    const rotation = offset * 360 - 90;
    offset += pct;
    return { ...d, color: DONUT_COLORS[i % DONUT_COLORS.length], pct, dashLen, dashGap, rotation };
  });

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {/* Donut */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s, i) => (
            <circle
              key={s.name}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={hoverIdx === i ? strokeW + 4 : strokeW}
              strokeDasharray={`${s.dashLen} ${s.dashGap}`}
              transform={`rotate(${s.rotation} ${cx} ${cy})`}
              style={{ transition: 'stroke-width 0.2s', cursor: 'pointer' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--a-text)', letterSpacing: '-0.04em' }}>
            €{(total / 1000).toFixed(1)}K
          </div>
          <div style={{ fontSize: 10, color: 'var(--a-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Total
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0 }}>
        {slices.map((s, i) => (
          <div
            key={s.name}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 10,
              background: hoverIdx === i ? 'var(--a-surface-2)' : 'transparent',
              transition: 'background 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <span style={{
              width: 10, height: 10, borderRadius: 3,
              background: s.color, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--a-text)' }}>
                {s.name} ({(s.pct * 100).toFixed(0)}%)
              </div>
              <div style={{ fontSize: 10, color: 'var(--a-text-dim)' }}>
                {s.count.toLocaleString()} products
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--a-text)' }}>
              €{s.revenue.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Order status horizontal bars ─────────────────────────────────────────────

interface StatusCount { status: string; count: number; color: string; }

const STATUS_COLORS: Record<string, string> = {
  pending:    '#E8A33A',
  processing: '#3A8FD6',
  shipped:    '#8B5CF6',
  delivered:  '#1A9A5C',
  cancelled:  '#E05252',
};

function OrderStatusBars({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d) => (
        <div key={d.status}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 3, background: d.color,
                display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)', textTransform: 'capitalize' }}>
                {d.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--a-text-muted)' }}>
                {((d.count / total) * 100).toFixed(0)}%
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--a-text)', minWidth: 24, textAlign: 'right' }}>
                {d.count}
              </span>
            </div>
          </div>
          <div style={{
            height: 8, background: 'var(--a-surface-2)', borderRadius: 99,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.count / maxCount) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: '100%', background: d.color, borderRadius: 99 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'New Product',  icon: Plus,         href: '/admin/coffee',    color: '#1A6B5A', bg: 'rgba(26,107,90,0.08)' },
  { label: 'View Orders',  icon: ShoppingCart, href: '/admin/orders',    color: '#3A8FD6', bg: 'rgba(58,143,214,0.08)' },
  { label: 'Inventory',    icon: Package,      href: '/admin/inventory', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  { label: 'Promotions',   icon: Tag,          href: '/admin/promos',    color: '#E8A33A', bg: 'rgba(232,163,58,0.08)' },
];

// ── Conversion funnel ────────────────────────────────────────────────────────

function FunnelKPI({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(26,59,52,0.10)' }}
      style={{
        background: 'var(--a-surface)',
        borderRadius: 14,
        padding: '16px 18px',
        borderLeft: `3px solid ${color}`,
        border: '1px solid var(--a-border)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--a-text)', letterSpacing: '-0.04em' }}>{value}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--a-text)', marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--a-text-muted)', marginTop: 4 }}>{sub}</div>
    </motion.div>
  );
}

// ── Recent orders table ─────────────────────────────────────────────────────

const ORDER_COLS: Column<Order>[] = [
  {
    key: 'id',
    label: 'Order ID',
    width: '90px',
    render: (r) => (
      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--a-green)' }}>
        #{r.id}
      </span>
    ),
  },
  {
    key: 'user',
    label: 'Customer',
    render: (r) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.billing_name ?? r.user?.name ?? 'Guest'}</div>
        <div style={{ fontSize: 11, color: 'var(--a-text-muted)' }}>{r.billing_email ?? r.user?.email}</div>
      </div>
    ),
  },
  {
    key: 'total_amount',
    label: 'Total',
    render: (r) => (
      <span style={{ fontWeight: 700, fontSize: 13.5 }}>€{Number(r.total_amount ?? 0).toFixed(2)}</span>
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
      <span style={{ fontSize: 12, color: 'var(--a-text-muted)' }}>
        {r.created_at ? new Date(r.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
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

// ── Placeholder / demo data ─────────────────────────────────────────────────

const PLACEHOLDER_STATS = {
  total_orders: 142, revenue_month: 8640.50, active_products: 87,
  low_stock: 5, new_users_week: 12, pending_orders: 8,
};

function buildBarData(): BarData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    current:  Math.round(1800 + Math.random() * 3200),
    previous: Math.round(1200 + Math.random() * 2800),
  }));
}

function buildRevenueData(): RevenuePoint[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return {
      day: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: Math.round(300 + Math.sin(i * 0.7) * 150 + Math.random() * 200 + i * 30),
    };
  });
}

const DEMO_STATUS: StatusCount[] = [
  { status: 'delivered',  count: 68, color: STATUS_COLORS.delivered },
  { status: 'processing', count: 24, color: STATUS_COLORS.processing },
  { status: 'shipped',    count: 19, color: STATUS_COLORS.shipped },
  { status: 'pending',    count: 8,  color: STATUS_COLORS.pending },
  { status: 'cancelled',  count: 5,  color: STATUS_COLORS.cancelled },
];

const DEMO_CATEGORIES: CategoryStat[] = [
  { name: 'Coffee & Capsules', count: 1348, revenue: 3020 },
  { name: 'Machines',          count: 3459, revenue: 2280 },
  { name: 'Accessories',       count: 879,  revenue: 1224 },
  { name: 'Treats & Sweets',   count: 3459, revenue: 2280 },
  { name: 'Gift Sets',         count: 348,  revenue: 820  },
];

// ── Dashboard page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats]     = useState<typeof PLACEHOLDER_STATS | null>(null);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [barData, setBarData] = useState<BarData[]>([]);
  const [statusData]          = useState<StatusCount[]>(DEMO_STATUS);
  const [categoryData]        = useState<CategoryStat[]>(DEMO_CATEGORIES);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<'bar' | 'line'>('bar');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        adminApi.dashboard.stats().catch(() => PLACEHOLDER_STATS),
        adminApi.orders.list(1).catch(() => ({ data: [] })) as Promise<{ data: Order[] }>,
      ]);
      setStats(s as typeof PLACEHOLDER_STATS);
      setOrders(o.data?.slice(0, 8) ?? []);
      setRevenueData(buildRevenueData());
      setBarData(buildBarData());

      setSparklines({
        orders:   Array.from({ length: 7 }, () => Math.round(5 + Math.random() * 20)),
        revenue:  Array.from({ length: 7 }, () => Math.round(500 + Math.random() * 600)),
        products: Array.from({ length: 7 }, () => Math.round(80 + Math.random() * 10)),
        stock:    Array.from({ length: 7 }, () => Math.round(2 + Math.random() * 6)),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = stats ?? PLACEHOLDER_STATS;
  const revenueTotal = revenueData.reduce((acc, d) => acc + d.value, 0);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening today."
      />

      {/* ── 4 Stat Cards (like the reference: Revenue, Visitors, Transactions, Inventory) ── */}
      <div className="admin-grid-stats" style={{
        display: 'grid',
        gap: 18,
        gridTemplateColumns: 'repeat(4, 1fr)',
        marginBottom: 24,
      }}>
        <StatCard
          label="Today Revenue" value={`€${Number(s.revenue_month || 0).toFixed(0)}`}
          icon={DollarSign}
          trend="up" trendVal="+12%" trendLabel="vs yesterday"
          glowColor="#1A6B5A" iconBg="rgba(26,107,90,0.10)"
          loading={loading} delay={0}
          sparkline={sparklines.revenue}
        />
        <StatCard
          label="Visitors" value={512}
          icon={Eye}
          trend="up" trendVal="+4%" trendLabel="vs yesterday"
          glowColor="#3A8FD6" iconBg="rgba(58,143,214,0.10)"
          loading={loading} delay={0.06}
          sparkline={sparklines.orders}
        />
        <StatCard
          label="Orders" value={s.total_orders}
          icon={ShoppingCart}
          trend="up" trendVal="+8.4%" trendLabel="vs last month"
          glowColor="#E8734A" iconBg="rgba(232,115,74,0.10)"
          loading={loading} delay={0.12}
          sparkline={sparklines.products}
        />
        <StatCard
          label="Inventory" value={s.active_products}
          icon={Package}
          trend="neutral" trendVal={`${s.active_products} items`}
          glowColor="#8B5CF6" iconBg="rgba(139,92,246,0.10)"
          loading={loading} delay={0.18}
          sparkline={sparklines.stock}
        />
      </div>

      {/* ── Sales Analytics + Sales by Category (2 columns) ── */}
      <div className="admin-grid-sidebar" style={{ display: 'grid', gap: 20, gridTemplateColumns: '1.3fr 1fr', marginBottom: 24 }}>
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="admin-card-title" style={{ marginBottom: 2 }}>Sales Analytics</div>
              <div style={{ fontSize: 12, color: 'var(--a-text-muted)' }}>Hover to inspect daily totals</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Chart toggle */}
              <div style={{
                display: 'flex', gap: 2, padding: 3,
                background: 'var(--a-surface-2)', borderRadius: 10,
              }}>
                <button
                  onClick={() => setChartTab('bar')}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: chartTab === 'bar' ? 'var(--a-surface)' : 'transparent',
                    color: chartTab === 'bar' ? 'var(--a-text)' : 'var(--a-text-dim)',
                    boxShadow: chartTab === 'bar' ? 'var(--a-shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartTab('line')}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: chartTab === 'line' ? 'var(--a-surface)' : 'transparent',
                    color: chartTab === 'line' ? 'var(--a-text)' : 'var(--a-text-dim)',
                    boxShadow: chartTab === 'line' ? 'var(--a-shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  14 Days
                </button>
              </div>

              {/* Legend */}
              {chartTab === 'bar' && (
                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--a-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#E8734A' }} /> Previous
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1A6B5A' }} /> Current
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="admin-skeleton" style={{ height: 200, borderRadius: 12 }} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={chartTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {chartTab === 'bar' ? (
                  <SalesBarChart data={barData} />
                ) : (
                  <RevenueLineChart data={revenueData} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div className="admin-card-title" style={{ marginBottom: 0 }}>Sales by Category</div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 8,
              background: 'var(--a-surface-2)', border: '1px solid var(--a-border)',
              fontSize: 12, fontWeight: 500, color: 'var(--a-text-muted)',
              cursor: 'pointer',
            }}>
              Week <ChevronDown size={12} />
            </button>
          </div>
          {loading
            ? <div className="admin-skeleton" style={{ height: 200, borderRadius: 12 }} />
            : <SalesByCategoryDonut data={categoryData} />
          }
        </motion.div>
      </div>

      {/* ── Order Status + Conversion Funnel (2 columns) ── */}
      <div className="admin-grid-sidebar" style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div className="admin-card-title" style={{ marginBottom: 0 }}>Order Status</div>
            <a href="/admin/orders" style={{
              fontSize: 12, fontWeight: 600, color: 'var(--a-accent)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              View all <ArrowRight size={12} />
            </a>
          </div>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="admin-skeleton" style={{ height: 36, marginBottom: 10, borderRadius: 8 }} />
              ))
            : <OrderStatusBars data={statusData} />
          }
        </motion.div>

        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.44 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <TrendingUp size={16} style={{ color: 'var(--a-green)' }} />
            <div className="admin-card-title" style={{ marginBottom: 0 }}>Conversion Funnel</div>
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <FunnelKPI label="Visitors"      value="12,400" sub="This month"           color="#3A8FD6" />
            <FunnelKPI label="Product Views"  value="8,230"  sub="66% of visitors"      color="#1A6B5A" />
            <FunnelKPI label="Added to Cart"  value="1,840"  sub="22% of viewers"       color="#E8A33A" />
            <FunnelKPI label="Orders Placed"  value="142"    sub="20.9% checkout rate"  color="#E8734A" />
          </div>
        </motion.div>
      </div>

      {/* ── Quick Actions + Recent Orders ── */}
      <div className="admin-grid-sidebar" style={{ display: 'grid', gap: 20, gridTemplateColumns: '260px 1fr', marginBottom: 8 }}>
        {/* Quick actions */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.50 }}
        >
          <div className="admin-card-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, color, bg }) => (
              <motion.a
                key={href}
                href={href}
                whileHover={{ x: 4, backgroundColor: bg }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: 'transparent', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, border: `1px solid ${color}20`,
                }}>
                  <Icon size={15} color={color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)' }}>{label}</span>
                <ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--a-text-dim)' }} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.54 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--a-text)', letterSpacing: '-0.02em' }}>Recent Orders</div>
            <a href="/admin/orders" className="admin-btn admin-btn-ghost" style={{ padding: '6px 14px', fontSize: 12, borderRadius: 10 }}>
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
        </motion.div>
      </div>
    </>
  );
}
