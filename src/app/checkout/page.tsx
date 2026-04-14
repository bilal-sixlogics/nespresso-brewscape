"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ArrowRight, ArrowLeft, ChevronRight, MapPin, Phone,
    CreditCard, Lock, Truck, Package, ShoppingBag, AlertCircle, Loader2,
    Store, ChevronDown, Eye, EyeOff, CheckCircle2, UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice } from '@/context/SiteSettingsContext';
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
    postalCode: string;
    state: string;
}
interface BillingForm extends ShippingForm { sameAsShipping: boolean; }
interface PaymentForm {
    method: 'stripe' | 'cod' | 'store';
    createAccount: boolean;
    password: string;
    passwordConfirm: string;
    accountPhone: string;
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
            <label htmlFor={inputId} className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}{required && ' *'}</label>
            <input
                id={inputId}
                type={type} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                autoComplete={autoComplete}
                className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors bg-white placeholder:text-gray-300 ${error ? 'border-red-500 focus:border-red-500 focus-visible:outline-red-500' : 'border-gray-100 focus:border-sb-green focus-visible:outline-sb-green'}`}
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
            <label htmlFor={selectId} className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}{required ? ' *' : ''}</label>
            <div className="relative">
                <select
                    id={selectId}
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium focus:border-sb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-green transition-colors bg-white text-gray-700 appearance-none cursor-pointer"
                >
                    <option value="">Select…</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        </div>
    );
}

function OrderSummary({ compact = false }: { compact?: boolean }) {
    const { items, subtotal, promoDiscount, shippingCost, total, appliedPromo, selectedShipping } = useCart();
    const { language } = useLanguage();
    const formatPrice = useFormatPrice();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [expanded, setExpanded] = useState(!compact);
    const displayTotal = total;

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
                    <span className="font-display text-2xl text-sb-green">{formatPrice(displayTotal)}</span>
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
                                                {getProductImage(item.product) && (
                                                    <img src={getProductImage(item.product)!} alt={name} className="w-10 h-10 object-contain" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-sb-black truncate">{name}</p>
                                                <p className="text-[9px] text-gray-400">{unit} × {item.quantity}</p>
                                            </div>
                                            <span className="font-bold text-sm">{formatPrice(item.unitPrice * item.quantity)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pricing breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500"><span>{tx('Sous-total', 'Subtotal')}</span><span className="font-bold">{formatPrice(subtotal)}</span></div>
                                {promoDiscount > 0 && <div className="flex justify-between text-sb-green"><span>{appliedPromo?.code}</span><span className="font-bold">-{formatPrice(promoDiscount)}</span></div>}
                                <div className="flex justify-between text-gray-500">
                                    <span>{tx('Livraison', 'Shipping')}{selectedShipping ? ` — ${selectedShipping.name}` : ''}</span>
                                    <span className={`font-bold ${shippingCost === 0 ? 'text-sb-green' : ''}`}>{shippingCost === 0 ? tx('Gratuite', 'Free') : formatPrice(shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-sb-black font-black pt-2 border-t border-gray-100 text-base">
                                    <span>Total</span>
                                    <span className="font-display text-2xl text-sb-green">{formatPrice(displayTotal)}</span>
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

    if (!stripe) {
        return (
            <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-sb-green mx-auto mb-3" />
                <p className="text-sm text-gray-500">{tx('Chargement du paiement sécurisé...', 'Loading secure payment...')}</p>
            </div>
        );
    }

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

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { items, total, appliedPromo, clearCart, setShipping } = useCart();
    const { language } = useLanguage();
    const formatPrice = useFormatPrice();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
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
    const [paymentForm, setPaymentForm] = useState<PaymentForm>({ method: 'stripe', createAccount: false, password: '', passwordConfirm: '', accountPhone: '', acceptedTerms: false });

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
    const [showAccountPassword, setShowAccountPassword] = useState(false);
    const [showAccountPasswordConfirm, setShowAccountPasswordConfirm] = useState(false);

    const markTouched = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    // ── Compute validation errors ──
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validationErrors: Record<string, string | undefined> = {};
    if (touched['firstName'] && !shippingForm.firstName) validationErrors['firstName'] = 'Required';
    if (touched['lastName'] && !shippingForm.lastName) validationErrors['lastName'] = 'Required';
    if (touched['email']) {
        if (!shippingForm.email) validationErrors['email'] = 'Required';
        else if (!EMAIL_REGEX.test(shippingForm.email)) validationErrors['email'] = 'Invalid email';
    }
    if (touched['address'] && !shippingForm.address) validationErrors['address'] = 'Required';
    if (touched['postalCode'] && !shippingForm.postalCode) validationErrors['postalCode'] = 'Required';
    if (touched['city'] && !shippingForm.city) validationErrors['city'] = 'Required';
    if (paymentForm.createAccount && !isAuthenticated) {
        if (touched['accountPassword']) {
            if (!paymentForm.password) validationErrors['accountPassword'] = 'Required';
            else if (paymentForm.password.length < 8) validationErrors['accountPassword'] = 'Min 8 characters';
        }
        if (touched['accountPasswordConfirm']) {
            if (!paymentForm.passwordConfirm) validationErrors['accountPasswordConfirm'] = 'Required';
            else if (paymentForm.passwordConfirm !== paymentForm.password) validationErrors['accountPasswordConfirm'] = 'Passwords don\'t match';
        }
    }

    // ── Password strength indicators ──
    const PASSWORD_CHECKS = [
        { label: 'Has uppercase', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Has a number', test: (p: string) => /[0-9]/.test(p) },
        { label: 'Min 8 characters', test: (p: string) => p.length >= 8 },
    ];

    const setShippingField = useCallback((key: keyof ShippingForm) => (v: string) => {
        setShippingForm(prev => {
            const updated = { ...prev, [key]: v };
            saveFormToSession(updated);
            return updated;
        });
    }, []);

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
                        free_shipping_threshold: null,
                    });
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
                    // Pickup: valid options are stripe (if on) or store (if allowed)
                    if (current === 'cod') {
                        setPaymentForm(f => ({ ...f, method: data.stripe ? 'stripe' : 'store' }));
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
            free_shipping_threshold: null,
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
            methods.push({ id: 'stripe', label: tx('Carte / Apple Pay / Google Pay', 'Card / Apple Pay / Google Pay'), icon: CreditCard });
        }
        if (isPickup) {
            // Pickup: offer "Pay in Store" unless admin requires online payment
            if (!pickupPaymentRequired) {
                methods.push({ id: 'store', label: tx('Payer en magasin', 'Pay in Store'), icon: Store });
            }
        } else {
            // Delivery: offer COD if enabled
            if (enabledMethods?.cod) {
                methods.push({ id: 'cod', label: tx('Paiement à la livraison', 'Cash on Delivery'), icon: Truck });
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

    // Attempt account creation after order — best-effort, never blocks checkout
    const attemptCheckoutRegistration = useCallback(async () => {
        if (!paymentForm.createAccount || isAuthenticated) return;
        if (!paymentForm.password || paymentForm.password !== paymentForm.passwordConfirm) return;
        const fullName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
        try {
            await register(fullName, shippingForm.email, paymentForm.password, paymentForm.passwordConfirm, shippingForm.phone || undefined);
            // If register succeeds and email is unverified, OTP modal opens via AuthContext
        } catch {
            // Silently ignore — order is already placed, registration failure is non-blocking
        }
    }, [paymentForm.createAccount, paymentForm.password, paymentForm.passwordConfirm, isAuthenticated, shippingForm.firstName, shippingForm.lastName, shippingForm.email, shippingForm.phone, register]);

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
            setError((err as ApiError).message ?? tx('Erreur serveur. Réessayez.', 'Server error. Please try again.'));
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
            // Attempt checkout registration (best-effort, non-blocking)
            await attemptCheckoutRegistration();
            clearFormFromSession();
            clearCart();
            router.push(`/order-success?order=${res.order_id}&payment=${paymentForm.method}&total=${total.toFixed(2)}`);
        } catch (err) {
            setError((err as ApiError).message ?? tx('Erreur serveur. Réessayez.', 'Server error. Please try again.'));
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Empty cart guard ──
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
            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-sb-green transition-colors">
                    <ArrowLeft size={14} />
                    {tx('Retour', 'Back')}
                </button>
                <span className="font-display text-xl uppercase">{AppConfig.brand.name}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <Lock size={11} className="text-sb-green" />
                    {tx('Paiement sécurisé', 'Secure Checkout')}
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

                    {/* ── Left column: stacked section cards ── */}
                    <div className="space-y-6">

                        {/* ── Section 1: Shipping Address ── */}
                        <SectionCard>
                            <h2 className="font-display text-xl uppercase mb-4">{tx('Adresse de livraison', 'Shipping Address')}</h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input label={tx('Prénom', 'First Name')} value={shippingForm.firstName} onChange={setShippingField('firstName')} required onBlur={() => markTouched('firstName')} error={validationErrors['firstName']} autoComplete="given-name" />
                                <Input label={tx('Nom', 'Last Name')} value={shippingForm.lastName} onChange={setShippingField('lastName')} required onBlur={() => markTouched('lastName')} error={validationErrors['lastName']} autoComplete="family-name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input label="Email" value={shippingForm.email} onChange={setShippingField('email')} type="email" required onBlur={() => markTouched('email')} error={validationErrors['email']} autoComplete="email" />
                                <Input label={tx('Téléphone', 'Phone')} value={shippingForm.phone} onChange={setShippingField('phone')} type="tel" placeholder="+33 6 00 00 00 00" autoComplete="tel" />
                            </div>
                            <Input label={tx('Adresse', 'Address')} value={shippingForm.address} onChange={setShippingField('address')} placeholder="16 Boulevard du Général de Gaulle" required className="mb-4" onBlur={() => markTouched('address')} error={validationErrors['address']} autoComplete="street-address" />
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Input label={tx('Code postal', 'Postal Code')} value={shippingForm.postalCode} onChange={setShippingField('postalCode')} placeholder="75001" required onBlur={() => markTouched('postalCode')} error={validationErrors['postalCode']} autoComplete="postal-code" />
                                <Input label={tx('Ville', 'City')} value={shippingForm.city} onChange={setShippingField('city')} placeholder="Paris" required className="col-span-2" onBlur={() => markTouched('city')} error={validationErrors['city']} autoComplete="address-level2" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{tx('Pays', 'Country')}</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-sb-black font-medium">France</div>
                            </div>
                        </SectionCard>

                        {/* ── Create Account (guests only, above delivery) ── */}
                        {!isAuthenticated && (
                            <SectionCard>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div
                                        onClick={() => setPaymentForm(f => ({ ...f, createAccount: !f.createAccount }))}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${paymentForm.createAccount ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                                    >
                                        {paymentForm.createAccount && <Check size={12} className="text-white" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={14} className={paymentForm.createAccount ? 'text-sb-green' : 'text-gray-400'} />
                                        <span className="text-sm font-bold text-gray-600">{tx('Créer un compte pour vos prochaines commandes', 'Create an account for faster checkout next time')}</span>
                                    </div>
                                </label>

                                <AnimatePresence>
                                    {paymentForm.createAccount && (
                                        <motion.div
                                            key="create-account-fields"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{tx('Mot de passe', 'Password')} *</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showAccountPassword ? 'text' : 'password'}
                                                            value={paymentForm.password}
                                                            onChange={e => setPaymentForm(f => ({ ...f, password: e.target.value }))}
                                                            onBlur={() => markTouched('accountPassword')}
                                                            autoComplete="new-password"
                                                            placeholder={tx('Min. 8 caractères', 'Min. 8 characters')}
                                                            className={`w-full border-2 rounded-2xl px-4 py-3.5 pr-11 text-sm font-medium focus:outline-none transition-colors bg-white placeholder:text-gray-300 ${validationErrors['accountPassword'] ? 'border-red-500' : 'border-gray-100 focus:border-sb-green'}`}
                                                        />
                                                        <button type="button" tabIndex={-1} onClick={() => setShowAccountPassword(v => !v)}
                                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-sb-green">
                                                            {showAccountPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    {validationErrors['accountPassword'] && <p className="mt-1 text-xs text-red-500">{validationErrors['accountPassword']}</p>}
                                                    {paymentForm.password.length > 0 && (
                                                        <ul className="mt-2 space-y-1">
                                                            {PASSWORD_CHECKS.map(rule => {
                                                                const ok = rule.test(paymentForm.password);
                                                                return (
                                                                    <li key={rule.label} className={`flex items-center gap-2 text-xs ${ok ? 'text-sb-green' : 'text-gray-400'}`}>
                                                                        <CheckCircle2 size={12} className={ok ? 'opacity-100' : 'opacity-30'} /> {rule.label}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{tx('Confirmer le mot de passe', 'Confirm Password')} *</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showAccountPasswordConfirm ? 'text' : 'password'}
                                                            value={paymentForm.passwordConfirm}
                                                            onChange={e => setPaymentForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                                                            onBlur={() => markTouched('accountPasswordConfirm')}
                                                            autoComplete="new-password"
                                                            placeholder={tx('Répéter le mot de passe', 'Repeat password')}
                                                            className={`w-full border-2 rounded-2xl px-4 py-3.5 pr-11 text-sm font-medium focus:outline-none transition-colors bg-white placeholder:text-gray-300 ${validationErrors['accountPasswordConfirm'] ? 'border-red-500' : 'border-gray-100 focus:border-sb-green'}`}
                                                        />
                                                        <button type="button" tabIndex={-1} onClick={() => setShowAccountPasswordConfirm(v => !v)}
                                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-sb-green">
                                                            {showAccountPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    {validationErrors['accountPasswordConfirm'] && <p className="mt-1 text-xs text-red-500">{validationErrors['accountPasswordConfirm']}</p>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </SectionCard>
                        )}

                        {/* ── Section 2: Delivery Method ── */}
                        <SectionCard>
                            <h2 className="font-display text-xl uppercase mb-4">{tx('Mode de livraison', 'Delivery Method')}</h2>
                            {methodsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-16 rounded-2xl bg-gray-50 animate-pulse" />
                                    <div className="h-16 rounded-2xl bg-gray-50 animate-pulse opacity-60" />
                                </div>
                            ) : apiMethods.length === 0 ? (
                                <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <AlertCircle size={15} /> {tx('Aucune méthode de livraison disponible.', 'No delivery methods available.')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {apiMethods.map(method => {
                                        const isSelected = selectedMethodId === method.id;
                                        const isPickupMethod = method.type === 'pickup';
                                        const MethodIcon = isPickupMethod ? Store : Truck;
                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => handleSelectMethod(method)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-sb-green bg-sb-green/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-sb-green/10' : 'bg-gray-50'}`}>
                                                        <MethodIcon size={16} className={isSelected ? 'text-sb-green' : 'text-gray-400'} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-sb-black">{method.name}</p>
                                                        {isPickupMethod
                                                            ? <p className="text-[10px] text-sb-green font-bold uppercase tracking-wider">{tx('Click & Collect', 'Click & Collect')}</p>
                                                            : <p className="text-[10px] text-gray-400">{method.estimated_days_min}–{method.estimated_days_max} {tx('jours ouvrés', 'business days')}</p>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black text-base ${isSelected ? 'text-sb-green' : 'text-sb-black'}`}>
                                                        {Number(method.base_price) === 0
                                                            ? tx('Gratuit', 'Free')
                                                            : formatPrice(Number(method.base_price))}
                                                    </span>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-sb-green' : 'border-gray-300'}`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-sb-green" />}
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
                                        <div className="border-2 border-sb-green/20 bg-sb-green/5 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Store size={16} className="text-sb-green" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-sb-green">
                                                    {tx('Choisissez votre point de retrait', 'Choose Pickup Store')}
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
                                                            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${isStoreSelected ? 'border-sb-green bg-white shadow-sm' : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-100'}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isStoreSelected ? 'bg-sb-green/10' : 'bg-gray-50'}`}>
                                                                <MapPin size={14} className={isStoreSelected ? 'text-sb-green' : 'text-gray-400'} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-bold text-sm ${isStoreSelected ? 'text-sb-black' : 'text-gray-700'}`}>{store.name}</p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">{store.address}, {store.city}</p>
                                                                {store.hours && <p className="text-[10px] text-gray-400">{store.hours}</p>}
                                                                {store.phone && (
                                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                                        <Phone size={10} /> {store.phone}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${isStoreSelected ? 'border-sb-green' : 'border-gray-200'}`}>
                                                                {isStoreSelected && <div className="w-2 h-2 rounded-full bg-sb-green" />}
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
                            <h2 className="font-display text-xl uppercase mb-4">{tx('Adresse de facturation', 'Billing Address')}</h2>

                            {/* Same as shipping checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${billingForm.sameAsShipping ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                                    onClick={() => setBillingForm(b => ({ ...b, sameAsShipping: !b.sameAsShipping }))}
                                >
                                    {billingForm.sameAsShipping && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-sm font-bold text-gray-600">{tx('Identique à l\'adresse de livraison', 'Same as shipping address')}</span>
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
                                                    label={tx('Prénom', 'First Name')}
                                                    value={billingForm.firstName}
                                                    onChange={v => setBillingForm(b => ({ ...b, firstName: v }))}
                                                    required
                                                />
                                                <Input
                                                    label={tx('Nom', 'Last Name')}
                                                    value={billingForm.lastName}
                                                    onChange={v => setBillingForm(b => ({ ...b, lastName: v }))}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                label={tx('Adresse', 'Address')}
                                                value={billingForm.address}
                                                onChange={v => setBillingForm(b => ({ ...b, address: v }))}
                                                placeholder="16 Boulevard du Général de Gaulle"
                                                required
                                            />
                                            <div className="grid grid-cols-3 gap-4">
                                                <Input
                                                    label={tx('Code postal', 'Postal Code')}
                                                    value={billingForm.postalCode}
                                                    onChange={v => setBillingForm(b => ({ ...b, postalCode: v }))}
                                                    placeholder="75001"
                                                    required
                                                />
                                                <Input
                                                    label={tx('Ville', 'City')}
                                                    value={billingForm.city}
                                                    onChange={v => setBillingForm(b => ({ ...b, city: v }))}
                                                    placeholder="Paris"
                                                    required
                                                    className="col-span-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{tx('Pays', 'Country')}</label>
                                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-sb-black font-medium">France</div>
                                            </div>
                                            <Input
                                                label={tx('Téléphone', 'Phone')}
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
                                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-[28px]">
                                    <Loader2 size={32} className="animate-spin text-sb-green mb-4" />
                                    <p className="font-display text-xl uppercase tracking-widest text-sb-black">{tx('Préparation...', 'Preparing...')}</p>
                                </div>
                            )}

                            {/* Stripe Elements phase */}
                            {clientSecret && pendingOrderId ? (
                                <div>
                                    <h2 className="font-display text-xl uppercase mb-2">{tx('Paiement sécurisé', 'Secure Payment')}</h2>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
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
                                            onSuccess={async () => {
                                                await attemptCheckoutRegistration();
                                                clearFormFromSession();
                                                clearCart();
                                                router.push(`/order-success?order=${pendingOrderId}&payment=stripe&total=${total.toFixed(2)}`);
                                            }}
                                        />
                                    </Elements>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="font-display text-xl uppercase mb-4">{tx('Mode de paiement', 'Payment Method')}</h2>

                                    {/* No payment methods warning */}
                                    {paymentMethods.length === 0 && (
                                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                                            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                            <p className="text-sm text-red-700">{tx('Aucun moyen de paiement n\'est actuellement disponible. Veuillez réessayer plus tard.', 'No payment methods are currently available. Please try again later.')}</p>
                                        </div>
                                    )}

                                    {/* Method selector */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                        {paymentMethods.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setPaymentForm(f => ({ ...f, method: m.id }))}
                                                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 ${paymentForm.method === m.id ? 'border-sb-green bg-sb-green/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                            >
                                                <m.icon size={22} className={paymentForm.method === m.id ? 'text-sb-green' : 'text-gray-300'} />
                                                <span className={`text-[10px] font-black uppercase tracking-wider text-center ${paymentForm.method === m.id ? 'text-sb-green' : 'text-gray-500'}`}>{m.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Method details */}
                                    <AnimatePresence mode="wait">
                                        {paymentForm.method === 'stripe' && (
                                            <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
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

                                        {paymentForm.method === 'store' && (
                                            <motion.div key="store" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
                                                <div className="bg-sb-green/5 border border-sb-green/20 rounded-3xl p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-sb-green">
                                                            <Store size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-display text-lg uppercase mb-1">{tx('Payer en magasin', 'Pay in Store')}</h3>
                                                            <p className="text-sm text-gray-500 mb-3">{tx('Votre commande sera mise de côté. Payez directement à votre point de retrait lors de la collecte.', 'Your order will be reserved. Pay directly at the store when you collect.')}</p>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-sb-green/70 uppercase">
                                                                <Check size={12} /> {tx('Carte & espèces acceptées en magasin', 'Card & cash accepted in store')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentForm.method === 'cod' && (
                                            <motion.div key="cod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
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
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Terms & Conditions */}
                                    <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                                        <div
                                            onClick={() => setPaymentForm(f => ({ ...f, acceptedTerms: !f.acceptedTerms }))}
                                            className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${paymentForm.acceptedTerms ? 'bg-sb-green border-sb-green' : 'border-gray-200 group-hover:border-sb-green/50'}`}
                                        >
                                            {paymentForm.acceptedTerms && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-gray-500 leading-relaxed">
                                            {tx('J\'accepte les ', 'I accept the ')}
                                            <Link href="/terms" className="underline hover:text-sb-green">{tx('Conditions Générales', 'Terms & Conditions')}</Link>
                                            {tx(' et la ', ' and ')}
                                            <Link href="/privacy" className="underline hover:text-sb-green">{tx('Politique de Confidentialité', 'Privacy Policy')}</Link>.
                                        </span>
                                    </label>

                                    {/* Error */}
                                    {error && (
                                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
                                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-red-700 text-xs leading-snug">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        onClick={(paymentForm.method === 'cod' || paymentForm.method === 'store') ? handlePlaceOrder : handleContinueToStripe}
                                        disabled={!canSubmit || isProcessing}
                                        className="w-full flex justify-between items-center px-8 py-5 bg-sb-green text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-sb-green/25 hover:bg-[#2C6345] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span>
                                            {(paymentForm.method === 'cod' || paymentForm.method === 'store')
                                                ? tx('Confirmer la commande', 'Place Order')
                                                : tx('Continuer vers le paiement sécurisé', 'Continue to Secure Payment')
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
