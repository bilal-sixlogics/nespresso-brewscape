"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ArrowRight, ArrowLeft, ChevronRight, MapPin, Phone,
    CreditCard, Lock, Truck, Package, ShoppingBag, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { AppConfig } from '@/lib/config';
import { getProductImage } from '@/types';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

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
    method: 'stripe' | 'cod';
    createAccount: boolean;
    acceptedTerms: boolean;
}

type Step = 'shipping' | 'payment';

interface ApiShippingMethod {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    estimated_days_min: number;
    estimated_days_max: number;
}

const STEPS: Step[] = ['shipping', 'payment'];

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

// ─── Stripe Payment Form (rendered inside Elements provider) ─────────────────
function StripePaymentForm({ onSuccess, onBack, language }: {
    onSuccess: () => void;
    onBack: () => void;
    language: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!stripe || !elements) return;
        setIsConfirming(true);
        setError(null);
        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });
        if (confirmError) {
            setError(confirmError.message ?? tx('Paiement échoué.', 'Payment failed.'));
            setIsConfirming(false);
        } else {
            onSuccess();
        }
    };

    return (
        <div>
            <div className="mb-6">
                <PaymentElement options={{ layout: 'tabs' }} />
            </div>
            <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Lock size={16} className="text-sb-green flex-shrink-0" />
                <p className="text-[10px] text-gray-500 opacity-70">
                    {tx('Paiement crypté SSL 256-bit via Stripe. Aucun numéro de carte stocké.', 'SSL 256-bit encrypted via Stripe. No card data stored.')}
                </p>
            </div>
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-xs leading-snug">{error}</p>
                </div>
            )}
            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    disabled={isConfirming}
                    className="flex items-center gap-2 px-6 py-4 rounded-full border-2 border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-gray-200 transition-colors disabled:opacity-40"
                >
                    <ArrowLeft size={16} />
                    {tx('Retour', 'Back')}
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isConfirming || !stripe || !elements}
                    className="flex-1 flex justify-between items-center px-8 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-sb-green/25 hover:bg-[#2C6345] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                    {isConfirming ? (
                        <><Loader2 size={18} className="animate-spin" /><span>{tx('Traitement...', 'Processing...')}</span></>
                    ) : (
                        <><span>{tx('Payer maintenant', 'Pay Now')}</span><ArrowRight size={18} /></>
                    )}
                </button>
            </div>
        </div>
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
    const { total } = useCart();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // After placing the order we store client_secret + order_id to show Stripe Elements
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
    // Enabled payment methods from admin settings
    const [enabledMethods, setEnabledMethods] = useState<{
        stripe: boolean; cod: boolean; paypal: boolean;
        cod_config?: { max_order_amount: number; surcharge: number; surcharge_type: string };
    } | null>(null);

    useEffect(() => {
        fetch(Endpoints.paymentMethods)
            .then(r => r.json())
            .then(data => {
                setEnabledMethods(data);
                // If current method was disabled, switch to first enabled
                if (data && !data[form.method]) {
                    const first = data.stripe ? 'stripe' : data.cod ? 'cod' : 'stripe';
                    onChange({ ...form, method: first });
                }
            })
            .catch(() => setEnabledMethods({ stripe: true, cod: true, paypal: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildPayload = () => {
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
        return {
            shipping_address: shippingAddress,
            billing_address: billingAddress,
            shipping_method_id: shippingMethodId,
            promotion_code: promoCode || undefined,
            payment_method: form.method,
            email: shippingForm.email,
            phone: shippingForm.phone || undefined,
        };
    };

    const handleContinueToStripe = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const res = await apiClient.post<{ order_id: number; grand_total: number; client_secret: string }>(
                Endpoints.placeOrder,
                buildPayload(),
            );
            setClientSecret(res.client_secret);
            setPendingOrderId(res.order_id);
        } catch (err) {
            setError((err as ApiError).message ?? tx('Erreur serveur. Réessayez.', 'Server error. Please try again.'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCOD = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const res = await apiClient.post<{ order_id: number; grand_total: number }>(
                Endpoints.placeOrder,
                buildPayload(),
            );
            onNext(res.order_id);
        } catch (err) {
            setError((err as ApiError).message ?? tx('Erreur serveur. Réessayez.', 'Server error. Please try again.'));
        } finally {
            setIsProcessing(false);
        }
    };

    const allMethods = [
        { id: 'stripe' as const, label: tx('Carte / Apple Pay / Google Pay', 'Card / Apple Pay / Google Pay'), icon: CreditCard },
        { id: 'cod' as const, label: tx('Paiement à la livraison', 'Cash on Delivery'), icon: Truck },
    ];
    const paymentMethods = enabledMethods
        ? allMethods.filter(m => enabledMethods[m.id])
        : allMethods;

    // Phase 2: Stripe Elements are ready — show PaymentElement
    if (clientSecret && pendingOrderId) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-3xl uppercase mb-2">{tx('Paiement sécurisé', 'Secure Payment')}</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-8">
                    {tx('Commande', 'Order')} #{pendingOrderId}
                </p>
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'stripe',
                            variables: {
                                colorPrimary: '#3B7E5A',
                                borderRadius: '16px',
                                fontFamily: 'system-ui, sans-serif',
                            },
                        },
                    }}
                >
                    <StripePaymentForm
                        language={language}
                        onBack={() => { setClientSecret(null); setPendingOrderId(null); }}
                        onSuccess={() => onNext(pendingOrderId)}
                    />
                </Elements>
            </motion.div>
        );
    }

    // Phase 1: Method selector
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative">
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-[40px]">
                    <Loader2 size={32} className="animate-spin text-sb-green mb-4" />
                    <p className="font-display text-xl uppercase tracking-widest text-sb-black">{tx('Préparation...', 'Preparing...')}</p>
                </div>
            )}

            <h2 className="font-display text-3xl uppercase mb-8">{tx('Mode de paiement', 'Payment Method')}</h2>

            {/* Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {paymentMethods.map(m => (
                    <button
                        key={m.id}
                        onClick={() => onChange({ ...form, method: m.id })}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 ${form.method === m.id ? 'border-sb-green bg-sb-green/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                        <m.icon size={22} className={form.method === m.id ? 'text-sb-green' : 'text-gray-300'} />
                        <span className={`text-[10px] font-black uppercase tracking-wider text-center ${form.method === m.id ? 'text-sb-green' : 'text-gray-500'}`}>{m.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {form.method === 'stripe' && (
                    <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-8">
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <CreditCard size={20} className="text-sb-green" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{tx('Paiement par Stripe', 'Pay with Stripe')}</p>
                                    <p className="text-[10px] text-gray-400">{tx('Carte, Apple Pay, Google Pay, Link', 'Card, Apple Pay, Google Pay, Link')}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">{tx('Vos données de carte sont traitées directement par Stripe — jamais stockées sur nos serveurs.', 'Your card data is handled directly by Stripe — never stored on our servers.')}</p>
                        </div>
                    </motion.div>
                )}

                {form.method === 'cod' && (() => {
                    const codCfg = enabledMethods?.cod_config;
                    const maxAmount = codCfg?.max_order_amount ?? 0;
                    const surcharge = codCfg?.surcharge ?? 0;
                    const surchargeType = codCfg?.surcharge_type ?? 'fixed';
                    const exceeds = maxAmount > 0 && total > maxAmount;
                    const surchargeDisplay = surcharge > 0
                        ? surchargeType === 'percentage' ? `${surcharge}%` : `€${surcharge.toFixed(2)}`
                        : null;

                    return (
                        <motion.div key="cod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-8 space-y-3">
                            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-orange-600">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg uppercase mb-1">{tx('Paiement à la livraison', 'Cash on Delivery')}</h3>
                                        <p className="text-sm text-gray-500 mb-3">{tx('Préparez le montant exact pour faciliter la réception. Notre livreur vous contactera avant son arrivée.', 'Please prepare the exact amount for easier delivery. Our courier will contact you before arrival.')}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-orange-700/60 uppercase">
                                            <Check size={12} /> {tx('Échange sans contact disponible', 'Contactless exchange available')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {surchargeDisplay && (
                                <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2.5">
                                    <AlertCircle size={14} className="flex-shrink-0" />
                                    {tx(`Un supplément de ${surchargeDisplay} sera appliqué pour le paiement à la livraison.`, `A ${surchargeDisplay} surcharge applies for cash on delivery.`)}
                                </div>
                            )}
                            {exceeds && (
                                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5">
                                    <AlertCircle size={14} className="flex-shrink-0" />
                                    {tx(`Le paiement à la livraison n'est pas disponible pour les commandes supérieures à €${maxAmount.toFixed(2)}.`, `Cash on delivery is not available for orders above €${maxAmount.toFixed(2)}.`)}
                                </div>
                            )}
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Terms & Conditions + EU withdrawal right */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <div
                    onClick={() => onChange({ ...form, acceptedTerms: !form.acceptedTerms })}
                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.acceptedTerms ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                >
                    {form.acceptedTerms && <Check size={12} className="text-white" />}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                    {tx(
                        'J\'accepte les Conditions Générales de Vente et la Politique de Confidentialité. Je reconnais mon droit de rétractation de 14 jours conformément à la directive européenne 2011/83/UE.',
                        'I accept the Terms & Conditions and Privacy Policy. I acknowledge my 14-day right of withdrawal under EU Directive 2011/83/EU.'
                    )}
                </span>
            </label>

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
                    onClick={form.method === 'cod' ? handleCOD : handleContinueToStripe}
                    disabled={isProcessing || !form.acceptedTerms || (form.method === 'cod' && (enabledMethods?.cod_config?.max_order_amount ?? 0) > 0 && total > (enabledMethods?.cod_config?.max_order_amount ?? 0))}
                    className="flex-1 flex justify-between items-center px-8 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-sb-green/25 hover:bg-[#2C6345] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                    <span>{form.method === 'cod' ? tx('Confirmer la commande', 'Confirm Order') : tx('Continuer vers le paiement', 'Continue to Payment')}</span>
                    <ArrowRight size={18} />
                </button>
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
        method: 'stripe', createAccount: false, acceptedTerms: false,
    });

    // If cart is empty, redirect to shop
    if (items.length === 0) {
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
                        </AnimatePresence>
                    </div>

                    {/* ── Right: Order Summary ── */}
                    <div className="sticky top-8">
                        <OrderSummary />
                    </div>
                </div>
            </div>
        </div>
    );
}
