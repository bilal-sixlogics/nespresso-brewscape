"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Package, Truck, CheckCircle2, XCircle, Clock, MapPin,
    RefreshCw, AlertCircle, ArrowLeft, Loader2,
    ShoppingBag, Calendar, Hash, Mail, Phone, Store,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatusLog {
    status: string;
    note: string | null;
    created_at: string;
}

interface OrderAddress {
    type: string;
    first_name: string;
    last_name: string;
    line_1: string;
    line_2?: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    phone?: string;
}

interface Shipment {
    tracking_number: string;
    carrier: string;
    shipped_at: string;
}

interface OrderItem {
    id: number;
    product_name_snapshot: string;
    unit_name_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
    line_total: number;
}

interface Order {
    id: number;
    user_email: string;
    user_phone: string | null;
    status: string;
    status_label: string;
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    tax_total: number;
    grand_total: number;
    currency: string;
    notes: string | null;
    items: OrderItem[];
    addresses: OrderAddress[];
    shipments: Shipment[];
    status_logs: StatusLog[];
    created_at: string;
    shipping_method?: { id: number; name: string; type: 'delivery' | 'pickup' } | null;
    is_pickup?: boolean;
}

// ── Status config ─────────────────────────────────────────────────────────────
// 'delivered' is reused as the terminal state for both fulfillment paths —
// its display label is resolved dynamically (see StatusBadge) rather than
// hardcoded here, mirroring the backend's OrderStatus::label().

