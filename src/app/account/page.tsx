"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { ReviewModal } from '@/components/ui/ReviewModal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
    Package, Truck, CheckCircle2, Clock, LogOut, ChevronRight, ChevronLeft,
    MessageSquare, MapPin, User as UserIcon, Star, X, Plus, Edit2, Trash2,
    AlertCircle, Shield, CreditCard, Home, Briefcase, ChevronDown, Camera, Save, Loader2, Search, Heart
} from 'lucide-react';
import { Order, OrderStatus, OrderItem, Address, Product, getProductImage } from '@/types';

/** Minimal mock product for demo order display */
function mockProduct(id: number, slug: string, name: string, image: string, price: number): Product {
    const now = new Date().toISOString();
    return { id, slug, name, brand_id: 1, category_id: 1, selling_price: price, status: 'active', featured_image: image, stock_qty: 100, reserved_stock: 0, low_stock_threshold: 5, sort_order: 0, is_featured: false, created_at: now, updated_at: now };
}

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Order Placed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
    processing: { label: 'Confirmed', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    shipped: { label: 'Shipped', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
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
        { id: 'pending', label: 'Order Placed', icon: Package },
        { id: 'processing', label: 'Confirmed', icon: CheckCircle2 },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    ];
    const ORDER = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = status === 'cancelled' ? -1 : steps.findIndex(s => s.id === status);
    const progressPct = currentIndex <= 0 ? 0 : (currentIndex / (steps.length - 1)) * 100;
    return (
        <div className="relative flex justify-between pt-4 pb-2">
            <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-100 -z-10" />
            <div
                className="absolute top-8 left-6 h-0.5 bg-sb-green -z-10 transition-all duration-1000"
                style={{ width: `calc(${progressPct}% - 3rem)` }}
            />
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
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const fileRef = React.useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
        }
    };

    const handleSave = () => {
        if (!user) return;
        setIsSaving(true);
        setTimeout(() => {
            login({ ...user, name: editName, email: editEmail });
            setIsSaving(false);
            setIsEditing(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2500);
        }, 800);
    };

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
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-sb-green/10 border border-sb-green/20 text-sb-green rounded-xl p-3 flex items-center gap-2 mb-4"
                    >
                        <CheckCircle2 size={14} />
                        <span className="text-sm font-bold">Profile updated successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                {/* Avatar + Info Header */}
                <div className="flex items-center gap-6 pb-8 mb-8 border-b border-gray-100">
                    <div className="relative group">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sb-green to-[#2C6345] flex items-center justify-center text-white font-display text-4xl shadow-lg shadow-sb-green/20">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        {isEditing && (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
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
                            <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                            <input
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                type="email"
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-sb-green outline-none transition-colors"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 rounded-full border-2 border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !editName.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sb-green text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors disabled:opacity-50 shadow-lg shadow-sb-green/20"
                            >
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
function AddressFormModal({ address, onSave, onClose }: {
    address?: Address | null;
    onSave: (data: Omit<Address, 'id'>) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<Omit<Address, 'id'>>({
        label: address?.label || 'Home',
        firstName: address?.firstName || '',
        lastName: address?.lastName || '',
        address: address?.address || '',
        city: address?.city || '',
        postalCode: address?.postalCode || '',
        country: address?.country || 'France',
        phone: address?.phone || '',
        isDefault: address?.isDefault || false,
    });

    const set = (key: keyof typeof form) => (value: any) => setForm(p => ({ ...p, [key]: value }));

    const isValid = form.firstName && form.lastName && form.address && form.city && form.postalCode && form.country;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-[32px] p-8 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-2xl uppercase">{address ? 'Edit Address' : 'New Address'}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Label */}
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Label</label>
                        <div className="flex gap-2">
                            {['Home', 'Office', 'Other'].map(l => (
                                <button
                                    key={l}
                                    onClick={() => set('label')(l)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border-2 transition-colors ${form.label === l ? 'border-sb-green bg-sb-green/5 text-sb-green' : 'border-gray-100 text-gray-500'}`}
                                >
                                    {l === 'Home' && <Home size={12} />}
                                    {l === 'Office' && <Briefcase size={12} />}
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" value={form.firstName} onChange={set('firstName')} />
                        <Field label="Last Name" value={form.lastName} onChange={set('lastName')} />
                    </div>
                    <Field label="Street Address" value={form.address} onChange={set('address')} placeholder="12 Rue de la Paix" />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="City" value={form.city} onChange={set('city')} />
                        <Field label="Postal Code" value={form.postalCode} onChange={set('postalCode')} />
                    </div>
                    <Field label="Country" value={form.country} onChange={set('country')} placeholder="France" />
                    <Field label="Phone (optional)" value={form.phone || ''} onChange={set('phone')} type="tel" />

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault')(e.target.checked)} className="w-4 h-4 accent-sb-green" />
                        <span className="text-sm font-medium text-gray-700">Set as default address</span>
                    </label>
                </div>

                <button
                    onClick={() => { if (isValid) { onSave(form); onClose(); } }}
                    disabled={!isValid}
                    className="w-full mt-6 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
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
            <input
                type={type} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-sb-green focus:outline-none transition-colors"
            />
        </div>
    );
}

// ── Main Account Page ───────────────────────────────────────────────────────
const ORDERS_PER_PAGE = 4;

// Mock active order since user orders might be empty
const MOCK_ORDERS: Order[] = [
    {
        id: 'CF-99281A', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'shipped', trackingNumber: 'TRK99281FR', paymentMethod: 'stripe',
        subtotal: 89.90, shipping: 0, discount: 0, total: 89.90,
        items: [{ id: '1', quantity: 2, unitPrice: 44.95, product: mockProduct(1, 'vertuo-pop', 'Vertuo Pop Machine', 'https://images.unsplash.com/photo-1517701550927-30cfcb64c54a?q=80&w=600&auto=format&fit=crop', 89.90) }]
    },
    {
        id: 'CF-88172B', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered', trackingNumber: 'TRK88172FR', paymentMethod: 'cod',
        subtotal: 45.00, shipping: 5.90, discount: 5.00, total: 45.90,
        items: [
            { id: '2', quantity: 5, unitPrice: 9.00, product: mockProduct(2, 'lavazza-crema-aroma-expert-1kg', 'Lavazza Crema e Aroma Expert 1kg', 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600&auto=format&fit=crop', 9.00) },
        ]
    },
    {
        id: 'CF-77063C', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered', paymentMethod: 'wise',
        subtotal: 32.00, shipping: 0, discount: 0, total: 32.00,
        items: [{ id: '3', quantity: 4, unitPrice: 8.00, product: mockProduct(3, 'marcilla-ground-coffee', 'Marcilla Ground Coffee', 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=600&auto=format&fit=crop', 8.00) }]
    },
    {
        id: 'CF-66044D', date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'cancelled', paymentMethod: 'stripe',
        subtotal: 120.00, shipping: 0, discount: 0, total: 120.00,
        items: [{ id: '4', quantity: 1, unitPrice: 120.00, product: mockProduct(4, 'nespresso-essenza', 'Nespresso Essenza Mini', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop', 120.00) }]
    },
    {
        id: 'CF-55025E', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered', paymentMethod: 'card',
        subtotal: 18.50, shipping: 5.90, discount: 0, total: 24.40,
        items: [{ id: '5', quantity: 2, unitPrice: 9.25, product: mockProduct(5, 'intenso-blend', 'Intenso Blend Pods x10', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop', 9.25) }]
    },
];

type Tab = 'orders' | 'addresses' | 'profile' | 'wishlist';
type Filter = 'all' | 'active' | 'delivered' | 'cancelled';

export default function AccountPage() {
    const { user, logout, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const orders = user?.orders?.length ? user.orders : MOCK_ORDERS;
    const addresses = user?.addresses ?? [];

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (filter === 'all') return true;
        if (filter === 'active') return o.status === 'processing' || o.status === 'shipped';
        if (filter === 'delivered') return o.status === 'delivered';
        if (filter === 'cancelled') return o.status === 'cancelled';
        return true;
    });

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

    const handleFilterChange = (f: Filter) => { setFilter(f); setPage(1); };

    const TABS = [
        { id: 'orders' as Tab, label: 'My Orders', icon: Package },
        { id: 'wishlist' as Tab, label: 'Saved Items', icon: Heart },
        { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
        { id: 'profile' as Tab, label: 'Profile', icon: UserIcon },
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
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-wider w-max"
                        >
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
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-md text-sb-green border-2 border-sb-green/30' : 'bg-transparent text-gray-500 hover:bg-white hover:shadow-sm border-2 border-transparent'}`}
                                        >
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
                                        {/* Header + Filters */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                            <h2 className="font-display text-2xl uppercase">Order History</h2>

                                            <div className="flex flex-col sm:flex-row gap-4 flex-1 justify-end">
                                                <div className="relative w-full sm:max-w-xs">
                                                    <input
                                                        type="text"
                                                        placeholder="Search Order Number..."
                                                        value={searchQuery}
                                                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                                        className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-xs border-2 border-transparent focus:border-sb-green focus:outline-none shadow-sm transition-all"
                                                    />
                                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>

                                                <div className="flex gap-2 flex-wrap bg-white p-1 rounded-full shadow-sm w-max">
                                                    {(['all', 'active', 'delivered', 'cancelled'] as Filter[]).map(f => (
                                                        <button
                                                            key={f}
                                                            onClick={() => handleFilterChange(f)}
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${filter === f ? 'bg-sb-green text-white shadow-md' : 'bg-transparent text-gray-500 hover:text-sb-black'}`}
                                                        >
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {paginatedOrders.length === 0 ? (
                                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                                <Package size={40} className="text-gray-200 mx-auto mb-4" />
                                                <p className="font-bold text-gray-400">No orders found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {paginatedOrders.map((order: Order) => (
                                                    <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                        {/* Order Header Row */}
                                                        <div
                                                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                            className="flex flex-wrap items-center gap-4 px-6 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <p className="font-black text-sb-black">{order.id}</p>
                                                                    <StatusBadge status={order.status} />
                                                                </div>
                                                                <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {order.items.length} item(s)</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-display text-xl text-sb-green">€{order.total.toFixed(2)}</p>
                                                                {order.paymentMethod && <p className="text-[10px] text-gray-400 uppercase tracking-wider">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>}
                                                            </div>
                                                            <ChevronDown size={16} className={`text-gray-300 transition-transform flex-shrink-0 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                                                        </div>

                                                        {/* Expandable Detail */}
                                                        <AnimatePresence>
                                                            {expandedOrder === order.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden border-t border-gray-100"
                                                                >
                                                                    {/* Tracking Timeline */}
                                                                    {(order.status === 'processing' || order.status === 'shipped') && (
                                                                        <div className="px-6 py-6 bg-sb-green/5 border-b border-gray-100">
                                                                            <div className="flex justify-between items-center mb-4">
                                                                                <div>
                                                                                    <p className="font-bold text-sb-green">
                                                                                        {order.status === 'shipped' ? '🚚 Your order is on the way!' : '⏳ Preparing your order...'}
                                                                                    </p>
                                                                                    {order.trackingNumber && <p className="text-xs text-gray-500 mt-1">Tracking: <span className="font-mono text-sb-black">{order.trackingNumber}</span></p>}
                                                                                </div>
                                                                            </div>
                                                                            <StatusTimeline status={order.status} />
                                                                        </div>
                                                                    )}

                                                                    {/* Items */}
                                                                    <div className="p-6 space-y-4">
                                                                        {order.items.map((item: OrderItem) => (
                                                                            <div key={item.id} className="flex gap-4 items-center">
                                                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                                                    <img src={getProductImage(item.product) ?? ''} alt={item.product.name} className="w-full h-full object-cover" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-bold text-sm text-sb-black truncate">{item.product.name}</p>
                                                                                    <p className="text-xs text-gray-400">Qty: {item.quantity} · €{item.unitPrice.toFixed(2)}/unit</p>
                                                                                </div>
                                                                                <div className="text-right flex items-center gap-3">
                                                                                    <p className="font-black text-sm text-sb-black">€{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                                                                    {order.status === 'delivered' && (
                                                                                        <button
                                                                                            onClick={() => setReviewingItem(item)}
                                                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-sb-green hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                                                                                        >
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
                                                <button
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-sb-green disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`w-10 h-10 rounded-full text-sm font-black transition-colors ${page === p ? 'bg-sb-green text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-sb-green'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-sb-green disabled:opacity-30 transition-colors"
                                                >
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
                                            <button
                                                onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                                                className="flex items-center gap-2 px-5 py-3 bg-sb-green text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2C6345] transition-colors"
                                            >
                                                <Plus size={14} /> Add Address
                                            </button>
                                        </div>

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
                                                            <button onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-sb-green hover:text-white transition-colors text-gray-400">
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button onClick={() => deleteAddress(addr.id)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors text-gray-400">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-sb-black font-semibold">{addr.firstName} {addr.lastName}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
                                                    <p className="text-sm text-gray-500">{addr.postalCode} {addr.city}, {addr.country}</p>
                                                    {addr.phone && <p className="text-sm text-gray-400 mt-1">{addr.phone}</p>}

                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => setDefaultAddress(addr.id)}
                                                            className="mt-4 text-[10px] font-bold uppercase tracking-widest text-sb-green hover:underline"
                                                        >
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
                                            <p className="text-xs text-gray-600">Your addresses are saved locally for convenience. No payment card details are ever stored on our servers.</p>
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
                                {activeTab === 'profile' && (
                                    <ProfileTab orders={orders} />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Address Form Modal ────────────────────────── */}
            <AnimatePresence>
                {showAddressModal && (
                    <AddressFormModal
                        address={editingAddress}
                        onSave={(data) => {
                            if (editingAddress) {
                                updateAddress({ ...data, id: editingAddress.id });
                            } else {
                                addAddress(data);
                            }
                        }}
                        onClose={() => { setShowAddressModal(false); setEditingAddress(null); }}
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
