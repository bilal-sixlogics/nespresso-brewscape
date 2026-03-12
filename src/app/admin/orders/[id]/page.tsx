'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
  CreditCard, MapPin, User, Mail, Phone, Hash,
  CalendarDays, FileText, Loader2, AlertCircle, Copy,
  ShoppingCart,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { adminApi } from '@/lib/admin/api';
import type { Order } from '@/types/admin';

// ── Status config ───────────────────────────────────────────────────────────

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: '#E8A33A', bg: 'rgba(232,163,58,0.10)',  icon: Clock },
  processing: { label: 'Processing', color: '#3A8FD6', bg: 'rgba(58,143,214,0.10)', icon: Package },
  shipped:    { label: 'Shipped',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', icon: Truck },
  delivered:  { label: 'Delivered',  color: '#1A9A5C', bg: 'rgba(26,154,92,0.10)',  icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: '#E05252', bg: 'rgba(224,82,82,0.08)',  icon: XCircle },
};

const STATUS_VARIANTS: Record<string, 'green' | 'red' | 'amber' | 'sky' | 'gray'> = {
  pending: 'gray', processing: 'amber', shipped: 'sky', delivered: 'green', cancelled: 'red',
};

function fmtAddr(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const a = v as Record<string, string>;
    return [a.address, a.city, a.postal_code, a.country].filter(Boolean).join(', ');
  }
  return String(v);
}

// ── Section card ────────────────────────────────────────────────────────────

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      className="admin-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Info row ────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
      <Icon size={14} style={{ color: 'var(--a-text-dim)', marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--a-text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--a-text)', marginTop: 2 }}>
          {value || '—'}
        </div>
      </div>
    </div>
  );
}