function getStatusConfig(t: (key: TranslationKey) => string): Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> {
    return {
        draft:            { label: t('orderStatusDraft'),          color: 'text-sand/50',    bg: 'bg-sand/10 border-sand/15',   icon: <Clock size={14} /> },
        pending_payment:  { label: t('orderStatusPendingPayment'), color: 'text-amber-300',  bg: 'bg-amber-500/10 border-amber-500/20', icon: <Clock size={14} /> },
        payment_failed:   { label: t('orderStatusPaymentFailed'),  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',     icon: <XCircle size={14} /> },
        paid:             { label: t('accountStatusConfirmed'),    color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: <CheckCircle2 size={14} /> },
        processing:       { label: t('orderStatusProcessing'),     color: 'text-amber-300',  bg: 'bg-amber-500/10 border-amber-500/20', icon: <RefreshCw size={14} /> },
        shipped:          { label: t('accountStatusShipped'),      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20', icon: <Truck size={14} /> },
        ready_for_pickup: { label: t('accountStatusReadyForPickup'), color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20',   icon: <Store size={14} /> },
        delivered:        { label: t('accountStatusDelivered'),    color: 'text-emerald-400',bg: 'bg-emerald-500/15 border-emerald-500/20', icon: <CheckCircle2 size={14} /> },
        cancelled:        { label: t('accountStatusCancelled'),    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',     icon: <XCircle size={14} /> },
        refunded:         { label: t('orderStatusRefunded'),       color: 'text-sand/50',    bg: 'bg-sand/5 border-sand/15',   icon: <RefreshCw size={14} /> },
    };
}

// Pickup orders never ship — they go straight from Processing to Ready for
// Pickup to (picked up/)Delivered, skipping the carrier-flavored Shipped step.
function getTimelineSteps(isPickup: boolean): string[] {
    return isPickup
        ? ['pending_payment', 'paid', 'processing', 'ready_for_pickup', 'delivered']
        : ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];
}

function StatusBadge({ status, isPickup = false, muted = false }: { status: string; isPickup?: boolean; muted?: boolean }) {
    const { t } = useLanguage();
    const STATUS_CONFIG = getStatusConfig(t);
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-sand/50', bg: 'bg-sand/10 border-sand/15', icon: <Clock size={14} /> };
    const label = status === 'delivered' && isPickup ? t('orderStatusPickedUp') : cfg.label;
    // Muted variant — used for older status-history entries so they read as
    // history rather than looking like another "current" status.
    const classes = muted
        ? 'bg-ink/5 border-ink/10 text-ink/40'
        : `${cfg.bg} ${cfg.color}`;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${classes}`}>
            {cfg.icon}
            {label}
        </span>
    );
}

// ── Guest lookup gate ─────────────────────────────────────────────────────────

function GuestLookup({ orderId, onFound }: { orderId: string; onFound: (order: Order) => void }) {
    const { t } = useLanguage();
    const [orderInput, setOrderInput] = useState(/^\d+$/.test(orderId) ? orderId : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-submit when coming directly from order-success (order ID is known)
    useEffect(() => {
        if (orderId) {
            doLookup(orderId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doLookup = async (id: string) => {
        const numId = parseInt(id);
        if (!numId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post<{ data: Order }>(Endpoints.trackOrder, {
                order_id: numId,
            });
            onFound(res.data ?? (res as unknown as Order));
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.status === 404
                ? t('noOrderFound')
                : (apiErr.message ?? t('authGenericError')));
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doLookup(orderInput);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ink text-sand grain-overlay pt-24 pb-32 px-4">
            <div className="max-w-md mx-auto">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center">
                            <Package size={36} className="text-gold" />
                        </div>
                    </div>
                    <div className="text-center mb-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold mb-2">{t('orderTrackingEyebrow')}</p>
                        <h1 className="font-display text-3xl uppercase tracking-tight text-sand mb-2">{t('trackYourOrder')}</h1>
                        <p className="text-cocoa text-sm">{t('trackOrderDesc')}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-sand rounded-[28px] border border-ink/10 shadow-xl p-6 space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-ink/50 mb-2">{t('orderNumber')}</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                                <input
                                    type="number"
                                    value={orderInput}
                                    onChange={e => setOrderInput(e.target.value)}
                                    placeholder={t('orderNumberPlaceholder')}
                                    required
                                    className="w-full pl-10 pr-4 py-3.5 border border-ink/15 rounded-full text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-500/10 rounded-2xl px-4 py-3 text-xs">
                                <AlertCircle size={14} className="shrink-0" />
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gold text-ink rounded-full font-black uppercase tracking-widest hover:bg-[#b8914d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                            {loading ? t('lookingUp') : t('trackOrderBtn')}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

// ── Order detail view ─────────────────────────────────────────────────────────

function OrderDetail({ order }: { order: Order }) {
    const formatPrice = useFormatPrice();
    const { t } = useLanguage();
    const STATUS_CONFIG = getStatusConfig(t);
    const shippingAddress = order.addresses.find(a => a.type === 'shipping');
    const shipment = order.shipments?.[0];
    const isPickupOrder = order.shipping_method?.type === 'pickup' || !!order.is_pickup;
    const timelineSteps = getTimelineSteps(isPickupOrder);
    const statusIdx = timelineSteps.indexOf(order.status);
    const isTerminal = ['cancelled', 'refunded', 'payment_failed'].includes(order.status);

    return (
        <div className="min-h-screen bg-ink text-sand grain-overlay pt-20 pb-32 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Back */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-sand/60 hover:text-gold transition-colors">
                        <ArrowLeft size={14} /> {t('continueBrowsing')}
                    </Link>
                </motion.div>

                {/* Hero card */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-sand rounded-[32px] border border-ink/10 shadow-xl overflow-hidden mb-6">
                    {/* Header strip */}
                    <div className="bg-gold px-6 py-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-ink/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">{t('orderNumber')}</p>
                            <p className="text-ink font-black text-2xl tracking-widest font-mono">#{order.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-ink/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">{t('grandTotal')}</p>
                            <p className="text-ink font-display text-2xl">{formatPrice(parseFloat(String(order.grand_total)))}</p>
                        </div>
                    </div>

                    {/* Meta grid */}
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-ink/10">
                        <div className="flex items-start gap-2">
                            <Calendar size={15} className="text-ink/40 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-ink/50">{t('placedLabel')}</p>
                                <p className="text-xs font-semibold text-ink mt-0.5">
                                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Hash size={15} className="text-ink/40 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-ink/50">{t('statusLabel')}</p>
                                <div className="mt-0.5"><StatusBadge status={order.status} isPickup={isPickupOrder} /></div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Mail size={15} className="text-ink/40 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-ink/50">{t('emailLabel')}</p>
                                <p className="text-xs font-semibold text-ink mt-0.5 break-all">{order.user_email}</p>
                            </div>
                        </div>
                        {order.user_phone && (
                            <div className="flex items-start gap-2">
                                <Phone size={15} className="text-ink/40 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ink/50">{t('phone')}</p>
                                    <p className="text-xs font-semibold text-ink mt-0.5">{order.user_phone}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tracking number */}
                    {shipment && (
                        <div className="px-6 py-4 border-b border-ink/10 bg-violet-500/10 flex flex-wrap items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                                <Truck size={18} className="text-violet-600" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-ink/50">{t('trackingNumberLabel')}</p>
                                <p className="text-sm font-black text-ink font-mono mt-0.5">{shipment.tracking_number}</p>
                                <p className="text-xs text-ink/50">{t('viaCarrier').replace('{{carrier}}', shipment.carrier)}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Status timeline */}
                {!isTerminal && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-sand rounded-[28px] border border-ink/10 shadow-md p-6 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-5">{t('orderProgress')}</p>
                        <div className="flex items-center gap-0">
                            {timelineSteps.map((step, i) => {
                                const reached  = statusIdx >= i;
                                const current  = statusIdx === i;
                                const cfg      = STATUS_CONFIG[step];
                                const label    = step === 'delivered' && isPickupOrder ? t('orderStatusPickedUp') : cfg.label;
                                return (
                                    <React.Fragment key={step}>
                                        <div className="flex flex-col items-center flex-1 min-w-0">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                                reached ? 'bg-gold border-gold text-ink' : 'bg-ink/5 border-ink/10 text-ink/30'
                                            } ${current ? 'ring-4 ring-gold/20' : ''}`}>
                                                {reached ? <CheckCircle2 size={16} /> : cfg.icon}
                                            </div>
                                            <p className={`text-[9px] font-black uppercase tracking-wide mt-2 text-center leading-tight ${reached ? 'text-gold' : 'text-ink/50'}`}>
                                                {label}
                                            </p>
                                        </div>
                                        {i < timelineSteps.length - 1 && (
                                            <div className={`flex-1 h-0.5 mb-5 ${i < statusIdx ? 'bg-gold' : 'bg-ink/10'}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Status history */}
                {order.status_logs && order.status_logs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-sand rounded-[28px] border border-ink/10 shadow-md p-6 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-4">{t('statusHistory')}</p>
                        <div className="space-y-3">
                            {[...order.status_logs].reverse().map((log, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${i === 0 ? 'bg-gold' : 'bg-ink/20'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusBadge status={log.status} isPickup={isPickupOrder} muted={i !== 0} />
                                            {i === 0 && (
                                                <span className="text-[9px] font-black uppercase tracking-wider text-gold bg-gold/15 px-1.5 py-0.5 rounded-full">
                                                    {t('currentBadge')}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-ink/40">
                                                {new Date(log.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {log.note && <p className="text-xs text-ink/50 mt-1">{log.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Order items */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-sand rounded-[28px] border border-ink/10 shadow-md overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-ink/10 flex items-center gap-2">
                        <ShoppingBag size={16} className="text-gold" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-ink/50">{t('orderItemsLabel')}</p>
                    </div>
                    <div className="divide-y divide-ink/5">
                        {order.items.map(item => (
                            <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                                        <Package size={16} className="text-gold" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-ink truncate">{item.product_name_snapshot}</p>
                                        <p className="text-xs text-ink/50">{item.unit_name_snapshot} × {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-ink whitespace-nowrap">
                                    {formatPrice(parseFloat(String(item.line_total)))}
                                </p>
                            </div>
                        ))}
                    </div>
                    {/* Totals */}
                    <div className="border-t border-ink/10 px-6 py-4 space-y-2 bg-ink/5">
                        <div className="flex justify-between text-sm text-ink/60">
                            <span>{t('subtotal')}</span>
                            <span>{formatPrice(parseFloat(String(order.subtotal)))}</span>
                        </div>
                        {parseFloat(String(order.discount_total)) > 0 && (
                            <div className="flex justify-between text-sm text-gold">
                                <span>{t('discount')}</span>
                                <span>− {formatPrice(parseFloat(String(order.discount_total)))}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-ink/60">
                            <span>{t('shipping')}</span>
                            <span>{parseFloat(String(order.shipping_total)) === 0 ? t('freeLabel') : formatPrice(parseFloat(String(order.shipping_total)))}</span>
                        </div>
                        <div className="flex justify-between font-black text-ink pt-2 border-t border-ink/10">
                            <span>{t('total')}</span>
                            <span>{formatPrice(parseFloat(String(order.grand_total)))}</span>
                        </div>
                        {parseFloat(String(order.tax_total)) > 0 && (
                            <div className="flex justify-between text-[11px] text-ink/40">
                                <span>{t('inclVat')}</span>
                                <span>{formatPrice(parseFloat(String(order.tax_total)))}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Shipping address */}
                {shippingAddress && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className="bg-sand rounded-[28px] border border-ink/10 shadow-md p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={16} className="text-gold" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-ink/50">{t('deliveryAddressLabel')}</p>
                        </div>
                        <p className="font-bold text-sm text-ink">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                        <p className="text-sm text-ink/60 mt-1">
                            {shippingAddress.line_1}{shippingAddress.line_2 ? `, ${shippingAddress.line_2}` : ''}<br />
                            {shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ''} {shippingAddress.zip}<br />
                            {shippingAddress.country}
                        </p>
                        {shippingAddress.phone && <p className="text-sm text-ink/60 mt-1">{shippingAddress.phone}</p>}
                    </motion.div>
                )}

                {/* Help */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-center text-sm text-cocoa">
                    {t('questionsAboutOrder')}{' '}
                    <Link href="/contact" className="text-gold font-bold hover:underline">{t('contactSupportBtn')}</Link>
                </motion.div>
            </div>
        </div>
    );
}

// ── Page shell ────────────────────────────────────────────────────────────────

function OrderPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isHydrating } = useAuth();
    const orderId = String(params.id ?? '');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    // If the user is authenticated, try to load the order with their token first
    useEffect(() => {
        if (isHydrating) return;

        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        // Authenticated: try to load directly
        apiClient.get<Order>(`${Endpoints.orders}/${orderId}`)
            .then(res => setOrder(res as unknown as Order))
            .catch(() => {
                // If their token doesn't grant access to this order, fall through to guest lookup
            })
            .finally(() => setLoading(false));
    }, [orderId, isAuthenticated, isHydrating]);

    // Poll while payment is still in flight — a Stripe webhook can take a few
    // seconds to arrive, and this page would otherwise keep showing "Pending
    // Payment" forever until the customer manually reloads. Throttled slowly
    // (15s) since the guest track endpoint is rate-limited (5 requests/min).
    useEffect(() => {
        if (!order || order.status !== 'pending_payment') return;

        const poll = async () => {
            try {
                const res = isAuthenticated
                    ? await apiClient.get<Order>(`${Endpoints.orders}/${order.id}`)
                    : (await apiClient.post<{ data: Order }>(Endpoints.trackOrder, { order_id: order.id })).data;
                if (res) setOrder(res as Order);
            } catch {
                // transient — will retry on the next tick
            }
        };

        const interval = setInterval(poll, 15000);
        return () => clearInterval(interval);
    }, [order, isAuthenticated]);

    if (loading || isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        );
    }

    if (!order) {
        return (
            <GuestLookup
                orderId={orderId}
                onFound={setOrder}
            />
        );
    }

    return <OrderDetail order={order} />;
}

export default function OrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        }>
            <OrderPageContent />
        </Suspense>
    );
}
