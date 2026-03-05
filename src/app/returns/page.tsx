"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Package, CheckCircle2, ArrowRight, ArrowLeft, Upload, MessageCircle, Lock, AlertTriangle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const RETURN_REASONS = [
    'Defective or damaged product',
    'Wrong item received',
    'Changed my mind',
    'Better price found elsewhere',
    'Not as described on website',
    'Arrived too late',
    'Other',
];

type Step = 'select' | 'details' | 'review' | 'confirmed';

export default function ReturnsPage() {
    const { isAuthenticated, user } = useAuth();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    const [step, setStep] = useState<Step>('select');
    const [orderId, setOrderId] = useState('');
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [refundMethod, setRefundMethod] = useState<'original' | 'store_credit'>('original');

    const handleSubmit = () => {
        setStep('confirmed');
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] pt-20">
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#2A2A2A] to-sb-black pt-16 pb-32 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.15),_transparent_60%)]" />
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <RotateCcw size={12} className="text-sb-green" />
                            <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase">{tx('Service Client', 'Customer Service')}</p>
                        </div>
                        <h1 className="font-display text-6xl md:text-8xl uppercase text-white leading-[0.85] mb-4">
                            {tx('Retours', 'Returns')}<br />
                            <span className="text-white/30">{tx('& Remboursements', '& Refunds')}</span>
                        </h1>
                        <p className="text-white/50 max-w-lg text-lg">
                            {tx('Retournez un produit non ouvert sous 14 jours. Remboursement garanti.', 'Return any unopened product within 14 days. Refund guaranteed.')}
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            <section className="max-w-[800px] mx-auto px-8 py-16">
                {/* Coming Soon Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-10"
                >
                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                        <strong>Preview Mode</strong> — Online returns submission is coming soon. For now, contact us at <a href="mailto:returns@cafrezzo.com" className="underline font-bold">returns@cafrezzo.com</a> for assistance.
                    </p>
                </motion.div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    {[
                        { id: 'select', label: 'Select Order' },
                        { id: 'details', label: 'Details' },
                        { id: 'review', label: 'Review' },
                        { id: 'confirmed', label: 'Confirmed' },
                    ].map((s, i) => {
                        const steps: Step[] = ['select', 'details', 'review', 'confirmed'];
                        const currentIdx = steps.indexOf(step);
                        const isActive = steps.indexOf(s.id as Step) <= currentIdx;
                        return (
                            <React.Fragment key={s.id}>
                                <div className={`flex items-center gap-2 ${isActive ? 'text-sb-green' : 'text-gray-300'}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-sb-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {i + 1}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">{s.label}</span>
                                </div>
                                {i < 3 && <div className={`w-8 h-px ${isActive ? 'bg-sb-green' : 'bg-gray-200'}`} />}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Forms */}
                <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                    <AnimatePresence mode="wait">
                        {step === 'select' && (
                            <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-2xl uppercase mb-6">{tx('Sélectionner la commande', 'Select Order')}</h2>
                                <div className="mb-6">
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">Order Number</label>
                                    <input
                                        value={orderId}
                                        onChange={e => setOrderId(e.target.value)}
                                        placeholder="CF-XXXXXX"
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors"
                                    />
                                </div>
                                <div className="mb-8">
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">Reason for Return</label>
                                    <div className="relative">
                                        <select
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors appearance-none bg-white"
                                        >
                                            <option value="">Select a reason</option>
                                            {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep('details')}
                                    disabled={!orderId || !reason}
                                    className="w-full flex justify-between items-center px-6 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2C6345] transition-colors"
                                >
                                    <span>Continue</span>
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {step === 'details' && (
                            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-2xl uppercase mb-6">Additional Details</h2>
                                <div className="mb-6">
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">Description (optional)</label>
                                    <textarea
                                        value={details}
                                        onChange={e => setDetails(e.target.value)}
                                        placeholder="Tell us more about your return..."
                                        rows={4}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors resize-none"
                                    />
                                </div>
                                <div className="mb-8">
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">Refund Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'original' as const, label: 'Original Payment Method', desc: '5–10 business days' },
                                            { id: 'store_credit' as const, label: 'Store Credit', desc: 'Instant + 10% bonus' },
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setRefundMethod(m.id)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${refundMethod === m.id ? 'border-sb-green bg-sb-green/5' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <p className="font-bold text-sm mb-0.5">{m.label}</p>
                                                <p className="text-[10px] text-gray-400">{m.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep('select')} className="flex items-center gap-2 px-6 py-4 rounded-full border-2 border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-gray-200 transition-colors">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep('review')}
                                        className="flex-1 flex justify-between items-center px-6 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors"
                                    >
                                        <span>Review Request</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'review' && (
                            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-2xl uppercase mb-6">Review Your Request</h2>
                                <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-8">
                                    {[
                                        { label: 'Order', value: orderId },
                                        { label: 'Reason', value: reason },
                                        { label: 'Details', value: details || '(none provided)' },
                                        { label: 'Refund', value: refundMethod === 'original' ? 'Original Payment Method' : 'Store Credit (+10% bonus)' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                                            <p className="text-sm font-medium text-sb-black">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep('details')} className="flex items-center gap-2 px-6 py-4 rounded-full border-2 border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-gray-200 transition-colors">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 flex justify-between items-center px-6 py-4 bg-sb-black text-white rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                    >
                                        <span>Submit Return</span>
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'confirmed' && (
                            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                                <div className="w-20 h-20 bg-sb-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sb-green/30">
                                    <CheckCircle2 size={36} className="text-white" />
                                </div>
                                <h2 className="font-display text-4xl uppercase text-sb-black mb-3">Return Submitted</h2>
                                <p className="text-gray-500 mb-2">Reference: <span className="font-mono font-bold">RET-{Date.now().toString(36).toUpperCase().slice(-6)}</span></p>
                                <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
                                    We'll review your request within 24 hours and send you the return shipping label via email. Please don't ship the item until you receive the label.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-3">
                                    <Link href="/account" className="flex items-center justify-center gap-2 px-8 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors">
                                        <Package size={16} /> My Orders
                                    </Link>
                                    <Link href="/contact" className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-100 text-sb-black rounded-full font-black uppercase tracking-widest hover:border-sb-black transition-colors">
                                        <MessageCircle size={16} /> Contact Support
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Policy */}
                <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-sm mb-3 text-sb-black">Return Policy</h3>
                    <ul className="space-y-2 text-xs text-gray-500 leading-relaxed">
                        <li>• Returns are accepted within 14 days of delivery for unopened products.</li>
                        <li>• Defective items may be returned within 30 days regardless of packaging condition.</li>
                        <li>• Perishable products (coffee, sweets) cannot be returned once opened unless defective.</li>
                        <li>• Store Credit refunds include a 10% bonus and are applied instantly.</li>
                        <li>• Original payment method refunds take 5–10 business days to process.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
