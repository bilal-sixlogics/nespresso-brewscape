"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Package, Truck, CheckCircle2, XCircle, Clock, MapPin,
    CreditCard, RefreshCw, AlertCircle, ArrowLeft, Loader2,
    ShoppingBag, Calendar, Hash, Mail, Phone
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';
import { useFormatPrice } from '@/context/SiteSettingsContext';

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
    product_name: string;
    unit_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
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
    grand_total: number;
    currency: string;
    notes: string | null;
    items: OrderItem[];
    addresses: OrderAddress[];
    shipments: Shipment[];
    status_logs: StatusLog[];
    created_at: string;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    draft:           { label: 'Draft',           color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200',   icon: <Clock size={14} /> },
    pending_payment: { label: 'Pending Payment',  color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200', icon: <Clock size={14} /> },
    payment_failed:  { label: 'Payment Failed',   color: 'text-red-600',    bg: 'bg-red-50 border-red-200',     icon: <XCircle size={14} /> },
    paid:            { label: 'Order Confirmed',  color: 'text-sb-green',   bg: 'bg-sb-green/10 border-sb-green/20', icon: <CheckCircle2 size={14} /> },
    processing:      { label: 'Processing',       color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   icon: <RefreshCw size={14} /> },
    shipped:         { label: 'Shipped',          color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', icon: <Truck size={14} /> },
    delivered:       { label: 'Delivered',        color: 'text-sb-green',   bg: 'bg-sb-green/10 border-sb-green/20', icon: <CheckCircle2 size={14} /> },
    cancelled:       { label: 'Cancelled',        color: 'text-red-600',    bg: 'bg-red-50 border-red-200',     icon: <XCircle size={14} /> },
    refunded:        { label: 'Refunded',         color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',   icon: <RefreshCw size={14} /> },
};

// Ordered timeline steps (filter by what's been reached)
const TIMELINE_STEPS = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: <Clock size={14} /> };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

// ── Guest lookup gate ─────────────────────────────────────────────────────────

function GuestLookup({ orderId, onFound }: { orderId: string; onFound: (order: Order) => void }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post<{ data: Order }>(Endpoints.trackOrder, {
                order_id: parseInt(orderId),
                email: email.trim(),
            });
            onFound(res.data ?? (res as unknown as Order));
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.status === 404
                ? 'No order found with that ID and email combination.'
                : (apiErr.message ?? 'Something went wrong. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sb-green/5 to-white pt-24 pb-32 px-4">
            <div className="max-w-md mx-auto">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-sb-green/10 flex items-center justify-center">
                            <Package size={36} className="text-sb-green" />
                        </div>
                    </div>
                    <div className="text-center mb-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-sb-green mb-2">Order Tracking</p>
                        <h1 className="font-display text-3xl uppercase tracking-tight text-sb-black mb-2">Track Order #{orderId}</h1>
                        <p className="text-gray-500 text-sm">Enter the email address used when placing your order.</p>
                    </div>
                    <form onSubmit={handleLookup} className="bg-white rounded-[28px] border border-gray-100 shadow-xl p-6 space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-sb-green transition-colors"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-2xl px-4 py-3 text-xs">
                                <AlertCircle size={14} className="shrink-0" />
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                            {loading ? 'Looking up...' : 'Track Order'}
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
    const shippingAddress = order.addresses.find(a => a.type === 'shipping');
    const shipment = order.shipments?.[0];
    const statusIdx = TIMELINE_STEPS.indexOf(order.status);
    const isTerminal = ['cancelled', 'refunded', 'payment_failed'].includes(order.status);

    return (
        <div className="min-h-screen bg-gradient-to-b from-sb-green/5 to-white pt-20 pb-32 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Back */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sb-green transition-colors">
                        <ArrowLeft size={14} /> Continue Shopping
                    </Link>
                </motion.div>

                {/* Hero card */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden mb-6">
                    {/* Header strip */}
                    <div className="bg-sb-green px-6 py-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-0.5">Order Number</p>
                            <p className="text-white font-black text-2xl tracking-widest font-mono">#{order.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-0.5">Grand Total</p>
                            <p className="text-white font-display text-2xl">{formatPrice(parseFloat(String(order.grand_total)))}</p>
                        </div>
                    </div>

                    {/* Meta grid */}
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100">
                        <div className="flex items-start gap-2">
                            <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Placed</p>
                                <p className="text-xs font-semibold text-sb-black mt-0.5">
                                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Hash size={15} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
                                <div className="mt-0.5"><StatusBadge status={order.status} /></div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Mail size={15} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email</p>
                                <p className="text-xs font-semibold text-sb-black mt-0.5 break-all">{order.user_email}</p>
                            </div>
                        </div>
                        {order.user_phone && (
                            <div className="flex items-start gap-2">
                                <Phone size={15} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                                    <p className="text-xs font-semibold text-sb-black mt-0.5">{order.user_phone}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tracking number */}
                    {shipment && (
                        <div className="px-6 py-4 border-b border-gray-100 bg-violet-50/50 flex flex-wrap items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                                <Truck size={18} className="text-violet-600" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tracking Number</p>
                                <p className="text-sm font-black text-sb-black font-mono mt-0.5">{shipment.tracking_number}</p>
                                <p className="text-xs text-gray-500">via {shipment.carrier}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Status timeline */}
                {!isTerminal && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-[28px] border border-gray-100 shadow-md p-6 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Order Progress</p>
                        <div className="flex items-center gap-0">
                            {TIMELINE_STEPS.map((step, i) => {
                                const reached  = statusIdx >= i;
                                const current  = statusIdx === i;
                                const cfg      = STATUS_CONFIG[step];
                                return (
                                    <React.Fragment key={step}>
                                        <div className="flex flex-col items-center flex-1 min-w-0">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                                reached ? 'bg-sb-green border-sb-green text-white' : 'bg-gray-50 border-gray-200 text-gray-300'
                                            } ${current ? 'ring-4 ring-sb-green/20' : ''}`}>
                                                {reached ? <CheckCircle2 size={16} /> : cfg.icon}
                                            </div>
                                            <p className={`text-[9px] font-black uppercase tracking-wide mt-2 text-center leading-tight ${reached ? 'text-sb-green' : 'text-gray-400'}`}>
                                                {cfg.label}
                                            </p>
                                        </div>
                                        {i < TIMELINE_STEPS.length - 1 && (
                                            <div className={`flex-1 h-0.5 mb-5 ${i < statusIdx ? 'bg-sb-green' : 'bg-gray-100'}`} />
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
                        className="bg-white rounded-[28px] border border-gray-100 shadow-md p-6 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Status History</p>
                        <div className="space-y-3">
                            {[...order.status_logs].reverse().map((log, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-sb-green mt-2 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusBadge status={log.status} />
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(log.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {log.note && <p className="text-xs text-gray-500 mt-1">{log.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Order items */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white rounded-[28px] border border-gray-100 shadow-md overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <ShoppingBag size={16} className="text-sb-green" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Items</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {order.items.map(item => (
                            <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-sb-green/10 flex items-center justify-center shrink-0">
                                        <Package size={16} className="text-sb-green" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-sb-black truncate">{item.product_name}</p>
                                        <p className="text-xs text-gray-500">{item.unit_name} × {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-sb-black whitespace-nowrap">
                                    {formatPrice(parseFloat(String(item.total_price)))}
                                </p>
                            </div>
                        ))}
                    </div>
                    {/* Totals */}
                    <div className="border-t border-gray-100 px-6 py-4 space-y-2 bg-gray-50/50">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>{formatPrice(parseFloat(String(order.subtotal)))}</span>
                        </div>
                        {parseFloat(String(order.discount_total)) > 0 && (
                            <div className="flex justify-between text-sm text-sb-green">
                                <span>Discount</span>
                                <span>− {formatPrice(parseFloat(String(order.discount_total)))}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Shipping</span>
                            <span>{parseFloat(String(order.shipping_total)) === 0 ? 'Free' : formatPrice(parseFloat(String(order.shipping_total)))}</span>
                        </div>
                        <div className="flex justify-between font-black text-sb-black pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>{formatPrice(parseFloat(String(order.grand_total)))}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Shipping address */}
                {shippingAddress && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className="bg-white rounded-[28px] border border-gray-100 shadow-md p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={16} className="text-sb-green" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery Address</p>
                        </div>
                        <p className="font-bold text-sm text-sb-black">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {shippingAddress.line_1}{shippingAddress.line_2 ? `, ${shippingAddress.line_2}` : ''}<br />
                            {shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ''} {shippingAddress.zip}<br />
                            {shippingAddress.country}
                        </p>
                        {shippingAddress.phone && <p className="text-sm text-gray-500 mt-1">{shippingAddress.phone}</p>}
                    </motion.div>
                )}

                {/* Help */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-center text-sm text-gray-400">
                    Questions about your order?{' '}
                    <Link href="/contact" className="text-sb-green font-bold hover:underline">Contact Support</Link>
                </motion.div>
            </div>
        </div>
    );
}

// ── Page shell ────────────────────────────────────────────────────────────────

function OrderPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = String(params.id ?? '');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsVerify, setNeedsVerify] = useState(false);

    // Auto-load for authenticated users (the auth endpoint uses token)
    useEffect(() => {
        if (!orderId) return;

        apiClient.get<Order>(`${Endpoints.orders}/${orderId}`)
            .then(res => setOrder(res as unknown as Order))
            .catch((err: ApiError) => {
                if (err.status === 401 || err.status === 403 || err.status === 404) {
                    // Not authenticated or not their order — show guest lookup
                    setNeedsVerify(true);
                }
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-sb-green" />
            </div>
        );
    }

    if (needsVerify && !order) {
        return <GuestLookup orderId={orderId} onFound={setOrder} />;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <XCircle size={48} className="text-red-400" />
                <h2 className="font-display text-2xl uppercase text-sb-black">Order Not Found</h2>
                <Link href="/shop" className="text-sb-green font-bold hover:underline text-sm">Continue Shopping</Link>
            </div>
        );
    }

    return <OrderDetail order={order} />;
}

export default function OrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-sb-green" />
            </div>
        }>
            <OrderPageContent />
        </Suspense>
    );
}
