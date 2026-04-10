"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ArrowRight, ArrowLeft, ChevronRight, MapPin, Phone,
    CreditCard, Lock, Truck, Package, ShoppingBag, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { AppConfig } from '@/lib/config';
import { getProductImage } from '@/types';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShippingForm {
    firstName: string; lastName: string;
    email: string; phone: string;
    address: string; city: string;
    postalCode: string; country: string;
    state: string;
}
interface BillingForm extends ShippingForm { sameAsShipping: boolean; }
interface PaymentForm {
    method: 'card' | 'cod' | 'stripe';
    cardHolder: string; cardNumber: string;
    expiry: string; cvv: string;
    saveCard: boolean;
    createAccount: boolean;
}

type Step = 'shipping' | 'payment' | 'confirmation';

interface ApiShippingMethod {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    estimated_days_min: number;
    estimated_days_max: number;
}

const STEPS: Step[] = ['shipping', 'payment', 'confirmation'];

const EU_COUNTRIES = [
    { code: 'FR', name: 'France' }, { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' }, { code: 'LU', name: 'Luxembourg' },
    { code: 'DE', name: 'Allemagne' }, { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' }, { code: 'NL', name: 'Pays-Bas' },
    { code: 'GB', name: 'Royaume-Uni' }, { code: 'PT', name: 'Portugal' },
    { code: 'MA', name: 'Maroc' }, { code: 'DZ', name: 'Algérie' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = 'text', placeholder = '', required = false, className = '' }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean; className?: string;
}) {
    const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className={className}>
            <label htmlFor={inputId} className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}{required && ' *'}</label>
            <input
                id={inputId}
                type={type} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:border-sb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-green transition-colors bg-white placeholder:text-gray-300"
            />
        </div>
    );
}

