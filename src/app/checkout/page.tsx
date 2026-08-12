"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ArrowRight, ArrowLeft, ChevronRight, MapPin, Phone,
    CreditCard, Lock, Truck, Package, ShoppingBag, AlertCircle, Loader2,
    Store, ChevronDown, Eye, EyeOff, CheckCircle2, UserPlus, Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice, useSiteSettings } from '@/context/SiteSettingsContext';
import { useAuth } from '@/context/AuthContext';
import { AppConfig } from '@/lib/config';
import { getProductImage, Address } from '@/types';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShippingForm {
    firstName: string; lastName: string;
    email: string; phone: string;
    address: string; city: string;
    postalCode: string;
    state: string;
}
interface BillingForm extends ShippingForm { sameAsShipping: boolean; }
interface PaymentForm {
    method: 'stripe' | 'cod' | 'store';
    acceptedTerms: boolean;
}

interface StoreLocation {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string | null;
    email: string | null;
    hours: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface ApiShippingMethod {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    estimated_days_min: number;
    estimated_days_max: number;
    type?: 'delivery' | 'pickup';
    store_location?: StoreLocation | null;
    free_shipping_threshold?: number | null;
}

const CHECKOUT_FORM_KEY = 'checkout_shipping_form';

// ─── Session persistence helpers ──────────────────────────────────────────────
function saveFormToSession(form: ShippingForm): void {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(CHECKOUT_FORM_KEY, JSON.stringify(form)); } catch { /* ignore */ }
}

