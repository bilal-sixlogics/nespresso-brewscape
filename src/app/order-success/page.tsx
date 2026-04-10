"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, MapPin, CreditCard, ChevronRight, ShoppingBag, Truck, Calendar } from 'lucide-react';
import Link from 'next/link';

// Confetti component
function Confetti() {
    const COLORS = ['#39774D', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316'];
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
    const [showConfetti, setShowConfetti] = useState(true);

    const orderId = searchParams.get('order') || '';
    const paymentMethod = searchParams.get('payment') || 'stripe';
    const total = searchParams.get('total') || '89.90';

    useEffect(() => {
        const t = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(t);
    }, []);

    const PAYMENT_LABELS: Record<string, string> = {
        cod: 'Cash on Delivery', stripe: 'Stripe', wise: 'Wise Transfer', card: 'Credit / Debit Card',
    };

    const estimatedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    return (
        <>
            {showConfetti && <Confetti />}
            <div className="min-h-screen bg-gradient-to-b from-sb-green/5 to-white pt-24 pb-32">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">

                    {/* Check Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="w-28 h-28 rounded-full bg-sb-green flex items-center justify-center shadow-2xl shadow-sb-green/30 ring-8 ring-sb-green/10">
                            <CheckCircle2 size={56} className="text-white" strokeWidth={2.5} />
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-10"
                    >
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-sb-green mb-2">Payment Confirmed</p>
                        <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight text-sb-black mb-3">
                            Order Placed!
                        </h1>
                        <p className="text-gray-500">Thank you for your purchase. Your coffee is on its way! ☕</p>
                    </motion.div>

                    {/* Order Detail Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden mb-6"
                    >
                        {/* Green header strip */}
                        <div className="bg-sb-green px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Order Number</p>
                                <p className="text-white font-black text-xl tracking-widest font-mono">{orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Total Paid</p>
                                <p className="text-white font-display text-2xl">€{parseFloat(total).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-sb-green/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar size={18} className="text-sb-green" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order Date</p>
                                    <p className="font-semibold text-sm text-sb-black">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Truck size={18} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Est. Delivery</p>
                                    <p className="font-semibold text-sm text-sb-black">{estimatedDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={18} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Payment Method</p>
                                    <p className="font-semibold text-sm text-sb-black">{PAYMENT_LABELS[paymentMethod] || paymentMethod}</p>
                                    <p className="text-[10px] text-sb-green mt-0.5 font-bold">No card details stored</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <Package size={18} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        Processing
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* What next */}
                        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">What's next?</p>
                            <div className="space-y-2">
                                {[
                                    'You\'ll receive a confirmation email shortly',
                                    'We\'ll notify you when your order ships',
                                    'Track real-time status in your dashboard',
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-sb-green/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[9px] font-black text-sb-green">{i + 1}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{step}</p>
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
                            href={`/orders/${orderId}`}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors shadow-lg shadow-sb-green/25"
                        >
                            <Package size={16} /> Track Order
                        </Link>
                        <Link
                            href="/shop"
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-sb-black border-2 border-gray-100 rounded-full font-black uppercase tracking-widest hover:border-sb-green transition-colors"
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-sb-green border-t-transparent rounded-full animate-spin" /></div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
