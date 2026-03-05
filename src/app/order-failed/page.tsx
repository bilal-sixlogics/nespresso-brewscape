"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, MessageCircle, ArrowLeft, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';

function OrderFailedContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'payment_declined';
    const orderId = searchParams.get('order') || '';

    const REASONS: Record<string, { title: string; message: string }> = {
        payment_declined: {
            title: 'Payment Declined',
            message: 'Your payment was declined by the payment provider. This could be due to insufficient funds, card restrictions, or a temporary issue. No charge was made to your account.',
        },
        gateway_error: {
            title: 'Gateway Error',
            message: 'We encountered a technical issue with the payment gateway. This is not related to your payment method. Please try again in a few moments.',
        },
        timeout: {
            title: 'Payment Timed Out',
            message: 'The payment session expired before it could be completed. Your cart has been saved — please try again.',
        },
        cancelled: {
            title: 'Payment Cancelled',
            message: 'You cancelled the payment process. Your cart is still intact and you can try again whenever you\'re ready.',
        },
    };

    const { title, message } = REASONS[reason] || REASONS.payment_declined;

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50/50 to-white pt-24 pb-32">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* X Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="flex justify-center mb-8"
                >
                    <div className="w-28 h-28 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/25 ring-8 ring-red-500/10">
                        <XCircle size={56} className="text-white" strokeWidth={2} />
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-10"
                >
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">Payment Failed</p>
                    <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight text-sb-black mb-3">{title}</h1>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">{message}</p>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden mb-6"
                >
                    {orderId && (
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Reference</p>
                            <p className="font-mono font-bold text-sb-black">{orderId}</p>
                        </div>
                    )}

                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-amber-700 mb-1">Your cart is saved</p>
                                <p className="text-xs text-amber-600">All items in your cart have been preserved. You can go back and try a different payment method.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <Lock size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-emerald-700 mb-1">No charge was made</p>
                                <p className="text-xs text-emerald-600">You have not been charged. No payment details were stored on our servers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">Suggested actions</p>
                        <div className="space-y-2">
                            {[
                                'Try a different payment method (Stripe, Wise, or Cash on Delivery)',
                                'Check your internet connection and try again',
                                'Contact your bank if the issue persists',
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[9px] font-black text-red-500">{i + 1}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{s}</p>
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
                        href="/checkout"
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-sb-black text-white rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        <RefreshCw size={16} /> Try Again
                    </Link>
                    <Link
                        href="/contact"
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-sb-black border-2 border-gray-100 rounded-full font-black uppercase tracking-widest hover:border-sb-black transition-colors"
                    >
                        <MessageCircle size={16} /> Contact Support
                    </Link>
                </motion.div>

                <div className="flex justify-center mt-6">
                    <Link href="/shop" className="flex items-center gap-2 text-sm text-gray-400 hover:text-sb-black transition-colors">
                        <ArrowLeft size={14} /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderFailedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <OrderFailedContent />
        </Suspense>
    );
}
