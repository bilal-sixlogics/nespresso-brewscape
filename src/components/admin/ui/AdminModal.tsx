'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP = { sm: 440, md: 600, lg: 800, xl: 1000 };

export function AdminModal({ open, onClose, title, subtitle, children, footer, size = 'md' }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <motion.div
            style={{
              background: 'var(--color-a-surface)',
              border: '1px solid var(--color-a-border-2)',
              borderRadius: 16,
              width: '100%',
              maxWidth: SIZE_MAP[size],
              maxHeight: '90dvh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid var(--color-a-border)',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-a-text)' }}>
                  {title}
                </div>
                {subtitle && (
                  <div style={{ fontSize: 12.5, color: 'var(--color-a-text-muted)', marginTop: 2 }}>
                    {subtitle}
                  </div>
                )}
              </div>
              <button
                className="admin-topbar-btn"
                onClick={onClose}
                style={{ flexShrink: 0, marginTop: -2 }}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                style={{
                  padding: '14px 24px',
                  borderTop: '1px solid var(--color-a-border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
