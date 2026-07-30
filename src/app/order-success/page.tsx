"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, MapPin, CreditCard, ChevronRight, ShoppingBag, Truck, Calendar, Store } from 'lucide-react';
import Link from 'next/link';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';

interface OrderShippingMethod {
    id: number;
    name: string;
    type?: 'delivery' | 'pickup';
    estimated_days_min: number;
    estimated_days_max: number;
}

interface OrderDetails {
    shipping_total: number;
    shipping_method: OrderShippingMethod | null;
    created_at: string;
}

/** Formats a date range like "Wed, 15 Jul" or "15–17 Jul" from business-day offsets. */
function formatEstimatedDelivery(fromDate: Date, minDays: number, maxDays: number): string {
    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
    const start = addDays(fromDate, minDays);
    const end = addDays(fromDate, maxDays);

    if (minDays === maxDays) {
        return start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    const startLabel = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    const endLabel = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    return `${startLabel} – ${endLabel}`;
}

// Confetti component
function Confetti() {
    const COLORS = ['#C9A05A', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316'];
    const pieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random(),
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
    }));
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {pieces.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
                    style={{ left: p.left, width: p.size, height: p.size, backgroundColor: p.color, position: 'absolute', top: 0, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
                />
            ))}
        </div>
    );
}

function OrderSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const formatPrice = useFormatPrice();
    const [showConfetti, setShowConfetti] = useState(true);

    const orderId = searchParams.get('order') || '';
    const paymentMethod = searchParams.get('payment') || 'stripe';
    const total = searchParams.get('total') || '89.90';
    const email = searchParams.get('email') || '';

    const [order, setOrder] = useState<OrderDetails | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(t);
    }, []);

    // Fetch the real order so delivery estimate + shipping cost reflect this
    // specific order's shipping method, instead of a hardcoded "3 days" guess.
    useEffect(() => {
        const numId = parseInt(orderId, 10);
        if (!numId) return;
        apiClient.post<{ data: OrderDetails }>(Endpoints.trackOrder, { order_id: numId, email: email || undefined })
            .then(res => setOrder(res.data ?? (res as unknown as OrderDetails)))
            .catch(() => { /* fall back to defaults below if lookup fails */ });
    }, [orderId, email]);

    const PAYMENT_LABELS: Record<string, string> = {
        cod: 'Cash on Delivery', stripe: 'Stripe', wise: 'Wise Transfer', card: 'Credit / Debit Card',
    };

    const shippingMethod = order?.shipping_method ?? null;
    const isPickup = shippingMethod?.type === 'pickup';
    const shippingCost = order ? Number(order.shipping_total) : null;
    const isFreeShipping = shippingCost === 0;

    const orderCreatedAt = order?.created_at ? new Date(order.created_at) : new Date();
    const estimatedDate = shippingMethod
        ? formatEstimatedDelivery(orderCreatedAt, shippingMethod.estimated_days_min, shippingMethod.estimated_days_max)
        // Fallback while the order hasn't loaded yet (or lookup failed) — same
        // "3 business days" placeholder as before, just not the final value.
        : formatEstimatedDelivery(new Date(), 3, 3);

    return (
        <>
            {showConfetti && <Confetti />}
            <div className="min-h-screen bg-ink text-sand grain-overlay pt-24 pb-32">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">

                    {/* Check Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="w-28 h-28 rounded-full bg-gold flex items-center justify-center shadow-2xl shadow-gold/30 ring-8 ring-gold/10">
                            <CheckCircle2 size={56} className="text-ink" strokeWidth={2.5} />
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-10"
                    >
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                            {paymentMethod === 'cod' ? 'Order Confirmed' : 'Payment Confirmed'}
                        </p>
                        <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight text-sand mb-3">
                            Order Placed!
                        </h1>
                        <p className="text-sand/60">
                            {paymentMethod === 'cod'
                                ? 'Thank you! Please prepare the exact amount. Payment will be collected on delivery.'
                                : 'Thank you for your purchase. Your coffee is on its way!'}
                        </p>
                    </motion.div>

                    {/* Order Detail Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-sand rounded-[32px] border border-ink/10 shadow-xl overflow-hidden mb-6"
                    >
                        {/* Gold header strip */}
                        <div className="bg-gold px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-ink/60 text-[10px] uppercase tracking-widest font-bold">Order Number</p>
                                <p className="text-ink font-black text-xl tracking-widest font-mono">{orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-ink/60 text-[10px] uppercase tracking-widest font-bold">
                                    {paymentMethod === 'cod' ? 'Total Due' : 'Total Paid'}
                                </p>
                                <p className="text-ink font-display text-2xl">{formatPrice(parseFloat(total))}</p>
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                    <Calendar size={18} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-1">Order Date</p>
                                    <p className="font-semibold text-sm text-ink">{orderCreatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                                    {isPickup ? <Store size={18} className="text-blue-500" /> : <Truck size={18} className="text-blue-500" />}
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-1">
                                        {isPickup ? 'Ready for Pickup' : 'Est. Delivery'}
                                    </p>
                                    <p className="font-semibold text-sm text-ink">{estimatedDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                    {isPickup ? <Store size={18} className="text-gold" /> : <Truck size={18} className="text-gold" />}
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-1">Delivery Method</p>
                                    <p className="font-semibold text-sm text-ink">{shippingMethod?.name ?? '—'}</p>
                                    <p className="text-[10px] text-gold mt-0.5 font-bold">
                                        {shippingCost === null ? '' : isFreeShipping ? 'Free' : formatPrice(shippingCost)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={18} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-1">Payment Method</p>
                                    <p className="font-semibold text-sm text-ink">{PAYMENT_LABELS[paymentMethod] || paymentMethod}</p>
                                    <p className="text-[10px] text-gold mt-0.5 font-bold">
                                        {paymentMethod === 'cod' ? 'Pay on delivery' : 'No card details stored'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <Package size={18} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-1">Status</p>
                                    {paymentMethod === 'cod' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 border border-orange-500/25 text-orange-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            Awaiting Delivery
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            Processing
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* What next */}
                        <div className="border-t border-ink/10 px-6 py-5 bg-ink/5">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-3">What's next?</p>
                            <div className="space-y-2">
                                {(paymentMethod === 'cod' ? [
                                    'You\'ll receive a confirmation email shortly',
                                    'Our courier will contact you before delivery',
                                    'Please have ' + formatPrice(parseFloat(total)) + ' ready for the courier',
                                ] : [
                                    'You\'ll receive a confirmation email shortly',
                                    'We\'ll notify you when your order ships',
                                    'Track real-time status in your dashboard',
                                ]).map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[9px] font-black text-gold">{i + 1}</span>
                                        </div>
                                        <p className="text-xs text-ink/60">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <Link
                            href={`/orders/${orderId}${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gold text-ink rounded-full font-black uppercase tracking-widest hover:bg-[#b8914d] transition-colors shadow-lg shadow-gold/25"
                        >
                                <Package size={16} /> Track Order
                        </Link>
                        <Link
                            href="/shop"
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-sand/5 text-sand border-2 border-sand/15 rounded-full font-black uppercase tracking-widest hover:border-gold transition-colors"
                        >
                            <ShoppingBag size={16} /> Continue Shopping
                        </Link>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-ink flex items-center justify-center"><div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