function Select({ label, value, onChange, options, className = '' }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; className?: string;
}) {
    const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className={className}>
            <label htmlFor={selectId} className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label} *</label>
            <select
                id={selectId}
                value={value} onChange={e => onChange(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:border-sb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-green transition-colors bg-white text-gray-700"
            >
                <option value="">Sélectionner...</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

function StepIndicator({ current }: { current: Step }) {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const steps = [
        { id: 'shipping', label: tx('Livraison', 'Shipping'), icon: Truck },
        { id: 'payment', label: tx('Paiement', 'Payment'), icon: CreditCard },
        { id: 'confirmation', label: tx('Confirmation', 'Confirmation'), icon: Check },
    ];
    const currentIdx = STEPS.indexOf(current);
    return (
        <div className="flex items-center justify-center gap-0 mb-12">
            {steps.map((step, i) => {
                const Icon = step.icon;
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? 'bg-sb-green border-sb-green' : active ? 'bg-white border-sb-green shadow-lg shadow-sb-green/20' : 'bg-white border-gray-200'}`}>
                                {done
                                    ? <Check size={16} className="text-white" />
                                    : <Icon size={16} className={active ? 'text-sb-green' : 'text-gray-300'} />
                                }
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider mt-2 ${active ? 'text-sb-green' : done ? 'text-gray-500' : 'text-gray-300'}`}>{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-0.5 w-16 sm:w-24 mb-5 transition-all duration-500 ${i < currentIdx ? 'bg-sb-green' : 'bg-gray-100'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function OrderSummary({ compact = false }: { compact?: boolean }) {
    const { items, subtotal, promoDiscount, shippingCost, total, appliedPromo, selectedShipping } = useCart();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [expanded, setExpanded] = useState(!compact);

    return (
        <div className={`bg-white rounded-[32px] border border-gray-100 overflow-hidden ${compact ? '' : 'shadow-sm'}`}>
            <button
                onClick={() => compact && setExpanded(p => !p)}
                className={`w-full flex items-center justify-between p-6 ${compact ? 'cursor-pointer' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-sb-green" />
                    <span className="font-black text-sm uppercase tracking-widest">{tx('Récapitulatif', 'Order Summary')}</span>
                    <span className="text-xs text-gray-400">({items.length} {tx('articles', 'items')})</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-display text-2xl text-sb-green">€{total.toFixed(2)}</span>
                    {compact && <ChevronRight size={16} className={`text-gray-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />}
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-6 pb-6 space-y-3">
                            {/* Items */}
                            <div className="space-y-3 border-b border-gray-100 pb-4">
                                {items.map(item => {
                                    const name = item.product.name;
                                    const unit = item.saleUnit.name;
                                    return (
                                        <div key={`${item.product.id}-${item.saleUnit.id}`} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                <img src={getProductImage(item.product) ?? ''} alt={name} className="w-10 h-10 object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-sb-black truncate">{name}</p>
                                                <p className="text-[9px] text-gray-400">{unit} × {item.quantity}</p>
                                            </div>
                                            <span className="font-bold text-sm">€{(item.unitPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pricing breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500"><span>{tx('Sous-total', 'Subtotal')}</span><span className="font-bold">€{subtotal.toFixed(2)}</span></div>
                                {promoDiscount > 0 && <div className="flex justify-between text-sb-green"><span>{appliedPromo?.code}</span><span className="font-bold">-€{promoDiscount.toFixed(2)}</span></div>}
                                <div className="flex justify-between text-gray-500">
                                    <span>{tx('Livraison', 'Shipping')} — {language === 'fr' ? selectedShipping.label : selectedShipping.labelEn}</span>
                                    <span className={`font-bold ${shippingCost === 0 ? 'text-sb-green' : ''}`}>{shippingCost === 0 ? tx('Gratuite', 'Free') : `€${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sb-black font-black pt-2 border-t border-gray-100 text-base">
                                    <span>Total</span>
                                    <span className="font-display text-2xl text-sb-green">€{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Guarantees */}
                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {[
                                    { icon: Lock, text: tx('Paiement 100% sécurisé', '100% Secure Payment') },
                                    { icon: Package, text: tx('Retour gratuit sous 14 jours', 'Free Returns within 14 days') },
                                    { icon: MapPin, text: tx('Livré depuis la France', 'Shipped from France') },
                                ].map(({ icon: Icon, text }, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <Icon size={12} className="text-sb-green flex-shrink-0" />
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Step 1: Shipping ─────────────────────────────────────────────────────────
function ShippingStep({ form, onChange, billing, onBillingChange, onNext }: {
    form: ShippingForm; onChange: (f: ShippingForm) => void;
    billing: BillingForm; onBillingChange: (f: BillingForm) => void;
    onNext: (shippingMethodId: number) => void;
}) {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const set = (key: keyof ShippingForm) => (v: string) => onChange({ ...form, [key]: v });

    const [apiMethods, setApiMethods] = useState<ApiShippingMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [methodsLoading, setMethodsLoading] = useState(true);

    // Fetch real shipping methods from backend
    useEffect(() => {
        fetch(Endpoints.shippingMethods + (form.country ? `?country=${form.country}` : ''))
            .then(r => r.json())
            .then((data: ApiShippingMethod[]) => {
                const methods = Array.isArray(data) ? data : [];
                setApiMethods(methods);
                if (methods.length > 0 && !selectedMethodId) setSelectedMethodId(methods[0].id);
            })
            .catch(() => setApiMethods([]))
            .finally(() => setMethodsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.country]);

    const isValid = !!(form.firstName && form.lastName && form.email && form.address && form.city && form.postalCode && form.country && selectedMethodId);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl uppercase mb-8">{tx('Adresse de livraison', 'Shipping Address')}</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <Input label={tx('Prénom', 'First Name')} value={form.firstName} onChange={set('firstName')} required />
                <Input label={tx('Nom', 'Last Name')} value={form.lastName} onChange={set('lastName')} required />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Input label="Email" value={form.email} onChange={set('email')} type="email" required />
                <Input label={tx('Téléphone', 'Phone')} value={form.phone} onChange={set('phone')} type="tel" placeholder="+33 6 00 00 00 00" />
            </div>
            <Input label={tx('Adresse', 'Address')} value={form.address} onChange={set('address')} placeholder="16 Boulevard du Général de Gaulle" required className="mb-4" />
            <div className="grid grid-cols-3 gap-4 mb-4">
                <Input label={tx('Code postal', 'Postal Code')} value={form.postalCode} onChange={set('postalCode')} placeholder="75001" required />
                <Input label={tx('Ville', 'City')} value={form.city} onChange={set('city')} placeholder="Paris" required className="col-span-2" />
            </div>
            <Select
                label={tx('Pays', 'Country')}
                value={form.country}
                onChange={set('country')}
                options={EU_COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                className="mb-8"
            />

            {/* Shipping — auto-selected standard method, shown as info card */}
            <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{tx('Mode de livraison', 'Delivery Method')}</p>
                {methodsLoading ? (
                    <div className="h-16 rounded-2xl bg-gray-50 animate-pulse" />
                ) : apiMethods.length === 0 ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 rounded-2xl border border-red-100">
                        <AlertCircle size={15} /> {tx('Livraison indisponible pour ce pays.', 'Shipping unavailable for this country.')}
                    </div>
                ) : (() => {
                    const method = apiMethods[0];
                    return (
                        <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-sb-green bg-sb-green/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sb-green/10 flex items-center justify-center">
                                    <Truck size={16} className="text-sb-green" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-sb-black">{method.name}</p>
                                    <p className="text-[10px] text-gray-400">{method.estimated_days_min}–{method.estimated_days_max} {tx('jours ouvrés', 'business days')}</p>
                                </div>
                            </div>
                            <span className="font-black text-base text-sb-green">
                                {method.base_price === 0 ? tx('Gratuit', 'Free') : `€${Number(method.base_price).toFixed(2)}`}
                            </span>
                        </div>
                    );
                })()}
            </div>

            {/* Billing same as shipping */}
            <label className="flex items-center gap-3 mb-8 cursor-pointer group">
                <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${billing.sameAsShipping ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                    onClick={() => onBillingChange({ ...billing, sameAsShipping: !billing.sameAsShipping })}
                >
                    {billing.sameAsShipping && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm font-bold text-gray-600">{tx('Adresse de facturation identique', 'Billing address same as shipping')}</span>
            </label>

            <button
                onClick={() => selectedMethodId && onNext(selectedMethodId)}
                disabled={!isValid}
                className="w-full flex justify-between items-center px-8 py-5 bg-sb-green text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-sb-green/25 hover:bg-[#2C6345] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <span>{tx('Continuer vers le paiement', 'Continue to Payment')}</span>
                <ArrowRight size={18} />
            </button>
        </motion.div>
    );
}

// ─── Step 2: Payment ──────────────────────────────────────────────────────────
function PaymentStep({ form, onChange, onNext, onBack, shippingForm, billingForm, shippingMethodId, promoCode }: {
    form: PaymentForm; onChange: (f: PaymentForm) => void;
    onNext: (orderId: number) => void; onBack: () => void;
    shippingForm: ShippingForm; billingForm: BillingForm;
    shippingMethodId: number;
    promoCode: string | null;
}) {
    const { isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const set = (key: keyof PaymentForm) => (v: any) => onChange({ ...form, [key]: v });

    const handleProcess = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const shippingAddress = {
                first_name: shippingForm.firstName,
                last_name: shippingForm.lastName,
                line_1: shippingForm.address,
                city: shippingForm.city,
                zip: shippingForm.postalCode,
                country: shippingForm.country,
                phone: shippingForm.phone || undefined,
                state: shippingForm.state || undefined,
            };
            const billingAddress = billingForm.sameAsShipping ? undefined : {
                first_name: billingForm.firstName,
                last_name: billingForm.lastName,
                line_1: billingForm.address,
                city: billingForm.city,
                zip: billingForm.postalCode,
                country: billingForm.country,
                phone: billingForm.phone || undefined,
            };
            const res = await apiClient.post<{ order_id: number; grand_total: number; client_secret?: string }>(
                Endpoints.placeOrder,
                {
                    shipping_address: shippingAddress,
                    billing_address: billingAddress,
                    shipping_method_id: shippingMethodId,
                    promotion_code: promoCode || undefined,
                    email: shippingForm.email,
                    phone: shippingForm.phone || undefined,
                }
            );
            onNext(res.order_id);
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    const formatExpiry = (v: string) => {
        const digits = v.replace(/\D/g, '');
        if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
        return digits;
    };

    const isCardValid = form.cardHolder && form.cardNumber.replace(/\s/g, '').length === 16 && form.expiry.length === 5 && form.cvv.length >= 3;
    const isValid = form.method === 'card' ? isCardValid : true;

    const paymentMethods = [
        { id: 'card', label: tx('Carte Bancaire', 'Credit Card'), icon: CreditCard },
        { id: 'stripe', label: 'Stripe / Apple Pay', icon: ShoppingBag },
        { id: 'cod', label: tx('Paiement à la livraison', 'Cash on Delivery'), icon: Truck },
    ];

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative">
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-[40px]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-sb-green border-t-transparent rounded-full mb-4"
                    />
                    <p className="font-display text-xl uppercase tracking-widest text-sb-black">
                        {form.method === 'stripe' ? tx('Redirection Stripe...', 'Redirecting to Stripe...') : tx('Traitement...', 'Processing...')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">Secure API Gateway Integration</p>
                </div>
            )}

            <h2 className="font-display text-3xl uppercase mb-8">{tx('Mode de paiement', 'Payment Method')}</h2>

            {/* Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {paymentMethods.map(m => (
                    <button
                        key={m.id}
                        onClick={() => set('method')(m.id as any)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${form.method === m.id ? 'border-sb-green bg-sb-green/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                        <m.icon size={20} className={form.method === m.id ? 'text-sb-green' : 'text-gray-300'} />
                        <span className={`text-[10px] font-black uppercase tracking-wider text-center ${form.method === m.id ? 'text-sb-green' : 'text-gray-500'}`}>{m.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {form.method === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {/* Card preview */}
                        <div className="bg-gradient-to-br from-sb-black to-[#2a2a2a] rounded-3xl p-6 mb-8 text-white relative overflow-hidden h-44 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.4),_transparent_60%)]" />
                            <div className="absolute top-5 right-5 flex gap-2 z-10">
                                <div className="w-8 h-8 bg-red-500/80 rounded-full" />
                                <div className="w-8 h-8 bg-yellow-400/80 rounded-full -ml-4" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <p className="text-[10px] font-bold tracking-widest opacity-60">{tx('CARTE BANCAIRE', 'PAYMENT CARD')}</p>
                                <div>
                                    <p className="font-mono text-lg tracking-[0.2em] mb-1">{form.cardNumber || '•••• •••• •••• ••••'}</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[8px] opacity-60 tracking-wider">{tx('TITULAIRE', 'CARD HOLDER')}</p>
                                            <p className="text-sm font-bold truncate max-w-[150px]">{form.cardHolder || 'MARIE DUPONT'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] opacity-60 tracking-wider">{tx('EXPIRE', 'EXPIRES')}</p>
                                            <p className="text-sm font-bold">{form.expiry || '••/••'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <Input label={tx('Titulaire de la carte', 'Card Holder')} value={form.cardHolder} onChange={set('cardHolder')} placeholder="MARIE DUPONT" required />
                            <Input
                                label={tx('Numéro de carte', 'Card Number')}
                                value={form.cardNumber}
                                onChange={v => set('cardNumber')(formatCard(v))}
                                placeholder="1234 5678 9012 3456"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={tx('Expiration', 'Expiry')}
                                    value={form.expiry}
                                    onChange={v => set('expiry')(formatExpiry(v))}
                                    placeholder="MM/AA"
                                    required
                                />
                                <Input label="CVV" value={form.cvv} onChange={set('cvv')} placeholder="•••" type="password" required />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 mb-6 cursor-pointer group">
                            <div
                                onClick={() => onChange({ ...form, saveCard: !form.saveCard })}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.saveCard ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                            >
                                {form.saveCard && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold text-gray-600">{tx('Sauvegarder pour mes prochains achats', 'Save for future purchases')}</span>
                        </label>

                        {!isAuthenticated && (
                            <label className="flex items-center gap-3 mb-6 cursor-pointer group">
                                <div
                                    onClick={() => onChange({ ...form, createAccount: !form.createAccount })}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.createAccount ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                                >
                                    {form.createAccount && <Check size={12} className="text-white" />}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-600 block">{tx('Créer un compte', 'Create an account')}</span>
                                    <span className="text-[10px] text-gray-400">{tx('Suivez votre commande facilement.', 'Easily track your order.')}</span>
                                </div>
                            </label>
                        )}
                    </motion.div>
                )}

                {form.method === 'stripe' && (
                    <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-8">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <ShoppingBag size={32} className="text-blue-600" />
                            </div>
                            <h3 className="font-display text-xl uppercase mb-2">Stripe Secure Checkout</h3>
                            <p className="text-sm text-gray-500 mb-6">{tx('Vous allez être redirigé vers le portail sécurisé Stripe pour finaliser votre paiement.', 'You will be redirected to the secure Stripe portal to finalize your payment.')}</p>
                            <div className="flex justify-center gap-4">
                                {['Apple Pay', 'Google Pay', 'Link'].map(p => (
                                    <span key={p} className="text-[9px] font-bold text-blue-600/50 uppercase tracking-widest">{p}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {form.method === 'cod' && (
                    <motion.div key="cod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-8">
                        <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-orange-600">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-display text-lg uppercase mb-1">{tx('Paiement à la livraison', 'Cash on Delivery')}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{tx('Préparez le montant exact pour faciliter la réception. Notre livreur vous contactera avant son arrivée.', 'Please prepare the exact amount for easier delivery. Our courier will contact you before arrival.')}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-orange-700/60 uppercase">
                                        <Check size={12} /> {tx('Échange sans contact disponible', 'Contactless exchange available')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Lock size={16} className="text-sb-green flex-shrink-0" />
                <p className="text-[10px] text-gray-500 opacity-70">
                    {form.method === 'card'
                        ? tx('Données cryptées SSL 256-bit. Aucun stockage bancaire.', 'SSL 256-bit encrypted. No banking storage.')
                        : tx('Transaction sécurisée garantie par Cafrezzo.', 'Secure transaction guaranteed by Cafrezzo.')}
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-xs leading-snug">{error}</p>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={onBack} className="flex items-center gap-2 px-6 py-4 rounded-full border-2 border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-gray-200 transition-colors">
                    <ArrowLeft size={16} />
                    {tx('Retour', 'Back')}
                </button>
                <button
                    onClick={handleProcess}
                    disabled={!isValid || isProcessing}
                    className="flex-1 flex justify-between items-center px-8 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-sb-green/25 hover:bg-[#2C6345] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                    <span className="group-hover:translate-x-1 transition-transform">{form.method === 'cod' ? tx('Confirmer la commande', 'Confirm Order') : tx('Effectuer le paiement', 'Process Payment')}</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────
function ConfirmationStep({ orderNum, shipping, billing, paymentMethod }: { orderNum: string | number, shipping: ShippingForm, billing: BillingForm, paymentMethod: string }) {
    const { clearCart, items, total } = useCart();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    useEffect(() => {
        const t = setTimeout(clearCart, 3000); // Clear after 3 seconds to let user see summary
        return () => clearTimeout(t);
    }, [clearCart]);

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pb-12">
            <div className="text-center mb-12">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    className="w-20 h-20 bg-sb-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sb-green/30"
                >
                    <Check size={36} className="text-white" strokeWidth={3} />
                </motion.div>
                <h2 className="font-display text-5xl uppercase text-sb-black mb-3 tracking-tighter">{tx('Succès !', 'Success!')}</h2>
                <p className="text-gray-400 text-lg">
                    {tx('Votre commande est en route.', 'Your order is on its way.')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Details Card */}
                <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sb-green mb-1">{tx('COMMANDE', 'ORDER')}</p>
                    <p className="font-mono font-black text-2xl text-sb-black mb-6">#{orderNum}</p>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{tx('DESTINATION', 'SHIPPING TO')}</p>
                            <p className="text-sm font-bold text-sb-black">{shipping.firstName} {shipping.lastName}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{shipping.address}<br />{shipping.postalCode} {shipping.city}, {shipping.country}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{tx('PAIEMENT', 'PAYMENT')}</p>
                            <div className="flex items-center gap-2">
                                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-black uppercase text-sb-black">{paymentMethod}</span>
                                <span className="text-[10px] font-bold text-sb-green uppercase">Authorized</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking / Next Steps */}
                <div className="bg-sb-black rounded-[32px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sb-green/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sb-green mb-6">{tx('RESTEZ CONNECTÉ', 'STAY UPDATED')}</p>

                    <div className="space-y-6">
                        {[
                            { icon: Truck, title: tx('Suivi en direct', 'Live Tracking'), desc: tx('Suivez votre colis via notre app.', 'Track via our app.') },
                            { icon: Phone, title: tx('Support VIP', 'VIP Support'), desc: tx('Un expert dédié pour vous.', 'Dedicated expert for you.') },
                            { icon: ShoppingBag, title: tx('Accès Anticipe', 'Early Access'), desc: tx('Bientôt : Nouvelle collection.', 'Coming: New collection.') },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <step.icon size={18} className="text-sb-green" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold mb-0.5">{step.title}</p>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-4 bg-sb-green rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors">
                        {tx('Télécharger l\'App', 'Download the App')}
                    </button>
                </div>
            </div>

            <div className="flex border-t border-gray-100 pt-12 justify-center">
                <Link href="/shop" className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-sb-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-sb-black hover:text-white transition-all shadow-xl shadow-sb-black/5">
                    {tx('Retour à la boutique', 'Back to Shop')} <ArrowRight size={16} />
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { items, total, appliedPromo, clearCart } = useCart();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const router = useRouter();

    const { user } = useAuth();
    const [step, setStep] = useState<Step>('shipping');
    const [orderId, setOrderId] = useState<number | null>(null);
    const [shippingMethodId, setShippingMethodId] = useState<number>(0);

    const [shippingForm, setShippingForm] = useState<ShippingForm>({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '', phone: '',
        address: '', city: '', postalCode: '', country: 'FR', state: '',
    });
    const [billingForm, setBillingForm] = useState<BillingForm>({
        ...shippingForm, sameAsShipping: true,
    });
    const [paymentForm, setPaymentForm] = useState<PaymentForm>({
        method: 'card', cardHolder: user?.name || '', cardNumber: '', expiry: '', cvv: '', saveCard: false, createAccount: false
    });

    // Account creation after checkout is handled via /register page
    // (paymentForm.createAccount is kept for future backend integration)

    // If cart is empty and not on confirmation, redirect
    if (items.length === 0 && step !== 'confirmation') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] gap-6 px-4 sm:px-6">
                <ShoppingBag size={48} className="text-gray-200" />
                <h1 className="font-display text-4xl uppercase">{tx('Panier vide', 'Empty Cart')}</h1>
                <p className="text-gray-400">{tx('Ajoutez des produits avant de passer commande.', 'Add some products before checking out.')}</p>
                <Link href="/shop" className="bg-sb-green text-white px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-lg">
                    {tx('Aller à la boutique', 'Go to Shop')}
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
                <Link href="/shop" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-sb-green transition-colors">
                    <ArrowLeft size={14} />
                    {tx('Boutique', 'Shop')}
                </Link>
                <span className="font-display text-xl uppercase">{AppConfig.brand.name}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <Lock size={11} className="text-sb-green" />
                    {tx('Paiement sécurisé', 'Secure Checkout')}
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <StepIndicator current={step} />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
                    {/* ── Left: Form ── */}
                    <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-gray-100 p-5 sm:p-6 lg:p-8 shadow-sm">
                        <AnimatePresence mode="wait">
                            {step === 'shipping' && (
                                <ShippingStep
                                    key="shipping"
                                    form={shippingForm}
                                    onChange={setShippingForm}
                                    billing={billingForm}
                                    onBillingChange={setBillingForm}
                                    onNext={(methodId) => { setShippingMethodId(methodId); setStep('payment'); }}
                                />
                            )}
                            {step === 'payment' && (
                                <PaymentStep
                                    key="payment"
                                    form={paymentForm}
                                    onChange={setPaymentForm}
                                    onNext={(oid) => {
                                        setOrderId(oid);
                                        clearCart();
                                        router.push(`/order-success?order=${oid}&payment=${paymentForm.method}&total=${total.toFixed(2)}`);
                                    }}
                                    onBack={() => setStep('shipping')}
                                    shippingForm={shippingForm}
                                    billingForm={billingForm}
                                    shippingMethodId={shippingMethodId}
                                    promoCode={appliedPromo?.code ?? null}
                                />
                            )}
                            {step === 'confirmation' && (
                                <ConfirmationStep
                                    key="confirmation"
                                    orderNum={orderId ?? ''}
                                    shipping={shippingForm}
                                    billing={billingForm}
                                    paymentMethod={paymentForm.method}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Right: Order Summary ── */}
                    {step !== 'confirmation' && (
                        <div className="sticky top-8">
                            <OrderSummary />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
