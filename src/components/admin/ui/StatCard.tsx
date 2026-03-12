'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

type Trend = 'up' | 'down' | 'neutral';

interface Props {
  label:      string;
  value:      string | number;
  icon:       LucideIcon;
  iconBg?:    string;
  glowColor?: string;
  trend?:     Trend;
  trendVal?:  string;
  trendLabel?: string;
  loading?:   boolean;
  delay?:     number;
  sparkline?: number[];
}

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, neutral: Minus };

/** Animated number counter */
function AnimatedValue({ value }: { value: string | number }) {
  const raw = typeof value === 'string' ? value : String(value);
  const match = raw.match(/^([€$£¥]?\s*)(\d[\d,.]*)(.*)/);
  const [displayed, setDisplayed] = useState(raw);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!match) { setDisplayed(raw); return; }
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseFloat(numStr);
    if (isNaN(target)) { setDisplayed(raw); return; }

    const duration = 900;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      const formatted = current.toLocaleString();
      setDisplayed(`${prefix}${formatted}${suffix}`);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [raw]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{displayed}</>;
}

/** Premium sparkline with animated gradient fill */
function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 90, h = 36, pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  // Generate smooth curve control points
  const points = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (w - pad * 2),
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));

  // Create smooth bezier path
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
    path += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }

  const lastPt = points[points.length - 1];
  const areaPath = `${path} L ${lastPt.x},${h} L ${points[0].x},${h} Z`;
  const gradId = `sg-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', opacity: 0.85 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastPt.x} cy={lastPt.y} r={2.5} fill="white" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

export function StatCard({
  label, value, icon: Icon,
  iconBg    = 'var(--a-green-light)',
  glowColor = 'var(--a-green)',
  trend = 'neutral', trendVal, trendLabel,
  loading, delay = 0,
  sparkline,
}: Props) {
  const TIcon = TREND_ICONS[trend];

  if (loading) {
    return (
      <div className="admin-stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="admin-skeleton" style={{ width: 32, height: 32, borderRadius: 10, marginBottom: 14 }} />
            <div className="admin-skeleton" style={{ width: '80%', height: 12, marginBottom: 10 }} />
            <div className="admin-skeleton" style={{ width: '50%', height: 28, marginBottom: 12 }} />
          </div>
          <div className="admin-skeleton" style={{ width: 90, height: 36, borderRadius: 8 }} />
        </div>
        <div className="admin-skeleton" style={{ width: '40%', height: 14, marginTop: 8 }} />
      </div>
    );
  }

  return (
    <motion.div
      className="admin-stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Ambient glow */}
      <div className="admin-stat-glow" style={{ background: glowColor }} />

      {/* Top row: icon + sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="admin-stat-icon" style={{ background: iconBg, marginBottom: 0 }}>
          <Icon size={18} style={{ color: glowColor }} />
        </div>
        {sparkline && sparkline.length > 1 && (
          <MiniSparkline values={sparkline} color={glowColor.startsWith('#') ? glowColor : '#1A6B5A'} />
        )}
      </div>

      {/* Label above value (like the reference) */}
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--a-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 6,
      }}>
        {label}
      </div>

      {/* Value — big and bold */}
      <div className="admin-stat-value">
        <AnimatedValue value={value} />
      </div>

      {/* Trend badge */}
      {trendVal && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 8px',
            borderRadius: 99,
            fontSize: 11.5,
            fontWeight: 600,
            background: trend === 'up' ? 'var(--a-success-bg)' :
                        trend === 'down' ? 'var(--a-danger-bg)' :
                        'var(--a-surface-2)',
            color: trend === 'up' ? 'var(--a-success)' :
                   trend === 'down' ? 'var(--a-danger)' :
                   'var(--a-text-muted)',
          }}>
            <TIcon size={11} />
            {trendVal}
          </div>
          {trendLabel && (
            <span style={{ fontSize: 11, color: 'var(--a-text-dim)' }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
