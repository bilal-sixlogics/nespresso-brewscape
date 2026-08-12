"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, MessageCircle, ArrowLeft, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

function OrderFailedContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const reason = searchParams.get('reason') || 'payment_declined';
    const orderId = searchParams.get('order') || '';

    const REASONS: Record<string, { title: string; message: string }> = {
        payment_declined: {
            title: t('reasonPaymentDeclinedTitle'),
            message: t('reasonPaymentDeclinedMsg'),
        },
        gateway_error: {
            title: t('reasonGatewayErrorTitle'),
            message: t('reasonGatewayErrorMsg'),
        },
        timeout: {
            title: t('reasonTimeoutTitle'),
            message: t('reasonTimeoutMsg'),
        },
        cancelled: {
            title: t('reasonCancelledTitle'),
            message: t('reasonCancelledMsg'),
        },
    };

    const { title, message } = REASONS[reason] || REASONS.payment_declined;

    return (
        <div className="min-h-screen bg-ink text-sand grain-overlay pt-24 pb-32">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* X Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="flex justify-center mb-8"
                >
                    <div className="w-28 h-28 rounded-full bg-red-500/15 flex items-center justify-center shadow-2xl shadow-red-500/10 ring-8 ring-red-500/10">
                        <XCircle size={56} className="text-red-400" strokeWidth={2} />
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-10"
                >
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-red-400 mb-2">{t('paymentFailedEyebrow')}</p>
                    <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight text-sand mb-3">{title}</h1>
                    <p className="text-sand/60 max-w-md mx-auto leading-relaxed">{message}</p>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-sand rounded-[32px] border border-ink/10 shadow-xl overflow-hidden mb-6"
                >
                    {orderId && (
                        <div className="bg-ink/5 px-6 py-4 border-b border-ink/10">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50">{t('referenceLabel')}</p>
                            <p className="font-mono font-bold text-ink">{orderId}</p>
                        </div>
                    )}

                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-amber-700 mb-1">{t('cartSavedTitle')}</p>
                                <p className="text-xs text-amber-700/80">All items in your cart have been preserved. You can go back and try a different payment method.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Lock size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-emerald-700 mb-1">{t('noChargeTitle')}</p>
                                <p className="text-xs text-emerald-700/80">You have not been charged. No payment details were stored on our servers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-ink/10 px-6 py-5 bg-ink/5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-ink/50 mb-3">{t('suggestedActions')}</p>
                        <div className="space-y-2">
                            {[
                                t('suggestedActionPaymentMethod'),
                                t('suggestedActionConnection'),
                                t('suggestedActionBank'),
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[9px] font-black text-red-500">{i + 1}</span>
                                    </div>
                                    <p className="text-xs text-ink/60">{s}</p>
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
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gold text-ink rounded-full font-black uppercase tracking-widest hover:bg-[#b8914d] transition-colors shadow-lg"
                    >
                        <RefreshCw size={16} /> {t('tryAgainBtn')}
                    </Link>
                    <Link
                        href="/contact"
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-sand/5 text-sand border-2 border-sand/15 rounded-full font-black uppercase tracking-widest hover:border-sand/40 transition-colors"
                    >
                        <MessageCircle size={16} /> {t('contactSupportBtn')}
                    </Link>
                </motion.div>

                <div className="flex justify-center mt-6">
                    <Link href="/shop" className="flex items-center gap-2 text-sm text-cocoa hover:text-sand transition-colors">
                        <ArrowLeft size={14} /> {t('continueBrowsing')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderFailedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-ink flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <OrderFailedContent />
        </Suspense>
    );
}
