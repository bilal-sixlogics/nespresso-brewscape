'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

type Trend = 'up' | 'down' | 'neutral';

interface Props {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  iconBg?:  string;
  glowColor?: string;
  trend?:   Trend;
  trendVal?: string;
  trendLabel?: string;
  loading?: boolean;
  delay?: number;
}

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, neutral: Minus };

export function StatCard({
  label, value, icon: Icon, iconBg = 'var(--color-a-green-light)',
  glowColor = 'var(--color-a-green)',
  trend = 'neutral', trendVal, trendLabel,
  loading, delay = 0,
}: Props) {
  const TIcon = TREND_ICONS[trend];

  if (loading) {
    return (
      <div className="admin-stat-card">
        <div className="admin-skeleton" style={{ width: 38, height: 38, borderRadius: 9, marginBottom: 12 }} />
        <div className="admin-skeleton" style={{ width: '60%', height: 26, marginBottom: 6 }} />
        <div className="admin-skeleton" style={{ width: '40%', height: 14, marginBottom: 12 }} />
        <div className="admin-skeleton" style={{ width: '50%', height: 14 }} />
      </div>
    );
  }

  return (
    <motion.div
      className="admin-stat-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Glow */}
      <div
        className="admin-stat-glow"
        style={{ background: glowColor }}
      />

      {/* Icon */}
      <div className="admin-stat-icon" style={{ background: iconBg }}>
        <Icon size={18} style={{ color: glowColor }} />
      </div>

      {/* Value */}
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>

      {/* Trend */}
      {trendVal && (
        <div className={`admin-stat-trend ${trend}`}>
          <TIcon size={13} />
          <span>{trendVal}</span>
          {trendLabel && (
            <span style={{ fontWeight: 400, opacity: 0.7 }}>&nbsp;{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