function loadFormFromSession(): Partial<ShippingForm> | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(CHECKOUT_FORM_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function clearFormFromSession(): void {
    if (typeof window === 'undefined') return;
    try { sessionStorage.removeItem(CHECKOUT_FORM_KEY); } catch { /* ignore */ }
}


// ─── Sub-components ───────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = 'text', placeholder = '', required = false, className = '', error, onBlur, autoComplete }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean; className?: string;
    error?: string; onBlur?: () => void; autoComplete?: string;
}) {
    const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className={className}>
            <label htmlFor={inputId} className="block text-[9px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">{label}{required && ' *'}</label>
            <input
                id={inputId}
                type={type} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                autoComplete={autoComplete}
                className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors bg-ink/5 text-ink placeholder:text-ink/30 ${error ? 'border-red-400 focus:border-red-400 focus-visible:outline-red-400' : 'border-ink/10 focus:border-gold focus-visible:outline-gold'}`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Select({ label, value, onChange, options, className = '', required = true }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; className?: string; required?: boolean;
}) {
    const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className={className}>
            <label htmlFor={selectId} className="block text-[9px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">{label}{required ? ' *' : ''}</label>
            <div className="relative">
                <select
                    id={selectId}
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full border-2 border-ink/10 rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium focus:border-gold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-colors bg-ink/5 text-ink appearance-none cursor-pointer"
                >
                    <option value="">Select…</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/40" />
            </div>
        </div>
    );
}

function OrderSummary({ compact = false }: { compact?: boolean }) {
    const { items, subtotal, promoDiscount, shippingCost, total, vatAmount, getItemVat, appliedPromo, selectedShipping } = useCart();
    const { t } = useLanguage();
    const formatPrice = useFormatPrice();
    const { tax_label: taxLabel, tax_included_in_price: taxIncluded } = useSiteSettings();
    const [expanded, setExpanded] = useState(!compact);
    const displayTotal = total;

    return (
        <div className={`bg-sand/8 rounded-[32px] border border-sand/10 overflow-hidden text-sand ${compact ? '' : 'shadow-sm'}`}>
            <button
                onClick={() => compact && setExpanded(p => !p)}
                className={`w-full flex items-center justify-between p-6 ${compact ? 'cursor-pointer' : ''}`}
            >
                <div className="flex items-center gap-3 min-w-0 flex-shrink">
                    <ShoppingBag size={18} className="text-gold flex-shrink-0" />
                    <span className="font-black text-sm uppercase tracking-widest whitespace-nowrap">{t('orderSummary')}</span>
                    <span className="text-xs text-sand/60 whitespace-nowrap">({items.length} {t('itemsWord')})</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-sand font-bold text-1xl  whitespace-nowrap">{formatPrice(displayTotal)}</span>
                    {compact && <ChevronRight size={16} className={`text-sand/40 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />}
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-6 pb-6 space-y-3">
                            {/* Items */}
                            <div className="space-y-3 border-b border-sand/10 pb-4">
                                {items.map(item => {
                                    const name = item.product.name;
                                    const unit = item.saleUnit.name;
                                    const lineVat = getItemVat(item);
                                    return (
                                        <div key={`${item.product.id}-${item.saleUnit.id}`} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-sand/10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {getProductImage(item.product) && (
                                                    <img src={getProductImage(item.product)!} alt={name} className="w-10 h-10 object-contain" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-sand truncate">{name}</p>
                                                <p className="text-[9px] text-sand/50">{unit} × {item.quantity}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="font-bold text-sm block text-sand">{formatPrice(item.unitPrice * item.quantity)}</span>
                                                {lineVat > 0 && (
                                                    <span className="text-[9px] text-sand font-bold">
                                                        {taxIncluded ? t('inclVat') : `+ ${taxLabel || t('vatWord')}`} {formatPrice(lineVat)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pricing breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-sand/60"><span>{t('subtotal')}</span><span className="font-bold text-sand">{formatPrice(subtotal)}</span></div>
                                {promoDiscount > 0 && <div className="flex justify-between text-gold"><span>{appliedPromo?.code}</span><span className="font-bold">-{formatPrice(promoDiscount)}</span></div>}
                                <div className="flex justify-between text-sand/60">
                                    <span>{t('shipping')}{selectedShipping ? ` — ${selectedShipping.name}` : ''}</span>
                                    <span className={`font-bold ${shippingCost === 0 ? 'text-gold' : 'text-sand'}`}>{shippingCost === 0 ? t('freeLabel') : formatPrice(shippingCost)}</span>
                                </div>
                                {!taxIncluded && vatAmount > 0 && (
                                    <div className="flex justify-between text-sand/60">
                                        <span>{taxLabel || t('vatWord')}</span>
                                        <span className="font-bold text-sand">{formatPrice(vatAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center gap-3 text-sand font-black pt-2 border-t border-sand/10 text-base">
                                    <span className="flex-shrink-0">{t('total')}</span>
                                    <span className="text-sand font-bold text-1xl  whitespace-nowrap">{formatPrice(displayTotal)}</span>
                                </div>
                                {taxIncluded && vatAmount > 0 && (
                                    <div className="flex justify-between text-[11px] text-sand/50">
                                        <span>{t('inclVat')}</span>
                                        <span>{formatPrice(vatAmount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Guarantees */}
                            <div className="border-t border-sand/10 pt-4 space-y-2">
                                {[
                                    { icon: Lock, text: t('securePayment') },
                                    { icon: Package, text: t('moneyBackDesc') },
                                    { icon: MapPin, text: t('shippedFromFrance') },
                                ].map(({ icon: Icon, text }, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-sand/50">
                                        <Icon size={12} className="text-gold flex-shrink-0" />
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

// ─── Stripe Payment Form (rendered inside Elements provider) ─────────────────
function StripePaymentForm({ onSuccess, onBack, language }: {
    onSuccess: () => void;
    onBack: () => void;
    language: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useLanguage();
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
            setError(confirmError.message ?? t('paymentFailedEyebrow'));
            setIsConfirming(false);
        } else {
            onSuccess();
        }
    };

    if (!stripe) {
        return (
            <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-gold mx-auto mb-3" />
                <p className="text-sm text-ink/60">{t('loadingSecurePayment')}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <PaymentElement options={{ layout: 'tabs' }} />
            </div>
            <div className="flex items-center gap-2 mb-4 p-4 bg-ink/5 rounded-2xl border border-ink/10">
                <Lock size={16} className="text-gold flex-shrink-0" />
                <p className="text-[10px] text-ink/60 opacity-70">
                    {t('sslStripeBlurb')}
                </p>
            </div>
            {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-600 text-xs leading-snug">{error}</p>
                </div>
            )}
            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    disabled={isConfirming}
                    className="flex items-center gap-2 px-6 py-4 rounded-full border-2 border-ink/10 text-sm font-black uppercase tracking-widest text-ink/40 hover:border-ink/20 transition-colors disabled:opacity-40"
                >
                    <ArrowLeft size={16} />
                    {t('back')}
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isConfirming || !stripe || !elements}
                    className="flex-1 flex justify-between items-center px-8 py-4 bg-gold text-ink rounded-full font-black uppercase tracking-widest shadow-lg shadow-gold/25 hover:bg-[#b8914d] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                    {isConfirming ? (
                        <><Loader2 size={18} className="animate-spin" /><span>{t('loading')}</span></>
                    ) : (
                        <><span>{t('paySecurely')}</span><ArrowRight size={18} /></>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-sand rounded-[28px] border border-ink/10 p-6 sm:p-8 shadow-sm text-ink ${className}`}>
            {children}
        </div>
    );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { items, subtotal, promoDiscount, total, appliedPromo, clearCart, setShipping } = useCart();
    const { language, t } = useLanguage();
    const formatPrice = useFormatPrice();
    const router = useRouter();
    const { user, isAuthenticated, register } = useAuth();

    // ── Shipping form state ──
    const savedForm = loadFormFromSession();
    const defaultShippingForm: ShippingForm = {
        firstName:  savedForm?.firstName  ?? user?.name?.split(' ')[0] ?? '',
        lastName:   savedForm?.lastName   ?? user?.name?.split(' ').slice(1).join(' ') ?? '',
        email:      savedForm?.email      ?? user?.email ?? '',
        phone:      savedForm?.phone      ?? '',
        address:    savedForm?.address    ?? '',
        city:       savedForm?.city       ?? '',
        postalCode: savedForm?.postalCode ?? '',
        state:      savedForm?.state      ?? '',
    };

    const [shippingForm, setShippingForm] = useState<ShippingForm>(defaultShippingForm);
    const [billingForm, setBillingForm] = useState<BillingForm>({ ...defaultShippingForm, sameAsShipping: true });
    const [paymentForm, setPaymentForm] = useState<PaymentForm>({ method: 'stripe', acceptedTerms: false });

    // ── Shipping method state (lifted up from old ShippingStep) ──
    const [apiMethods, setApiMethods] = useState<ApiShippingMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<ApiShippingMethod | null>(null);
    const [methodsLoading, setMethodsLoading] = useState(true);

    // ── Pickup store state ──
    const [pickupStores, setPickupStores] = useState<StoreLocation[]>([]);
    const [selectedPickupStoreId, setSelectedPickupStoreId] = useState<number | null>(null);

    // ── Payment state ──
    const [enabledMethods, setEnabledMethods] = useState<{
        stripe: boolean; cod: boolean; pickup?: boolean;
        pickup_payment_required?: boolean;
        cod_config?: { max_order_amount: number; surcharge: number; surcharge_type: string };
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

    const isPickup = selectedMethod?.type === 'pickup';

    // ── Real-time validation state ──
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // ── Create Account (OTP flow) state ──
    const OTP_LENGTH = 6;
    const RESEND_COOLDOWN = 60;
    type AccountStep = 'form' | 'otp' | 'verified';
    const [createAccount, setCreateAccount] = useState(false);
    const [accountStep, setAccountStep] = useState<AccountStep>('form');
    const [accountPassword, setAccountPassword] = useState('');
    const [accountPasswordConfirm, setAccountPasswordConfirm] = useState('');
    const [showAccountPassword, setShowAccountPassword] = useState(false);
    const [showAccountPasswordConfirm, setShowAccountPasswordConfirm] = useState(false);
    const [accountOtpDigits, setAccountOtpDigits] = useState<string[]>(Array(6).fill(''));
    const [accountOtpError, setAccountOtpError] = useState<string | null>(null);
    const [accountError, setAccountError] = useState<string | null>(null);
    const [accountResendTimer, setAccountResendTimer] = useState(0);
    const [accountSendingOtp, setAccountSendingOtp] = useState(false);
    const [accountVerifyingOtp, setAccountVerifyingOtp] = useState(false);
    const [accountResendingOtp, setAccountResendingOtp] = useState(false);
    const [accountResendSuccess, setAccountResendSuccess] = useState(false);
    const accountOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend timer countdown
    useEffect(() => {
        if (accountResendTimer <= 0) return;
        const interval = setInterval(() => {
            setAccountResendTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [accountResendTimer]);

    const markTouched = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    // ── Compute validation errors ──
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validationErrors: Record<string, string | undefined> = {};
    if (touched['firstName'] && !shippingForm.firstName) validationErrors['firstName'] = t('requiredField');
    if (touched['lastName'] && !shippingForm.lastName) validationErrors['lastName'] = t('requiredField');
    if (touched['email']) {
        if (!shippingForm.email) validationErrors['email'] = t('requiredField');
        else if (!EMAIL_REGEX.test(shippingForm.email)) validationErrors['email'] = t('invalidEmailMsg');
    }
    if (touched['address'] && !shippingForm.address) validationErrors['address'] = t('requiredField');
    if (touched['postalCode'] && !shippingForm.postalCode) validationErrors['postalCode'] = t('requiredField');
    if (touched['city'] && !shippingForm.city) validationErrors['city'] = t('requiredField');

    // ── Password strength indicators ──
    const PASSWORD_CHECKS = [
        { label: t('authPwUpper'), test: (p: string) => /[A-Z]/.test(p) },
        { label: t('authPwNumber'), test: (p: string) => /[0-9]/.test(p) },
        { label: t('authPwMin'), test: (p: string) => p.length >= 8 },
    ];

    // ── Saved addresses (logged-in users) — pick one to fill the form ──
    const savedAddresses = user?.addresses ?? [];
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    const setShippingField = useCallback((key: keyof ShippingForm) => (v: string) => {
        // Manual edit → no longer matches a saved address, so drop the highlight.
        setSelectedAddressId(null);
        setShippingForm(prev => {
            const updated = { ...prev, [key]: v };
            saveFormToSession(updated);
            return updated;
        });
    }, []);

    const applySavedAddress = useCallback((addr: Address) => {
        setSelectedAddressId(addr.id);
        setShippingForm(prev => {
            const updated: ShippingForm = {
                ...prev,
                firstName:  addr.firstName || prev.firstName,
                lastName:   addr.lastName || prev.lastName,
                phone:      addr.phone || prev.phone,
                address:    addr.address,
                city:       addr.city,
                postalCode: addr.postalCode,
            };
            saveFormToSession(updated);
            return updated;
        });
    }, [user]);

    // ── Fetch shipping methods on mount ──
    useEffect(() => {
        setMethodsLoading(true);
        fetch(Endpoints.shippingMethods)
            .then(r => r.json())
            .then((data: ApiShippingMethod[]) => {
                const methods = Array.isArray(data) ? data : [];
                setApiMethods(methods);
                if (methods.length > 0) {
                    const first = methods[0];
                    setSelectedMethodId(first.id);
                    setSelectedMethod(first);
                    setShipping({
                        id: first.id, name: first.name, description: first.description,
                        base_price: Number(first.base_price),
                        estimated_days_min: first.estimated_days_min,
                        estimated_days_max: first.estimated_days_max,
                        free_shipping_threshold: first.free_shipping_threshold ?? null,
                    });
                    // If the pre-selected default method is a pickup method, fetch
                    // pickup stores immediately — otherwise the store picker never
                    // renders and "Continue" stays disabled forever (pickupReady
                    // can never become true).
                    if (first.type === 'pickup') {
                        fetch(Endpoints.pickupStores)
                            .then(r => r.json())
                            .then((res: { data: StoreLocation[] }) => setPickupStores(res.data ?? []))
                            .catch(() => setPickupStores([]));
                    }
                }
            })
            .catch(() => setApiMethods([]))
            .finally(() => setMethodsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch enabled payment methods ──
    useEffect(() => {
        fetch(Endpoints.paymentMethods)
            .then(r => r.json())
            .then(data => {
                setEnabledMethods(data);
                // Auto-select first valid payment method for current delivery type
                const current = paymentForm.method;
                if (isPickup) {
                    // Pickup ("Click & Collect"): default to Pay at Store unless the
                    // store explicitly requires online prepayment for pickup orders.
                    if (data.pickup_payment_required) {
                        if (current === 'cod' || current === 'store') {
                            setPaymentForm(f => ({ ...f, method: data.stripe ? 'stripe' : 'store' }));
                        }
                    } else if (current !== 'store') {
                        setPaymentForm(f => ({ ...f, method: 'store' }));
                    }
                } else {
                    // Delivery: valid options are stripe (if on) or cod (if on)
                    if (current === 'store') {
                        setPaymentForm(f => ({ ...f, method: data.stripe ? 'stripe' : data.cod ? 'cod' : 'stripe' }));
                    } else if (!data[current as 'stripe' | 'cod']) {
                        const first = data.stripe ? 'stripe' : data.cod ? 'cod' : 'stripe';
                        setPaymentForm(f => ({ ...f, method: first as 'stripe' | 'cod' | 'store' }));
                    }
                }
            })
            .catch(() => setEnabledMethods({ stripe: true, cod: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPickup]);

    const handleSelectMethod = (method: ApiShippingMethod) => {
        setSelectedMethodId(method.id);
        setSelectedMethod(method);
        setSelectedPickupStoreId(null);
        // Fetch pickup stores when pickup method selected
        if (method.type === 'pickup') {
            fetch(Endpoints.pickupStores)
                .then(r => r.json())
                .then((res: { data: StoreLocation[] }) => setPickupStores(res.data ?? []))
                .catch(() => setPickupStores([]));
        } else {
            setPickupStores([]);
        }
        setShipping({
            id: method.id, name: method.name, description: method.description,
            base_price: Number(method.base_price),
            estimated_days_min: method.estimated_days_min,
            estimated_days_max: method.estimated_days_max,
            free_shipping_threshold: method.free_shipping_threshold ?? null,
        });
        // Reset incompatible payment method
        if (method.type === 'pickup' && paymentForm.method === 'cod') {
            setPaymentForm(f => ({ ...f, method: 'stripe' }));
        } else if (method.type !== 'pickup' && paymentForm.method === 'store') {
            setPaymentForm(f => ({ ...f, method: 'stripe' }));
        }
    };

    // ── Payment methods available ──
    // Delivery → Stripe + COD (if enabled)
    // Pickup   → Stripe + Pay in Store (unless admin requires online payment)
    const pickupPaymentRequired = enabledMethods?.pickup_payment_required ?? false;
    const paymentMethods: { id: 'stripe' | 'cod' | 'store'; label: string; icon: typeof CreditCard }[] = (() => {
        const methods: { id: 'stripe' | 'cod' | 'store'; label: string; icon: typeof CreditCard }[] = [];
        // Stripe if enabled
        if (enabledMethods?.stripe) {
            methods.push({ id: 'stripe', label: t('digitalWallet'), icon: CreditCard });
        }
        if (isPickup) {
            // Pickup: offer "Pay in Store" unless admin requires online payment
            if (!pickupPaymentRequired) {
                methods.push({ id: 'store', label: t('accountPaymentStore'), icon: Store });
            }
        } else {
            // Delivery: offer COD if enabled
            if (enabledMethods?.cod) {
                methods.push({ id: 'cod', label: t('cashOnDelivery'), icon: Truck });
            }
        }
        return methods;
    })();

    // ── buildPayload ──
    const buildPayload = useCallback(() => {
        const shippingAddress = {
            first_name: shippingForm.firstName,
            last_name:  shippingForm.lastName,
            line_1:     shippingForm.address,
            city:       shippingForm.city,
            zip:        shippingForm.postalCode,
            country:    'FR',
            phone:      shippingForm.phone || undefined,
            state:      shippingForm.state || undefined,
        };
        const billingAddress = billingForm.sameAsShipping ? undefined : {
            first_name: billingForm.firstName,
            last_name:  billingForm.lastName,
            line_1:     billingForm.address,
            city:       billingForm.city,
            zip:        billingForm.postalCode,
            country:    'FR',
            phone:      billingForm.phone || undefined,
        };
        return {
            shipping_address: shippingAddress,
            billing_address: billingAddress,
            shipping_method_id: selectedMethodId ?? 0,
            pickup_store_id: selectedPickupStoreId || undefined,
            promotion_code: appliedPromo?.code || undefined,
            payment_method: paymentForm.method === 'store' ? 'cod' : paymentForm.method,
            email: shippingForm.email,
            phone: shippingForm.phone || undefined,
        };
    }, [shippingForm, billingForm, selectedMethodId, selectedPickupStoreId, appliedPromo, paymentForm.method]);

    // ── Validation ──
    const pickupReady = !isPickup || selectedPickupStoreId !== null;
    const billingValid = billingForm.sameAsShipping || !!(
        billingForm.firstName && billingForm.lastName &&
        billingForm.address && billingForm.city &&
        billingForm.postalCode
    );
    const isFormValid = !!(
        shippingForm.firstName && shippingForm.lastName &&
        shippingForm.email && shippingForm.address &&
        shippingForm.city && shippingForm.postalCode &&
        selectedMethodId &&
        pickupReady && paymentForm.acceptedTerms && billingValid
    );
    const canSubmit = isFormValid && paymentMethods.length > 0;

    // ── Handlers ──
    const { syncCartToBackend } = useCart();

    // ── Create Account OTP handlers ──
    const handleAccountSendOtp = async () => {
        setAccountError(null);
        setAccountSendingOtp(true);
        const fullName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
        try {
            await apiClient.post(Endpoints.sendOtp, { email: shippingForm.email, name: fullName, locale: (['en', 'fr', 'ar'].includes(language) ? language : 'fr') });
            setAccountStep('otp');
            setAccountResendTimer(RESEND_COOLDOWN);
            setTimeout(() => accountOtpRefs.current[0]?.focus(), 100);
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr.status === 422 && (apiErr as ApiError & { email_exists?: boolean }).email_exists) {
                setAccountError(t('authEmailRegistered'));
            } else {
                setAccountError(apiErr.message ?? t('authSendError'));
            }
        } finally {
            setAccountSendingOtp(false);
        }
    };

    const handleAccountOtpDigitChange = useCallback((index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        setAccountOtpDigits(prev => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        setAccountOtpError(null);
        if (digit && index < OTP_LENGTH - 1) {
            accountOtpRefs.current[index + 1]?.focus();
        }
    }, [OTP_LENGTH]);

    const handleAccountOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !accountOtpDigits[index] && index > 0) {
            accountOtpRefs.current[index - 1]?.focus();
        }
    }, [accountOtpDigits]);

    const handleAccountOtpPaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pasted.length > 0) {
            const newDigits = Array(OTP_LENGTH).fill('');
            for (let i = 0; i < pasted.length; i++) {
                newDigits[i] = pasted[i];
            }
            setAccountOtpDigits(newDigits);
            setAccountOtpError(null);
            const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
            accountOtpRefs.current[focusIndex]?.focus();
        }
    }, [OTP_LENGTH]);

    const handleAccountVerifyOtp = async () => {
        const otpCode = accountOtpDigits.join('');
        if (otpCode.length !== OTP_LENGTH) return;
        setAccountVerifyingOtp(true);
        setAccountOtpError(null);
        try {
            const res = await apiClient.post<{ message: string; verification_token: string }>(
                Endpoints.verifyOtp, { email: shippingForm.email, otp: otpCode }
            );
            setAccountStep('verified');
            // Auto-register
            const fullName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
            await register(fullName, shippingForm.email, accountPassword, accountPasswordConfirm, shippingForm.phone || undefined, res.verification_token);
        } catch (err) {
            const apiErr = err as ApiError;
            setAccountOtpError(apiErr.message ?? t('authOtpError'));
        } finally {
            setAccountVerifyingOtp(false);
        }
    };

    const handleAccountResendOtp = async () => {
        if (accountResendTimer > 0 || accountResendingOtp) return;
        setAccountResendingOtp(true);
        setAccountOtpError(null);
        setAccountResendSuccess(false);
        const fullName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
        try {
            await apiClient.post(Endpoints.resendOtp, { email: shippingForm.email, name: fullName, locale: (['en', 'fr', 'ar'].includes(language) ? language : 'fr') });
            setAccountResendTimer(RESEND_COOLDOWN);
            setAccountResendSuccess(true);
            setAccountOtpDigits(Array(OTP_LENGTH).fill(''));
            accountOtpRefs.current[0]?.focus();
        } catch (err) {
            const apiErr = err as ApiError;
            setAccountOtpError(apiErr.message ?? t('authResendError'));
        } finally {
            setAccountResendingOtp(false);
        }
    };

    const accountOtpComplete = accountOtpDigits.join('').length === OTP_LENGTH;
    const canSendAccountOtp = !!(accountPassword && accountPasswordConfirm && accountPassword === accountPasswordConfirm && accountPassword.length >= 8 && /[A-Z]/.test(accountPassword) && /[0-9]/.test(accountPassword));

    const handleContinueToStripe = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            await syncCartToBackend();
            const res = await apiClient.post<{ order_id: number; grand_total: number; client_secret: string }>(
                Endpoints.placeOrder,
                buildPayload(),
            );
            setClientSecret(res.client_secret);
            setPendingOrderId(res.order_id);
        } catch (err) {
            setError((err as ApiError).message ?? t('authGenericError'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            await syncCartToBackend();
            const res = await apiClient.post<{ order_id: number; grand_total: number }>(
                Endpoints.placeOrder,
                buildPayload(),
            );
            clearFormFromSession();
            clearCart();
            router.push(`/order-success?order=${res.order_id}&payment=${paymentForm.method}&total=${total.toFixed(2)}&email=${encodeURIComponent(shippingForm.email)}`);
        } catch (err) {
            setError((err as ApiError).message ?? t('authGenericError'));
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Empty cart guard ──
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-sand grain-overlay gap-6 px-4 sm:px-6">
                <ShoppingBag size={48} className="text-cocoa" />
                <h1 className="font-display text-4xl uppercase text-sand">{t('cartEmpty')}</h1>
                <p className="text-cocoa">{t('cartEmptyDesc')}</p>
                <Link href="/shop" className="bg-gold text-ink px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-lg hover:bg-[#b8914d] transition-colors">
                    {t('continueShopping')}
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-ink text-sand min-h-screen grain-overlay">
            {/* ── Header ── */}
            <div className="bg-ink border-b border-sand/10 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between relative z-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cocoa hover:text-gold transition-colors">
                    <ArrowLeft size={14} />
                    {t('back')}
                </button>
                <span className="font-display text-xl uppercase text-sand">{AppConfig.brand.name}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-cocoa font-bold">
                    <Lock size={11} className="text-gold" />
                    {t('secureCheckoutTitle')}
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

                    {/* ── Left column: stacked section cards ── */}
                    <div className="space-y-6">

                        {/* ── Section 1: Shipping Address ── */}
                        <SectionCard>
                            {/* No exact "Shipping Address" key exists — closest is checkoutStepShipping ("Shipping"/"Livraison"). */}
                            <h2 className="font-display text-xl uppercase mb-4">{t('checkoutStepShipping')}</h2>

                            {/* Saved addresses — pick one to autofill (logged-in users) */}
                            {isAuthenticated && savedAddresses.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-2.5">
                                        {t('savedAddressesLabel')}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {savedAddresses.map(addr => {
                                            const active = selectedAddressId === addr.id;
                                            return (
                                                <button
                                                    key={addr.id}
                                                    type="button"
                                                    onClick={() => applySavedAddress(addr)}
                                                    className={`text-left p-3.5 rounded-2xl border-2 transition-all ${active ? 'border-gold bg-gold/10' : 'border-ink/10 hover:border-ink/20 bg-ink/5'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-ink">{addr.label}</span>
                                                        {addr.isDefault && (
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-1.5 py-0.5 rounded-full">
                                                                {t('accountDefault')}
                                                            </span>
                                                        )}
                                                        {active && <Check size={13} className="text-gold ml-auto" />}
                                                    </div>
                                                    <p className="text-xs font-bold text-ink truncate">{addr.firstName} {addr.lastName}</p>
                                                    <p className="text-[11px] text-ink/60 leading-snug">{addr.address}, {addr.postalCode} {addr.city}</p>
                                                    {addr.phone && <p className="text-[11px] text-ink/50 mt-0.5">{addr.phone}</p>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-ink/50 mt-2.5">{t('enterNewAddressBelow')}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input label={t('firstName')} value={shippingForm.firstName} onChange={setShippingField('firstName')} required onBlur={() => markTouched('firstName')} error={validationErrors['firstName']} autoComplete="given-name" />
                                <Input label={t('lastName')} value={shippingForm.lastName} onChange={setShippingField('lastName')} required onBlur={() => markTouched('lastName')} error={validationErrors['lastName']} autoComplete="family-name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input label={t('email')} value={shippingForm.email} onChange={setShippingField('email')} type="email" required onBlur={() => markTouched('email')} error={validationErrors['email']} autoComplete="email" />
                                <Input label={t('phone')} value={shippingForm.phone} onChange={setShippingField('phone')} type="tel" placeholder="+33 6 00 00 00 00" autoComplete="tel" />
                            </div>
                            <Input label={t('address')} value={shippingForm.address} onChange={setShippingField('address')} placeholder="16 Boulevard du Général de Gaulle" required className="mb-4" onBlur={() => markTouched('address')} error={validationErrors['address']} autoComplete="street-address" />
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Input label={t('postalCode')} value={shippingForm.postalCode} onChange={setShippingField('postalCode')} placeholder="75001" required onBlur={() => markTouched('postalCode')} error={validationErrors['postalCode']} autoComplete="postal-code" />
                                <Input label={t('city')} value={shippingForm.city} onChange={setShippingField('city')} placeholder="Paris" required className="col-span-2" onBlur={() => markTouched('city')} error={validationErrors['city']} autoComplete="address-level2" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-ink/60 mb-1.5">{t('country')}</label>
                                <div className="px-4 py-3 bg-ink/5 rounded-xl text-sm text-ink font-medium">{t('countryFrance')}</div>
                            </div>
                        </SectionCard>

                        {/* ── Create Account (guests only, above delivery) ── */}
                        {!isAuthenticated && (
                            <SectionCard>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => { setCreateAccount(v => !v); setAccountStep('form'); setAccountError(null); setAccountOtpError(null); }}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${createAccount ? 'bg-gold border-gold' : 'border-ink/20 group-hover:border-gold/50'}`}
                                    >
                                        {createAccount && <Check size={12} className="text-ink" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={14} className={createAccount ? 'text-gold' : 'text-ink/40'} />
                                        {/* No exact match — closest existing key is authCreateAccount ("Create Account"). */}
                                        <span className="text-sm font-bold text-ink/70">{t('authCreateAccount')}</span>
                                    </div>
                                </label>

                                <AnimatePresence>
                                    {createAccount && (
                                        <motion.div
                                            key="create-account-fields"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            {accountStep === 'verified' ? (
                                                /* ── Verified: gold badge ── */
                                                <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-gold/10 border-2 border-gold/20">
                                                    <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 size={20} className="text-gold" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gold">{t('emailVerifiedBadge')}</p>
                                                        <p className="text-[10px] text-ink/60">{t('accountCreatedSuccess')}</p>
                                                    </div>
                                                </div>
                                            ) : accountStep === 'otp' ? (
                                                /* ── OTP step: inline 6-digit input ── */
                                                <div className="mt-4 space-y-4">
                                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-ink/5 border border-ink/10">
                                                        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                                            <Mail size={18} className="text-gold" />
                                                        </div>
                                                        <div>
                                                            {/* Closest existing keys used (not exact wording): authVerifyEmail, authOtpSubtitle. */}
                                                            <p className="font-bold text-sm text-ink">{t('authVerifyEmail')}</p>
                                                            <p className="text-[10px] text-ink/50">
                                                                {t('authOtpSubtitle')} <span className="font-bold text-ink/70">{shippingForm.email}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* OTP error */}
                                                    {accountOtpError && (
                                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                            <span>{accountOtpError}</span>
                                                        </motion.div>
                                                    )}

                                                    {/* Resend success */}
                                                    {accountResendSuccess && !accountOtpError && (
                                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-start gap-3 p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs">
                                                            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                                            <span>{t('authCodeSent')}</span>
                                                        </motion.div>
                                                    )}

                                                    {/* 6-digit OTP inputs */}
                                                    <div className="flex justify-center gap-2.5" onPaste={handleAccountOtpPaste}>
                                                        {accountOtpDigits.map((digit, i) => (
                                                            <input
                                                                key={i}
                                                                ref={el => { accountOtpRefs.current[i] = el; }}
                                                                type="text"
                                                                inputMode="numeric"
                                                                autoComplete="one-time-code"
                                                                maxLength={1}
                                                                value={digit}
                                                                onChange={e => handleAccountOtpDigitChange(i, e.target.value)}
                                                                onKeyDown={e => handleAccountOtpKeyDown(i, e)}
                                                                className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 transition-all outline-none
                                                                    ${digit ? 'border-gold bg-gold/10' : 'border-ink/15 bg-ink/5'}
                                                                    focus:border-gold focus:ring-2 focus:ring-gold/20 focus:bg-ink/5`}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Verify button */}
                                                    <button
                                                        onClick={handleAccountVerifyOtp}
                                                        disabled={!accountOtpComplete || accountVerifyingOtp}
                                                        className="w-full bg-gold text-ink rounded-2xl py-3.5 font-black uppercase tracking-widest text-[10px] hover:bg-[#b8914d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {accountVerifyingOtp ? <Loader2 size={16} className="animate-spin" /> : t('authVerifyCreate')}
                                                    </button>

                                                    {/* Resend / timer */}
                                                    <div className="text-center">
                                                        <p className="text-xs text-ink/60 mb-1">{t('authDidntReceive')}</p>
                                                        {accountResendTimer > 0 ? (
                                                            <p className="text-xs text-ink/50">
                                                                {t('authResendIn')} <span className="font-bold text-ink/70">{accountResendTimer}s</span>
                                                            </p>
                                                        ) : (
                                                            <button
                                                                onClick={handleAccountResendOtp}
                                                                disabled={accountResendingOtp}
                                                                className="text-xs font-bold text-gold hover:underline disabled:opacity-60"
                                                            >
                                                                {accountResendingOtp ? t('authSending') : t('authResendCode')}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Back to password form */}
                                                    <button
                                                        onClick={() => { setAccountStep('form'); setAccountOtpError(null); setAccountResendSuccess(false); setAccountOtpDigits(Array(OTP_LENGTH).fill('')); }}
                                                        className="w-full text-center text-[10px] text-ink/50 hover:text-ink/70 transition-colors"
                                                    >
                                                        {t('authBackToForm')}
                                                    </button>
                                                </div>
                                            ) : (
                                                /* ── Step 1: password fields + send OTP button ── */
                                                <div className="mt-4 space-y-4">
                                                    {/* Account error */}
                                                    {accountError && (
                                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                            <span>{accountError}</span>
                                                        </motion.div>
                                                    )}

                                                    <div>
                                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">{t('authPassword')} *</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showAccountPassword ? 'text' : 'password'}
                                                                value={accountPassword}
                                                                onChange={e => setAccountPassword(e.target.value)}
                                                                autoComplete="new-password"
                                                                placeholder={t('authPwMin')}
                                                                className={`w-full border-2 rounded-2xl px-4 py-3.5 pr-11 text-sm font-medium focus:outline-none transition-colors bg-ink/5 text-ink placeholder:text-ink/30 border-ink/10 focus:border-gold`}
                                                            />
                                                            <button type="button" tabIndex={-1} onClick={() => setShowAccountPassword(v => !v)}
                                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink/40 hover:text-gold">
                                                                {showAccountPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                        {accountPassword.length > 0 && (
                                                            <ul className="mt-2 space-y-1">
                                                                {PASSWORD_CHECKS.map(rule => {
                                                                    const ok = rule.test(accountPassword);
                                                                    return (
                                                                        <li key={rule.label} className={`flex items-center gap-2 text-xs ${ok ? 'text-gold' : 'text-ink/40'}`}>
                                                                            <CheckCircle2 size={12} className={ok ? 'opacity-100' : 'opacity-30'} /> {rule.label}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">{t('authConfirmPassword')} *</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showAccountPasswordConfirm ? 'text' : 'password'}
                                                                value={accountPasswordConfirm}
                                                                onChange={e => setAccountPasswordConfirm(e.target.value)}
                                                                autoComplete="new-password"
                                                                placeholder={t('repeatPasswordPlaceholder')}
                                                                className={`w-full border-2 rounded-2xl px-4 py-3.5 pr-11 text-sm font-medium focus:outline-none transition-colors bg-ink/5 text-ink placeholder:text-ink/30 ${accountPasswordConfirm && accountPasswordConfirm !== accountPassword ? 'border-red-400' : 'border-ink/10 focus:border-gold'}`}
                                                            />
                                                            <button type="button" tabIndex={-1} onClick={() => setShowAccountPasswordConfirm(v => !v)}
                                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink/40 hover:text-gold">
                                                                {showAccountPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                        {accountPasswordConfirm && accountPasswordConfirm !== accountPassword && (
                                                            <p className="mt-1 text-xs text-red-500">{t('authPasswordsMismatch')}</p>
                                                        )}
                                                    </div>

                                                    {/* Send Verification Code button */}
                                                    <button
                                                        onClick={handleAccountSendOtp}
                                                        disabled={!canSendAccountOtp || accountSendingOtp || !shippingForm.email || !shippingForm.firstName}
                                                        className="w-full bg-gold text-ink rounded-2xl py-3.5 font-black uppercase tracking-widest text-[10px] hover:bg-[#b8914d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {accountSendingOtp ? <Loader2 size={16} className="animate-spin" /> : t('authSendCode')}
                                                    </button>

                                                    {!shippingForm.email && (
                                                        <p className="text-[10px] text-ink/50 text-center">{t('fillEmailAboveMsg')}</p>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </SectionCard>
                        )}

                        {/* ── Section 2: Delivery Method ── */}
                        <SectionCard>
                            <h2 className="font-display text-xl uppercase mb-4">{t('shippingMethod')}</h2>
                            {methodsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-16 rounded-2xl bg-ink/5 animate-pulse" />
                                    <div className="h-16 rounded-2xl bg-ink/5 animate-pulse opacity-60" />
                                </div>
                            ) : apiMethods.length === 0 ? (
                                <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                    <AlertCircle size={15} /> {t('noDeliveryMethodsMsg')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {apiMethods.map(method => {
                                        const isSelected = selectedMethodId === method.id;
                                        const isPickupMethod = method.type === 'pickup';
                                        const MethodIcon = isPickupMethod ? Store : Truck;
                                        // Free-shipping threshold applies per method regardless of which one is
                                        // currently selected — otherwise this list keeps showing e.g. "€5.99" for
                                        // Standard Shipping even though the order total already qualifies it for free.
                                        const methodFreeThreshold = method.free_shipping_threshold ?? null;
                                        const isMethodFree = Number(method.base_price) === 0
                                            || (methodFreeThreshold !== null && (subtotal - promoDiscount) >= methodFreeThreshold);
                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => handleSelectMethod(method)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-gold bg-gold/10' : 'border-ink/10 hover:border-ink/20 bg-ink/5'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-gold/15' : 'bg-ink/5'}`}>
                                                        <MethodIcon size={16} className={isSelected ? 'text-gold' : 'text-ink/40'} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-ink">{method.name}</p>
                                                        {isPickupMethod
                                                            ? <p className="text-[10px] text-gold font-bold uppercase tracking-wider">{t('clickAndCollectLabel')}</p>
                                                            : <p className="text-[10px] text-ink/50">{method.estimated_days_min}–{method.estimated_days_max} {t('businessDaysWord')}</p>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black text-base ${isSelected ? 'text-gold' : 'text-ink'}`}>
                                                        {isMethodFree
                                                            ? t('freeLabel')
                                                            : formatPrice(Number(method.base_price))}
                                                    </span>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-gold' : 'border-ink/30'}`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-gold" />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── Pickup store picker ── */}
                            <AnimatePresence>
                                {isPickup && pickupStores.length > 0 && (
                                    <motion.div
                                        key="pickup-stores"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-5"
                                    >
                                        <div className="border-2 border-gold/20 bg-gold/10 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Store size={16} className="text-gold" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gold">
                                                    {t('choosePickupStoreHeading')}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                {pickupStores.map(store => {
                                                    const isStoreSelected = selectedPickupStoreId === store.id;
                                                    return (
                                                        <button
                                                            key={store.id}
                                                            type="button"
                                                            onClick={() => setSelectedPickupStoreId(store.id)}
                                                            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${isStoreSelected ? 'border-gold bg-sand shadow-sm' : 'border-transparent bg-sand/50 hover:bg-sand hover:border-ink/10'}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isStoreSelected ? 'bg-gold/15' : 'bg-ink/5'}`}>
                                                                <MapPin size={14} className={isStoreSelected ? 'text-gold' : 'text-ink/40'} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-bold text-sm ${isStoreSelected ? 'text-ink' : 'text-ink/70'}`}>{store.name}</p>
                                                                <p className="text-[10px] text-ink/50 mt-0.5">{store.address}, {store.city}</p>
                                                                {store.hours && <p className="text-[10px] text-ink/50">{store.hours}</p>}
                                                                {store.phone && (
                                                                    <p className="text-[10px] text-ink/50 flex items-center gap-1 mt-0.5">
                                                                        <Phone size={10} /> {store.phone}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${isStoreSelected ? 'border-gold' : 'border-ink/20'}`}>
                                                                {isStoreSelected && <div className="w-2 h-2 rounded-full bg-gold" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </SectionCard>

                        {/* ── Section 3: Billing Address ── */}
                        <SectionCard>
                            {/* No exact "Billing Address" key exists — closest is checkoutStepBilling ("Billing"/"Facturation"). */}
                            <h2 className="font-display text-xl uppercase mb-4">{t('checkoutStepBilling')}</h2>

                            {/* Same as shipping checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${billingForm.sameAsShipping ? 'bg-gold border-gold' : 'border-ink/20 group-hover:border-gold/50'}`}
                                    onClick={() => setBillingForm(b => ({ ...b, sameAsShipping: !b.sameAsShipping }))}
                                >
                                    {billingForm.sameAsShipping && <Check size={12} className="text-ink" />}
                                </div>
                                <span className="text-sm font-bold text-ink/70">{t('sameAsShipping')}</span>
                            </label>

                            {/* Billing form fields — only shown when sameAsShipping is false */}
                            <AnimatePresence>
                                {!billingForm.sameAsShipping && (
                                    <motion.div
                                        key="billing-fields"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label={t('firstName')}
                                                    value={billingForm.firstName}
                                                    onChange={v => setBillingForm(b => ({ ...b, firstName: v }))}
                                                    required
                                                />
                                                <Input
                                                    label={t('lastName')}
                                                    value={billingForm.lastName}
                                                    onChange={v => setBillingForm(b => ({ ...b, lastName: v }))}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                label={t('address')}
                                                value={billingForm.address}
                                                onChange={v => setBillingForm(b => ({ ...b, address: v }))}
                                                placeholder="16 Boulevard du Général de Gaulle"
                                                required
                                            />
                                            <div className="grid grid-cols-3 gap-4">
                                                <Input
                                                    label={t('postalCode')}
                                                    value={billingForm.postalCode}
                                                    onChange={v => setBillingForm(b => ({ ...b, postalCode: v }))}
                                                    placeholder="75001"
                                                    required
                                                />
                                                <Input
                                                    label={t('city')}
                                                    value={billingForm.city}
                                                    onChange={v => setBillingForm(b => ({ ...b, city: v }))}
                                                    placeholder="Paris"
                                                    required
                                                    className="col-span-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-ink/60 mb-1.5">{t('country')}</label>
                                                <div className="px-4 py-3 bg-ink/5 rounded-xl text-sm text-ink font-medium">{t('countryFrance')}</div>
                                            </div>
                                            <Input
                                                label={t('phone')}
                                                value={billingForm.phone}
                                                onChange={v => setBillingForm(b => ({ ...b, phone: v }))}
                                                type="tel"
                                                placeholder="+33 6 00 00 00 00"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </SectionCard>

                        {/* ── Section 4: Payment Method ── */}
                        <SectionCard className="relative">
                            {/* Processing overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 z-50 bg-sand/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-[28px]">
                                    <Loader2 size={32} className="animate-spin text-gold mb-4" />
                                    <p className="font-display text-xl uppercase tracking-widest text-ink">{t('preparingMsg')}</p>
                                </div>
                            )}

                            {/* Stripe Elements phase */}
                            {clientSecret && pendingOrderId ? (
                                <div>
                                    <h2 className="font-display text-xl uppercase mb-2">{t('securePayment')}</h2>
                                    <p className="text-[10px] text-ink/50 uppercase tracking-widest mb-6">
                                        {t('orderWord')} #{pendingOrderId}
                                    </p>
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'stripe',
                                                variables: {
                                                    colorPrimary: '#C9A05A',
                                                    borderRadius: '16px',
                                                    fontFamily: 'system-ui, sans-serif',
                                                },
                                            },
                                        }}
                                    >
                                        <StripePaymentForm
                                            language={language}
                                            onBack={() => { setClientSecret(null); setPendingOrderId(null); }}
                                            onSuccess={async () => {
                                                clearFormFromSession();
                                                clearCart();
                                                router.push(`/order-success?order=${pendingOrderId}&payment=stripe&total=${total.toFixed(2)}&email=${encodeURIComponent(shippingForm.email)}`);
                                            }}
                                        />
                                    </Elements>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="font-display text-xl uppercase mb-4">{t('paymentMethod')}</h2>

                                    {/* No payment methods warning */}
                                    {paymentMethods.length === 0 && (
                                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6">
                                            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                            <p className="text-sm text-red-600">{t('noPaymentMethodsMsg')}</p>
                                        </div>
                                    )}

                                    {/* Method selector */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                        {paymentMethods.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setPaymentForm(f => ({ ...f, method: m.id }))}
                                                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 ${paymentForm.method === m.id ? 'border-gold bg-gold/10' : 'border-ink/10 hover:border-ink/20 bg-ink/5'}`}
                                            >
                                                <m.icon size={22} className={paymentForm.method === m.id ? 'text-gold' : 'text-ink/30'} />
                                                <span className={`text-[10px] font-black uppercase tracking-wider text-center ${paymentForm.method === m.id ? 'text-gold' : 'text-ink/60'}`}>{m.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Method details */}
                                    <AnimatePresence mode="wait">
                                        {paymentForm.method === 'stripe' && (
                                            <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
                                                <div className="bg-ink/5 border border-ink/10 rounded-3xl p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 bg-sand rounded-xl flex items-center justify-center shadow-sm">
                                                            <CreditCard size={20} className="text-gold" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-ink">{t('payWithStripeTitle')}</p>
                                                            <p className="text-[10px] text-ink/50">{t('stripeMethodsDesc')}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-ink/60">{t('stripeCardDataDesc')}</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentForm.method === 'store' && (
                                            <motion.div key="store" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
                                                <div className="bg-gold/10 border border-gold/20 rounded-3xl p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-sand rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-gold">
                                                            <Store size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-display text-lg uppercase mb-1 text-ink">{t('accountPaymentStore')}</h3>
                                                            <p className="text-sm text-ink/60 mb-3">{t('payInStoreDesc')}</p>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gold/80 uppercase">
                                                                <Check size={12} /> {t('cardCashAcceptedMsg')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentForm.method === 'cod' && (
                                            <motion.div key="cod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
                                                <div className="bg-orange-50/50 border border-orange-200 rounded-3xl p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-sand rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-orange-600">
                                                            <Truck size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-display text-lg uppercase mb-1 text-ink">{t('cashOnDelivery')}</h3>
                                                            <p className="text-sm text-ink/60 mb-3">{t('codInstructions')}</p>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-700/70 uppercase">
                                                                <Check size={12} /> {t('contactlessExchangeMsg')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Terms & Conditions */}
                                    <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                                        <div
                                            onClick={() => setPaymentForm(f => ({ ...f, acceptedTerms: !f.acceptedTerms }))}
                                            className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${paymentForm.acceptedTerms ? 'bg-gold border-gold' : 'border-ink/20 group-hover:border-gold/50'}`}
                                        >
                                            {paymentForm.acceptedTerms && <Check size={12} className="text-ink" />}
                                        </div>
                                        <span className="text-xs text-ink/60 leading-relaxed">
                                            {t('acceptTermsPrefix')}
                                            <Link href="/terms" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="underline hover:text-gold">{t('termsConditionsLink')}</Link>
                                            {t('acceptTermsAnd')}
                                            <Link href="/privacy" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="underline hover:text-gold">{t('footerPrivacy')}</Link>.
                                        </span>
                                    </label>

                                    {/* Error */}
                                    {error && (
                                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
                                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-red-600 text-xs leading-snug">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        onClick={(paymentForm.method === 'cod' || paymentForm.method === 'store') ? handlePlaceOrder : handleContinueToStripe}
                                        disabled={!canSubmit || isProcessing}
                                        className="w-full flex justify-between items-center px-8 py-5 bg-gold text-ink rounded-full font-black uppercase tracking-widest shadow-lg shadow-gold/25 hover:bg-[#b8914d] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span>
                                            {(paymentForm.method === 'cod' || paymentForm.method === 'store')
                                                ? t('placeOrder')
                                                : t('continueToSecurePayment')
                                            }
                                        </span>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* ── Right column: sticky order summary ── */}
                    <div className="sticky top-[calc(var(--header-h,112px)+16px)]">
                        <OrderSummary />
                    </div>
                </div>
            </div>
        </div>
    );
}
