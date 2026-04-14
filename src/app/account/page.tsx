"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { ReviewModal } from '@/components/ui/ReviewModal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import {
    Package, Truck, Check, CheckCircle2, Clock, LogOut, ChevronRight, ChevronLeft,
    MessageSquare, MapPin, User as UserIcon, Star, X, Plus, Edit2, Trash2,
    AlertCircle, Shield, CreditCard, Home, Briefcase, ChevronDown, Camera, Save, Loader2, Search, Heart, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { Order, OrderStatus, OrderItem, Address, Product, getProductImage } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';

// ── Backend → frontend order mapper ───────────────────────────────────────
interface ApiOrderItem {
    id: number;
    product_id: number;
    // Backend returns these snapshot fields from OrderItemResource
    product_name_snapshot: string;
    unit_name_snapshot: string;
    unit_price_snapshot: number;
    final_unit_price?: number;
    quantity: number;
    line_total?: number;
}
interface ApiOrder {
    id: number;
    status: string;
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    grand_total: number;
    payment_method?: string;
    created_at: string;
    items?: ApiOrderItem[];
}

function mapApiOrder(o: ApiOrder): Order {
    const items: OrderItem[] = (o.items ?? []).map(i => ({
        id: String(i.id),
        quantity: i.quantity,
        unitPrice: Number(i.unit_price_snapshot ?? i.final_unit_price ?? 0),
        product: {
            id: i.product_id,
            slug: `product-${i.product_id}`,
            name: i.product_name_snapshot ?? '',
            brand_id: 0,
            category_id: 0,
            selling_price: Number(i.unit_price_snapshot ?? 0),
            status: 'active' as const,
            stock_qty: 0,
            reserved_stock: 0,
            low_stock_threshold: 0,
            sort_order: 0,
            is_featured: false,
            created_at: o.created_at,
            updated_at: o.created_at,
        },
    }));
    return {
        id: String(o.id),
        date: o.created_at,
        items,
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping_total),
        discount: Number(o.discount_total),
        total: Number(o.grand_total),
        status: o.status as Order['status'],
        paymentMethod: o.payment_method,
    };
}

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:    { label: 'Order Placed', color: 'text-gray-600',    bg: 'bg-gray-50 border-gray-200' },
    processing: { label: 'Confirmed',   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
    shipped:    { label: 'Shipped',     color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
    delivered:  { label: 'Delivered',   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    cancelled:  { label: 'Cancelled',   color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
    paid:       { label: 'Paid',        color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['processing'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {cfg.label}
        </span>
    );
}

function StatusTimeline({ status }: { status: string }) {
    const steps = [
        { id: 'pending',    label: 'Order Placed', icon: Package },
        { id: 'processing', label: 'Confirmed',    icon: CheckCircle2 },
        { id: 'shipped',    label: 'Shipped',      icon: Truck },
        { id: 'delivered',  label: 'Delivered',    icon: CheckCircle2 },
    ];
    const currentIndex = status === 'cancelled' ? -1 : steps.findIndex(s => s.id === status);
    const progressPct  = currentIndex <= 0 ? 0 : (currentIndex / (steps.length - 1)) * 100;
    return (
        <div className="relative flex justify-between pt-4 pb-2">
            <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-100 -z-10" />
            <div className="absolute top-8 left-6 h-0.5 bg-sb-green -z-10 transition-all duration-1000" style={{ width: `calc(${progressPct}% - 3rem)` }} />
            {steps.map((step, idx) => {
                const isActive = currentIndex >= 0 && idx <= currentIndex;
                const Icon = step.icon;
                return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-sb-green text-white' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                            <Icon size={14} />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider text-center max-w-14 ${isActive ? 'text-sb-black' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ orders }: { orders: Order[] }) {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing]         = useState(false);
    const [editName, setEditName]           = useState(user?.name || '');
    const [editEmail, setEditEmail]         = useState(user?.email || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile]       = useState<File | null>(null);
    const [isSaving, setIsSaving]           = useState(false);
    const [showSaved, setShowSaved]         = useState(false);
    const [saveError, setSaveError]         = useState<string | null>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaveError(null);
        setIsSaving(true);
        try {
            let updatedAvatar: string | undefined;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('name', editName);
                formData.append('email', editEmail);
                formData.append('avatar', avatarFile);
                const token = typeof window !== 'undefined' ? localStorage.getItem('cf_auth_token') : null;
                const res = await fetch(Endpoints.profile, {
                    method: 'PUT',
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: 'application/json' },
                    body: formData,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error((err as { message?: string }).message ?? 'Upload failed');
                }
                const data = await res.json() as { avatar?: string };
                updatedAvatar = data.avatar;
            } else {
                await apiClient.put(Endpoints.profile, { name: editName, email: editEmail });
            }
            updateUser({ name: editName, email: editEmail, ...(updatedAvatar ? { avatar: updatedAvatar } : {}) });
            if (updatedAvatar) setAvatarPreview(updatedAvatar);
            setAvatarFile(null);
            setIsEditing(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2500);
        } catch (err) {
            const apiErr = err as ApiError;
            setSaveError(apiErr.message ?? 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const displayAvatar = avatarPreview ?? user?.avatar ?? null;

    return (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl uppercase">Profile Settings</h2>
                {!isEditing && (
                    <button
                        onClick={() => { setIsEditing(true); setEditName(user?.name || ''); setEditEmail(user?.email || ''); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-sb-green text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors shadow-sm"
                    >
                        <Edit2 size={12} /> Edit Profile
                    </button>
                )}
            </div>

            {/* Saved Toast */}
            <AnimatePresence>
                {showSaved && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-sb-green/10 border border-sb-green/20 text-sb-green rounded-xl p-3 flex items-center gap-2 mb-4">
                        <CheckCircle2 size={14} />
                        <span className="text-sm font-bold">Profile updated successfully!</span>
                    </motion.div>
                )}
                {saveError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 flex items-center gap-2 mb-4">
                        <AlertCircle size={14} />
                        <span className="text-sm font-bold">{saveError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                {/* Avatar + Info Header */}
                <div className="flex items-start gap-6 pb-8 mb-8 border-b border-gray-100">
                    <div className="relative group">
                        {displayAvatar ? (
                            <img src={displayAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sb-green to-[#2C6345] flex items-center justify-center text-white font-display text-4xl shadow-lg shadow-sb-green/20">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        {isEditing && (
                            <button onClick={() => fileRef.current?.click()}
                                className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera size={20} />
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </div>
                    <div>
                        <p className="font-black text-xl text-sb-black">{user?.name}</p>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <CheckCircle2 size={12} className="text-sb-green" />
                            <span className="text-[10px] text-sb-green font-bold uppercase tracking-wider">Verified Member</span>
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                            <input value={editName} onChange={e => setEditName(e.target.value)}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                            <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email"
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors" />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => { setIsEditing(false); setSaveError(null); }}
                                className="px-6 py-3 rounded-full border-2 border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving || !editName.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sb-green text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors disabled:opacity-50 shadow-lg shadow-sb-green/20">
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Full Name</p>
                            <p className="text-sm font-semibold text-sb-black">{user?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Email</p>
                            <p className="text-sm font-semibold text-sb-black">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total Orders</p>
                            <p className="text-sm font-semibold text-sb-black">{orders.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Member Since</p>
                            <p className="text-sm font-semibold text-sb-black">{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Address Form Modal ──────────────────────────────────────────────────────
const ADDRESS_COUNTRIES = [
    { code: 'FR', name: 'France' }, { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' }, { code: 'LU', name: 'Luxembourg' },
    { code: 'DE', name: 'Germany' }, { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' }, { code: 'NL', name: 'Netherlands' },
    { code: 'GB', name: 'United Kingdom' }, { code: 'PT', name: 'Portugal' },
    { code: 'MA', name: 'Morocco' }, { code: 'DZ', name: 'Algeria' },
    { code: 'TN', name: 'Tunisia' }, { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' }, { code: 'AE', name: 'UAE' },
];

function AddressFormModal({ address, onSave, onClose, isLoading = false }: {
    address?: Address | null;
    onSave: (data: Omit<Address, 'id'>) => void;
    onClose: () => void;
    isLoading?: boolean;
}) {
    const [form, setForm] = useState<Omit<Address, 'id'>>({
        label: address?.label || 'Home',
        firstName: address?.firstName || '',
        lastName: address?.lastName || '',
        address: address?.address || '',
        city: address?.city || '',
        postalCode: address?.postalCode || '',
        country: address?.country || 'FR',
        phone: address?.phone || '',
        isDefault: address?.isDefault || false,
    });

    const set = (key: keyof typeof form) => (value: any) => setForm(p => ({ ...p, [key]: value }));
    const isValid = !!(form.firstName && form.lastName && form.address && form.city && form.postalCode && form.country);

    return (
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-2xl uppercase">{address ? 'Edit Address' : 'New Address'}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Label pills */}
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Label</label>
                        <div className="flex gap-2">
                            {['Home', 'Office', 'Other'].map(l => (
                                <button type="button" key={l} onClick={() => set('label')(l)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border-2 transition-colors ${form.label === l ? 'border-sb-green bg-sb-green/5 text-sb-green' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                                    {l === 'Home' && <Home size={12} />}
                                    {l === 'Office' && <Briefcase size={12} />}
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" value={form.firstName} onChange={set('firstName')} />
                        <Field label="Last Name"  value={form.lastName}  onChange={set('lastName')} />
                    </div>
                    <Field label="Street Address" value={form.address} onChange={set('address')} placeholder="12 Rue de la Paix" />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Postal Code" value={form.postalCode} onChange={set('postalCode')} />
                        <Field label="City" value={form.city} onChange={set('city')} />
                    </div>

                    {/* Country dropdown */}
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Country *</label>
                        <select
                            value={form.country}
                            onChange={e => set('country')(e.target.value)}
                            className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-sb-green focus:outline-none transition-colors bg-white text-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="">Select country…</option>
                            {ADDRESS_COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <Field label="Phone (optional)" value={form.phone || ''} onChange={set('phone')} type="tel" placeholder="+33 6 00 00 00 00" />

                    <label className="flex items-center gap-3 cursor-pointer">
                        <div
                            onClick={() => set('isDefault')(!form.isDefault)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${form.isDefault ? 'bg-sb-green border-sb-green' : 'border-gray-200 hover:border-sb-green/50'}`}
                        >
                            {form.isDefault && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Set as default address</span>
                    </label>
                </div>

                <button
                    type="button"
                    onClick={() => { if (isValid && !isLoading) onSave(form); }}
                    disabled={!isValid || isLoading}
                    className="w-full mt-6 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {address ? 'Save Changes' : 'Add Address'}
                </button>
            </motion.div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
            <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-sb-green focus:outline-none transition-colors" />
        </div>
    );
}

// ── Filter Dropdown ────────────────────────────────────────────────────────
type Filter = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTER_OPTIONS: { id: Filter; label: string; description: string }[] = [
    { id: 'all',       label: 'All Orders',      description: 'Show every order' },
    { id: 'active',    label: 'Active',          description: 'Processing & shipped' },
    { id: 'delivered', label: 'Delivered',       description: 'Successfully delivered' },
    { id: 'cancelled', label: 'Cancelled',       description: 'Cancelled or refunded' },
];

function FilterDropdown({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = FILTER_OPTIONS.find(f => f.id === value)!;

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${open ? 'border-sb-green bg-sb-green text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-sb-green hover:text-sb-green'}`}>
                <SlidersHorizontal size={13} />
                {current.label}
                <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                        <div className="px-3 py-2 border-b border-gray-50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Filter by status</p>
                        </div>
                        {FILTER_OPTIONS.map(opt => (
                            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${value === opt.id ? 'bg-sb-green/5' : ''}`}>
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${value === opt.id ? 'bg-sb-green' : 'bg-gray-200'}`} />
                                <div className="min-w-0">
                                    <p className={`text-xs font-black uppercase tracking-wider ${value === opt.id ? 'text-sb-green' : 'text-gray-700'}`}>{opt.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{opt.description}</p>
                                </div>
                                {value === opt.id && <CheckCircle2 size={14} className="text-sb-green ml-auto flex-shrink-0" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Account Page ───────────────────────────────────────────────────────
const ORDERS_PER_PAGE = 4;
type Tab = 'orders' | 'addresses' | 'profile' | 'wishlist';

export default function AccountPage() {
    const { user, logout, refreshAddresses } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab]           = useState<Tab>('orders');
    const [reviewingItem, setReviewingItem]   = useState<OrderItem | null>(null);
    const [expandedOrder, setExpandedOrder]   = useState<string | null>(null);
    const [filter, setFilter]                 = useState<Filter>('all');
    const [searchQuery, setSearchQuery]       = useState('');
    const [page, setPage]                     = useState(1);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress]     = useState<Address | null>(null);
    const [addressError, setAddressError]         = useState<string | null>(null);
    const [addressLoading, setAddressLoading]     = useState(false);

    const [orders, setOrders]               = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError]     = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const res = await apiClient.get<{ data: ApiOrder[] }>(Endpoints.orders);
            setOrders((res.data ?? []).map(mapApiOrder));
        } catch (err) {
            const apiErr = err as ApiError;
            setOrdersError(apiErr.message ?? 'Failed to load orders.');
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    useEffect(() => { if (user) fetchOrders(); }, [user, fetchOrders]);

    const handleSaveAddress = async (data: Omit<Address, 'id'>) => {
        setAddressError(null);
        setAddressLoading(true);
        try {
            const payload = {
                label: data.label, first_name: data.firstName, last_name: data.lastName,
                address_1: data.address, city: data.city, postcode: data.postalCode,
                country: data.country, phone: data.phone || null, is_default: data.isDefault ?? false,
            };
            if (editingAddress) await apiClient.put(Endpoints.address(editingAddress.id), payload);
            else await apiClient.post(Endpoints.addresses, payload);
            await refreshAddresses();
            setShowAddressModal(false);
            setEditingAddress(null);
        } catch (err) {
            const apiErr = err as ApiError;
            setAddressError(apiErr.message ?? 'Failed to save address.');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        setAddressError(null);
        try { await apiClient.delete(Endpoints.address(id)); await refreshAddresses(); }
        catch (err) { setAddressError((err as ApiError).message ?? 'Failed to delete address.'); }
    };

    const handleSetDefault = async (id: string) => {
        setAddressError(null);
        try { await apiClient.patch(Endpoints.addressDefault(id)); await refreshAddresses(); }
        catch (err) { setAddressError((err as ApiError).message ?? 'Failed to update default address.'); }
    };

    const addresses = user?.addresses ?? [];

    const filteredOrders = orders.filter(o => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesId      = o.id.toLowerCase().includes(q);
            const matchesStatus  = o.status.toLowerCase().includes(q);
            const matchesProduct = o.items.some(i => i.product.name.toLowerCase().includes(q));
            if (!matchesId && !matchesStatus && !matchesProduct) return false;
        }
        if (filter === 'all')       return true;
        if (filter === 'active')    return ['processing', 'shipped', 'paid'].includes(o.status);
        if (filter === 'delivered') return o.status === 'delivered';
        if (filter === 'cancelled') return ['cancelled', 'refunded'].includes(o.status);
        return true;
    });

    const totalPages      = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);
    const handleFilterChange = (f: Filter) => { setFilter(f); setPage(1); };

    const TABS = [
        { id: 'orders'    as Tab, label: 'My Orders',   icon: Package },
        { id: 'wishlist'  as Tab, label: 'Saved Items', icon: Heart },
        { id: 'addresses' as Tab, label: 'Addresses',   icon: MapPin },
        { id: 'profile'   as Tab, label: 'Profile',     icon: UserIcon },
    ];

    const PAYMENT_LABELS: Record<string, string> = {
        cod: 'Cash on Delivery', stripe: 'Stripe', wise: 'Wise Transfer', card: 'Credit Card',
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50 pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── Page Header ─────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sb-green mb-1">Your Account</p>
                            <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight text-sb-black">
                                Welcome back, {user?.name?.split(' ')[0] || 'User'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                        </div>
                        <button onClick={() => logout()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-wider w-max">
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* ── Sidebar ─────────────────────────────────── */}
                        <div className="lg:w-56 flex-shrink-0">
                            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                                {TABS.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-md text-sb-green border-2 border-sb-green/30' : 'bg-transparent text-gray-500 hover:bg-white hover:shadow-sm border-2 border-transparent'}`}>
                                            <Icon size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                        </button>
                                    );
                                })}

                                {/* Quick Stats */}
                                <div className="hidden lg:block mt-6 p-5 bg-white rounded-2xl border border-gray-100">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">Your Stats</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Total Orders</span>
                                            <span className="font-black text-sb-black">{orders.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Delivered</span>
                                            <span className="font-black text-emerald-600">{orders.filter(o => o.status === 'delivered').length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Total Spent</span>
                                            <span className="font-black text-sb-green">€{orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Main Content ─────────────────────────────── */}
                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">

                                {/* ══ ORDERS TAB ══ */}
                                {activeTab === 'orders' && (
                                    <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                                        {/* ── Premium search + filter bar ── */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                            <h2 className="font-display text-2xl uppercase">Order History</h2>
                                            <div className="flex items-center gap-2">
                                                {/* Search */}
                                                <div className="relative flex-1 sm:flex-none sm:w-64">
                                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    <input type="text" placeholder="Search orders, products…"
                                                        value={searchQuery}
                                                        onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                                                        className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs border-2 border-gray-100 focus:border-sb-green focus:outline-none shadow-sm transition-all placeholder-gray-400" />
                                                    {searchQuery && (
                                                        <button onClick={() => { setSearchQuery(''); setPage(1); }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                                {/* Filter dropdown */}
                                                <FilterDropdown value={filter} onChange={handleFilterChange} />
                                            </div>
                                        </div>

                                        {/* Active filter chip */}
                                        {(filter !== 'all' || searchQuery) && (
                                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                                {filter !== 'all' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sb-green/10 text-sb-green border border-sb-green/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        {FILTER_OPTIONS.find(f => f.id === filter)?.label}
                                                        <button onClick={() => handleFilterChange('all')} className="hover:text-sb-green/60 transition-colors"><X size={11} /></button>
                                                    </span>
                                                )}
                                                {searchQuery && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                                                        "{searchQuery}"
                                                        <button onClick={() => { setSearchQuery(''); setPage(1); }} className="hover:text-gray-400 transition-colors"><X size={11} /></button>
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400">{filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}

                                        {/* Loading / Error / Empty states */}
                                        {ordersLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-3xl border border-gray-100 h-24 animate-pulse" />)}
                                            </div>
                                        ) : ordersError ? (
                                            <div className="bg-white rounded-3xl p-8 border border-red-100 flex items-center gap-3">
                                                <AlertCircle size={20} className="text-red-400 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-red-600 text-sm">Failed to load orders</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{ordersError}</p>
                                                </div>
                                                <button onClick={fetchOrders} className="ml-auto text-xs font-bold text-sb-green hover:underline">Retry</button>
                                            </div>
                                        ) : paginatedOrders.length === 0 ? (
                                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                                <Package size={40} className="text-gray-200 mx-auto mb-4" />
                                                <p className="font-bold text-gray-400">No orders found</p>
                                                {(filter !== 'all' || searchQuery) && (
                                                    <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="mt-3 text-xs font-bold text-sb-green hover:underline">Clear filters</button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {paginatedOrders.map((order: Order) => (
                                                    <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                        {/* Order Header Row */}
                                                        <div onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                            className="flex flex-wrap items-center gap-4 px-6 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                                    <p className="font-black text-sb-black">#{order.id}</p>
                                                                    <StatusBadge status={order.status} />
                                                                </div>
                                                                <p className="text-xs text-gray-400">
                                                                    {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <div className="text-right">
                                                                    <p className="font-display text-xl text-sb-green">€{order.total.toFixed(2)}</p>
                                                                    {order.paymentMethod && <p className="text-[10px] text-gray-400 uppercase tracking-wider">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>}
                                                                </div>
                                                                <Link href={`/orders/${order.id}`} onClick={e => e.stopPropagation()}
                                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sb-green/10 text-sb-green hover:bg-sb-green hover:text-white transition-all text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                                                                    <ExternalLink size={11} /> Track
                                                                </Link>
                                                                <ChevronDown size={16} className={`text-gray-300 transition-transform flex-shrink-0 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {/* Expandable Detail */}
                                                        <AnimatePresence>
                                                            {expandedOrder === order.id && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden border-t border-gray-100">

                                                                    {/* Delivered banner */}
                                                                    {order.status === 'delivered' && (
                                                                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
                                                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-bold text-emerald-700">Order delivered!</p>
                                                                                <p className="text-xs text-emerald-600/70">Click Review on any item below to share your experience.</p>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Tracking timeline */}
                                                                    {['processing', 'shipped', 'paid'].includes(order.status) && (
                                                                        <div className="px-6 py-6 bg-sb-green/5 border-b border-gray-100">
                                                                            <div className="flex justify-between items-center mb-4">
                                                                                <div>
                                                                                    <p className="font-bold text-sb-green">
                                                                                        {order.status === 'shipped' ? '🚚 Your order is on the way!' : '⏳ Preparing your order...'}
                                                                                    </p>
                                                                                    {order.trackingNumber && <p className="text-xs text-gray-500 mt-1">Tracking: <span className="font-mono text-sb-black">{order.trackingNumber}</span></p>}
                                                                                </div>
                                                                                <Link href={`/orders/${order.id}`} onClick={e => e.stopPropagation()}
                                                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sb-green text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#2C6345] transition-colors flex-shrink-0">
                                                                                    <Truck size={11} /> Track Shipment
                                                                                </Link>
                                                                            </div>
                                                                            <StatusTimeline status={order.status} />
                                                                        </div>
                                                                    )}

                                                                    {/* Items */}
                                                                    <div className="p-6 space-y-4">
                                                                        {order.items.map((item: OrderItem) => (
                                                                            <div key={item.id} className="flex gap-4 items-center">
                                                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                                    {getProductImage(item.product) ? (
                                                                                        <img src={getProductImage(item.product)!} alt={item.product.name} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <span className="text-2xl">&#9749;</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-bold text-sm text-sb-black truncate">{item.product.name}</p>
                                                                                    <p className="text-xs text-gray-400">Qty: {item.quantity} · €{item.unitPrice.toFixed(2)}/unit</p>
                                                                                </div>
                                                                                <div className="text-right flex items-center gap-3">
                                                                                    <p className="font-black text-sm text-sb-black">€{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                                                                    {order.status === 'delivered' && (
                                                                                        <button onClick={e => { e.stopPropagation(); setReviewingItem(item); }}
                                                                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-transparent transition-all text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                                                                                            <Star size={11} /> Review
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                        {/* Order Totals */}
                                                                        <div className="border-t border-gray-100 pt-4 space-y-1.5">
                                                                            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>€{order.subtotal.toFixed(2)}</span></div>
                                                                            {order.discount > 0 && <div className="flex justify-between text-sm text-sb-green"><span>Discount</span><span>-€{order.discount.toFixed(2)}</span></div>}
                                                                            <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : `€${order.shipping.toFixed(2)}`}</span></div>
                                                                            <div className="flex justify-between font-black text-base text-sb-black border-t border-gray-100 pt-2 mt-2"><span>Total</span><span className="text-sb-green">€{order.total.toFixed(2)}</span></div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-8">
                                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-sb-green disabled:opacity-30 transition-colors">
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                    <button key={p} onClick={() => setPage(p)}
                                                        className={`w-10 h-10 rounded-full text-sm font-black transition-colors ${page === p ? 'bg-sb-green text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-sb-green'}`}>
                                                        {p}
                                                    </button>
                                                ))}
                                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-sb-green disabled:opacity-30 transition-colors">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ══ ADDRESSES TAB ══ */}
                                {activeTab === 'addresses' && (
                                    <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-display text-2xl uppercase">Saved Addresses</h2>
                                            <button onClick={() => { setEditingAddress(null); setAddressError(null); setShowAddressModal(true); }}
                                                className="flex items-center gap-2 px-5 py-3 bg-sb-green text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors">
                                                <Plus size={14} /> Add Address
                                            </button>
                                        </div>

                                        {addressError && (
                                            <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                                <span>{addressError}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {addresses.map((addr: Address) => (
                                                <div key={addr.id} className={`bg-white rounded-3xl p-6 border-2 transition-all ${addr.isDefault ? 'border-sb-green shadow-md shadow-sb-green/10' : 'border-gray-100'}`}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            {addr.label === 'Home' ? <Home size={16} className="text-sb-green" /> : <Briefcase size={16} className="text-sb-green" />}
                                                            <span className="font-black text-sm uppercase tracking-wider">{addr.label}</span>
                                                            {addr.isDefault && <span className="px-2 py-0.5 bg-sb-green/10 text-sb-green text-[9px] font-black uppercase tracking-wider rounded-full border border-sb-green/20">Default</span>}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => { setEditingAddress(addr); setAddressError(null); setShowAddressModal(true); }} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-sb-green hover:text-white transition-colors text-gray-400">
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button onClick={() => handleDeleteAddress(addr.id)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors text-gray-400">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-sb-black font-semibold">{addr.firstName} {addr.lastName}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
                                                    <p className="text-sm text-gray-500">{addr.postalCode} {addr.city}, {addr.country}</p>
                                                    {addr.phone && <p className="text-sm text-gray-400 mt-1">{addr.phone}</p>}
                                                    {!addr.isDefault && (
                                                        <button onClick={() => handleSetDefault(addr.id)} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-sb-green hover:underline">
                                                            Set as Default
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {addresses.length === 0 && (
                                                <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-gray-100">
                                                    <MapPin size={40} className="text-gray-200 mx-auto mb-4" />
                                                    <p className="font-bold text-gray-400">No saved addresses yet</p>
                                                    <button onClick={() => setShowAddressModal(true)} className="mt-4 px-6 py-2 bg-sb-green text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                                        Add your first address
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 p-5 bg-sb-green/5 border border-sb-green/20 rounded-2xl flex items-start gap-3">
                                            <Shield size={16} className="text-sb-green flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-gray-600">Your addresses are saved securely. No payment card details are ever stored on our servers.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ══ WISHLIST TAB ══ */}
                                {activeTab === 'wishlist' && (
                                    <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-display text-2xl uppercase">Saved Items</h2>
                                        </div>
                                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                            <Heart size={40} className="text-gray-200 mx-auto mb-4" />
                                            <p className="font-bold text-gray-400">Your wishlist is currently empty</p>
                                            <button onClick={() => window.location.href = '/shop'} className="mt-4 px-6 py-2 bg-sb-green text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                                Explore Shop
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ══ PROFILE TAB ══ */}
                                {activeTab === 'profile' && <ProfileTab orders={orders} />}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showAddressModal && (
                    <AddressFormModal
                        address={editingAddress}
                        onSave={handleSaveAddress}
                        onClose={() => { setShowAddressModal(false); setEditingAddress(null); setAddressError(null); }}
                        isLoading={addressLoading}
                    />
                )}
            </AnimatePresence>

            <ReviewModal
                isOpen={!!reviewingItem}
                onClose={() => setReviewingItem(null)}
                item={reviewingItem}
            />
        </ProtectedRoute>
    );
}