// ── Order Detail Page ───────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.orders.get(orderId);
      setOrder(res as Order);
    } catch (e) {
      setError((e as Error).message ?? 'Order not found');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await adminApi.orders.updateStatus(order.id, status);
      setOrder((prev) => prev ? { ...prev, status: status as Order['status'] } : prev);
    } finally {
      setUpdating(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(`#${orderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <AdminPageHeader title="Order Details" subtitle="Loading order..." />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 400, gap: 10, color: 'var(--a-text-muted)',
        }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading order details…
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  // Error / not found
  if (error || !order) {
    return (
      <>
        <AdminPageHeader title="Order Details" />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: 300, gap: 12,
        }}>
          <AlertCircle size={32} style={{ color: 'var(--a-danger)' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--a-text)' }}>
            {error || 'Order not found'}
          </div>
          <button className="admin-btn admin-btn-ghost" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft size={14} /> Back to Orders
          </button>
        </div>
      </>
    );
  }

  const statusMeta = STATUS_META[order.status] ?? STATUS_META.pending;
  const StatusIcon = statusMeta.icon;
  const currentStep = STATUS_FLOW.indexOf(order.status);

  return (
    <>
      <AdminPageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="admin-topbar-btn"
              onClick={() => router.push('/admin/orders')}
              style={{ width: 32, height: 32 }}
            >
              <ArrowLeft size={16} />
            </button>
            <span>Order #{order.id}</span>
            <button
              onClick={copyOrderId}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: copied ? 'var(--a-success)' : 'var(--a-text-dim)',
                display: 'flex', transition: 'color 0.2s',
              }}
              title="Copy order ID"
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            </button>
            <AdminBadge variant={STATUS_VARIANTS[order.status] ?? 'gray'} dot>
              {order.status}
            </AdminBadge>
          </div>
        }
        subtitle={`Placed on ${new Date(order.created_at).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="admin-grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* ── LEFT column ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Track Order Timeline */}
          <Section>
            <div className="admin-card-title" style={{ marginBottom: 18 }}>Track Order</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
              {STATUS_FLOW.map((step, i) => {
                const meta = STATUS_META[step];
                const SIcon = meta.icon;
                const reached = i <= currentStep && order.status !== 'cancelled';
                const isCurrent = i === currentStep && order.status !== 'cancelled';

                return (
                  <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* Connector line */}
                    {i > 0 && (
                      <div style={{
                        position: 'absolute', top: 18, right: '50%', width: '100%', height: 3,
                        background: reached ? meta.color : 'var(--a-surface-3)',
                        transition: 'background 0.3s',
                        zIndex: 0,
                      }} />
                    )}

                    {/* Step circle */}
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: reached ? meta.bg : 'var(--a-surface-2)',
                        border: `2px solid ${reached ? meta.color : 'var(--a-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', zIndex: 1,
                        boxShadow: isCurrent ? `0 0 12px ${meta.color}40` : 'none',
                      }}
                    >
                      <SIcon size={16} style={{ color: reached ? meta.color : 'var(--a-text-dim)' }} />
                    </motion.div>

                    {/* Label */}
                    <div style={{
                      fontSize: 11, fontWeight: reached ? 600 : 500,
                      color: reached ? 'var(--a-text)' : 'var(--a-text-dim)',
                      marginTop: 8, textTransform: 'capitalize',
                    }}>
                      {meta.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status actions */}
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap',
              marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--a-border)',
            }}>
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  className="admin-btn"
                  disabled={updating || order.status === s}
                  onClick={() => handleUpdateStatus(s)}
                  style={{
                    padding: '6px 14px', fontSize: 12, borderRadius: 10,
                    background: order.status === s ? STATUS_META[s].bg : 'var(--a-surface-2)',
                    color: order.status === s ? STATUS_META[s].color : 'var(--a-text-muted)',
                    border: `1px solid ${order.status === s ? STATUS_META[s].color + '40' : 'var(--a-border)'}`,
                    fontWeight: order.status === s ? 700 : 500,
                    textTransform: 'capitalize',
                    cursor: order.status === s ? 'default' : 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
              <button
                className="admin-btn"
                disabled={updating || order.status === 'cancelled'}
                onClick={() => handleUpdateStatus('cancelled')}
                style={{
                  padding: '6px 14px', fontSize: 12, borderRadius: 10,
                  background: order.status === 'cancelled' ? 'var(--a-danger-bg)' : 'transparent',
                  color: 'var(--a-danger)',
                  border: '1px solid rgba(224,82,82,0.20)',
                  marginLeft: 'auto',
                }}
              >
                Cancel Order
              </button>
            </div>
          </Section>

          {/* Product Table */}
          <Section delay={0.08}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div className="admin-card-title" style={{ marginBottom: 0 }}>
                Items ({order.items?.length ?? 0})
              </div>
            </div>

            {order.items && order.items.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      {['Product', 'Unit Price', 'Qty', 'Total'].map((h) => (
                        <th key={h} style={{
                          padding: '10px 14px', fontSize: 11, fontWeight: 700,
                          color: 'var(--a-text-dim)', textTransform: 'uppercase',
                          letterSpacing: '0.06em', textAlign: h === 'Product' ? 'left' : 'right',
                          borderBottom: '1px solid var(--a-border)',
                          background: 'var(--a-surface-2)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={item.id} style={{
                        transition: 'background 0.15s',
                      }}>
                        <td style={{
                          padding: '14px',
                          borderBottom: i < order.items!.length - 1 ? '1px solid var(--a-border)' : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Product thumbnail placeholder */}
                            <div style={{
                              width: 44, height: 44, borderRadius: 10,
                              background: 'var(--a-surface-2)',
                              border: '1px solid var(--a-border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <ShoppingCart size={16} style={{ color: 'var(--a-text-dim)' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--a-text)' }}>
                                {item.product_name}
                              </div>
                              {item.unit_label && (
                                <div style={{ fontSize: 11.5, color: 'var(--a-text-muted)', marginTop: 2 }}>
                                  {item.unit_label}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{
                          padding: '14px', textAlign: 'right', fontSize: 13,
                          color: 'var(--a-text-muted)',
                          borderBottom: i < order.items!.length - 1 ? '1px solid var(--a-border)' : 'none',
                        }}>
                          &euro;{Number(item.unit_price).toFixed(2)}
                        </td>
                        <td style={{
                          padding: '14px', textAlign: 'right', fontSize: 13,
                          fontWeight: 600, color: 'var(--a-text)',
                          borderBottom: i < order.items!.length - 1 ? '1px solid var(--a-border)' : 'none',
                        }}>
                          {item.quantity}
                        </td>
                        <td style={{
                          padding: '14px', textAlign: 'right', fontSize: 14,
                          fontWeight: 700, color: 'var(--a-text)',
                          borderBottom: i < order.items!.length - 1 ? '1px solid var(--a-border)' : 'none',
                        }}>
                          &euro;{Number(item.total_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: 'var(--a-text-dim)', fontSize: 13,
              }}>
                No items in this order
              </div>
            )}
          </Section>

          {/* Notes */}
          {order.notes && (
            <Section delay={0.14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <FileText size={15} style={{ color: 'var(--a-text-muted)' }} />
                <div className="admin-card-title" style={{ marginBottom: 0 }}>Order Notes</div>
              </div>
              <p style={{
                fontSize: 13.5, color: 'var(--a-text-muted)', lineHeight: 1.6,
                padding: '12px 14px', background: 'var(--a-surface-2)',
                borderRadius: 10, margin: 0,
              }}>
                {order.notes}
              </p>
            </Section>
          )}
        </div>

        {/* ── RIGHT sidebar ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Summary */}
          <Section delay={0.06}>
            <div className="admin-card-title" style={{ marginBottom: 14 }}>Order Summary</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Subtotal', value: `\u20AC${Number(order.subtotal ?? order.total_amount).toFixed(2)}` },
                { label: 'Tax', value: `\u20AC${Number(order.tax_amount ?? 0).toFixed(2)}` },
                ...(order.discount_amount ? [{ label: 'Discount', value: `-\u20AC${Number(order.discount_amount).toFixed(2)}`, isDiscount: true }] : []),
              ].map(({ label, value, isDiscount }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: isDiscount ? 'var(--a-success)' : 'var(--a-text-muted)',
                }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              {order.promo_code && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 8,
                  background: 'var(--a-success-bg)', fontSize: 12,
                  color: 'var(--a-success)', fontWeight: 600,
                }}>
                  Promo: {order.promo_code}
                </div>
              )}

              <div style={{
                borderTop: '2px solid var(--a-border-2)',
                paddingTop: 12, marginTop: 4,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--a-text)' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--a-text)', letterSpacing: '-0.03em' }}>
                  &euro;{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </Section>

          {/* Customer Info */}
          <Section delay={0.12}>
            <div className="admin-card-title" style={{ marginBottom: 10 }}>Customer</div>
            <InfoRow icon={User}  label="Name"    value={order.billing_name ?? order.user?.name ?? 'Guest'} />
            <InfoRow icon={Mail}  label="Email"   value={order.billing_email ?? order.user?.email ?? ''} />
            <InfoRow icon={Phone} label="Phone"   value={order.billing_phone ?? ''} />
          </Section>

          {/* Shipping Info */}
          <Section delay={0.18}>
            <div className="admin-card-title" style={{ marginBottom: 10 }}>Shipping Details</div>
            <InfoRow icon={MapPin} label="Billing Address"  value={fmtAddr(order.billing_address)} />
            <InfoRow icon={Truck}  label="Shipping Address" value={fmtAddr(order.shipping_address ?? order.billing_address)} />
            <InfoRow icon={Package} label="Delivery Method" value={order.delivery_type ?? 'Standard'} />
          </Section>

          {/* Payment Info */}
          <Section delay={0.24}>
            <div className="admin-card-title" style={{ marginBottom: 10 }}>Payment</div>
            <InfoRow icon={CreditCard}  label="Method"      value={order.payment_method ?? ''} />
            <InfoRow icon={Hash}        label="Order ID"    value={`#${order.id}`} />
            <InfoRow icon={CalendarDays} label="Date"       value={new Date(order.created_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} />
          </Section>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
