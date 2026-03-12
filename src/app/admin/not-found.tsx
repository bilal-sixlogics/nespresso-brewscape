'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '70vh', textAlign: 'center',
      padding: '40px 20px',
    }}>
      {/* Illustration — coffee cup with steam */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32, position: 'relative' }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Saucer */}
          <ellipse cx="100" cy="170" rx="70" ry="14"
            fill="var(--a-surface-3)" stroke="var(--a-border-2)" strokeWidth="1.5"
          />

          {/* Cup body */}
          <path
            d="M55 90 C55 90 50 160 60 165 C70 170 130 170 140 165 C150 160 145 90 145 90 Z"
            fill="var(--a-surface)" stroke="var(--a-border-2)" strokeWidth="2"
          />

          {/* Cup handle */}
          <path
            d="M145 105 C165 105 170 125 165 140 C160 150 150 150 145 145"
            fill="none" stroke="var(--a-border-2)" strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Liquid */}
          <ellipse cx="100" cy="95" rx="42" ry="8" fill="#C4A882" opacity="0.6" />

          {/* Brand mark on cup */}
          <circle cx="100" cy="130" r="16" fill="none" stroke="var(--a-accent)" strokeWidth="1.5" opacity="0.4" />

          {/* Coffee logo on cup */}
          <g transform="translate(92, 122)">
            <Coffee size={16} color="var(--a-accent)" opacity={0.5} />
          </g>

          {/* Steam lines */}
          <motion.path
            d="M80 75 C80 60 75 50 80 35"
            fill="none" stroke="var(--a-text-dim)" strokeWidth="2"
            strokeLinecap="round" opacity={0.3}
            animate={{ y: [0, -8, 0], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M100 70 C100 55 95 45 100 28"
            fill="none" stroke="var(--a-text-dim)" strokeWidth="2"
            strokeLinecap="round" opacity={0.4}
            animate={{ y: [0, -10, 0], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          <motion.path
            d="M120 75 C120 60 125 50 120 35"
            fill="none" stroke="var(--a-text-dim)" strokeWidth="2"
            strokeLinecap="round" opacity={0.3}
            animate={{ y: [0, -8, 0], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />

          {/* 404 in steam */}
          <motion.text
            x="100" y="18" textAnchor="middle"
            fontSize="22" fontWeight="800" fill="var(--a-text-dim)"
            letterSpacing="-0.04em" opacity={0.2}
            animate={{ opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            404
          </motion.text>
        </svg>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h1 style={{
          fontSize: 42, fontWeight: 800, color: 'var(--a-text)',
          letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12,
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: 15, color: 'var(--a-text-muted)',
          maxWidth: 400, lineHeight: 1.6, margin: '0 auto 32px',
        }}>
          Looks like this page took a coffee break. The page you&apos;re looking for
          doesn&apos;t exist or may have been moved.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        style={{ display: 'flex', gap: 12 }}
      >
        <Link
          href="/admin/dashboard"
          className="admin-btn admin-btn-primary"
          style={{
            padding: '12px 28px', fontSize: 14,
            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none',
          }}
        >
          <Home size={16} />
          Go to Dashboard
        </Link>
        <button
          className="admin-btn admin-btn-ghost"
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px', fontSize: 14,
            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </motion.div>
    </div>
  );
}
