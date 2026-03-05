"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

export function LoginModal() {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSocialLogin = (provider: string) => {
        setIsLoading(true);
        // Simulate OAuth delay
        setTimeout(() => {
            login({
                id: `usr_${Date.now()}`,
                name: `Demo ${provider} User`,
                email: `demo@${provider.toLowerCase()}.com`,
                orders: []
            });
            setIsLoading(false);
            closeLoginModal();
        }, 1500);
    };

    const handleEmailAuth = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            login({
                id: `usr_${Date.now()}`,
                name: view === 'register' ? name : 'Demo User',
                email: email,
                orders: []
            });
            setIsLoading(false);
            closeLoginModal();
        }, 1000);
    };

    const handleDemoLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            const demoOrders: Order[] = [
                {
                    id: 'CF-99281A', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'shipped',
                    trackingNumber: 'TRK99281FR', subtotal: 89.90, shipping: 0, discount: 0, total: 89.90,
                    items: [{ id: '1', quantity: 2, unitPrice: 44.95, product: { id: 'm1', slug: 'vertuo-pop', name: 'Vertuo Pop', image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64c54a?q=80&w=600', price: 99.00 } }]
                },
                {
                    id: 'CF-88172B', date: new Date(Date.now() - 15 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK88172FR', subtotal: 45.00, shipping: 5.90, discount: 0, total: 50.90,
                    items: [{ id: '2', quantity: 5, unitPrice: 9.00, product: { id: 'p1', slug: 'lavazza-crema-aroma-expert-1kg', name: 'Lavazza Crema e Aroma Expert', image: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600', price: 9.00 } }]
                },
                {
                    id: 'CF-77041C', date: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'processing',
                    trackingNumber: undefined, subtotal: 129.00, shipping: 0, discount: 12.90, total: 116.10,
                    items: [{ id: '3', quantity: 1, unitPrice: 129.00, product: { id: 'm2', slug: 'nespresso-essenza-mini', name: 'Nespresso Essenza Mini', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600', price: 129.00 } }]
                },
                {
                    id: 'CF-66930D', date: new Date(Date.now() - 0.4 * 86400000).toISOString(), status: 'pending',
                    trackingNumber: undefined, subtotal: 24.50, shipping: 5.99, discount: 0, total: 30.49,
                    items: [
                        { id: '4', quantity: 2, unitPrice: 8.50, product: { id: 'p2', slug: 'delta-cafes-intense', name: 'Delta Cafés Intense', image: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=600', price: 8.50 } },
                        { id: '4b', quantity: 1, unitPrice: 7.50, product: { id: 'p3', slug: 'cafrezzo-dark-roast', name: 'Cafrezzo Dark Roast', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600', price: 7.50 } }
                    ]
                },
                {
                    id: 'CF-55819E', date: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK55819FR', subtotal: 67.80, shipping: 0, discount: 0, total: 67.80,
                    items: [{ id: '5', quantity: 4, unitPrice: 16.95, product: { id: 'p4', slug: 'lavazza-gran-espresso', name: 'Lavazza Gran Espresso', image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600', price: 16.95 } }]
                },
                {
                    id: 'CF-44708F', date: new Date(Date.now() - 45 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK44708FR', subtotal: 199.00, shipping: 0, discount: 19.90, total: 179.10,
                    items: [{ id: '6', quantity: 1, unitPrice: 199.00, product: { id: 'm3', slug: 'delonghi-dedica', name: 'De\'Longhi Dedica', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600', price: 199.00 } }]
                },
                {
                    id: 'CF-33597G', date: new Date(Date.now() - 60 * 86400000).toISOString(), status: 'cancelled',
                    trackingNumber: undefined, subtotal: 35.00, shipping: 5.99, discount: 0, total: 40.99,
                    items: [{ id: '7', quantity: 2, unitPrice: 17.50, product: { id: 'p5', slug: 'lavazza-oro', name: 'Lavazza Qualità Oro', image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600', price: 17.50 } }]
                },
                {
                    id: 'CF-22486H', date: new Date(Date.now() - 75 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK22486FR', subtotal: 52.00, shipping: 0, discount: 5.20, total: 46.80,
                    items: [
                        { id: '8', quantity: 3, unitPrice: 9.50, product: { id: 'p6', slug: 'nespresso-ristretto', name: 'Nespresso Ristretto', image: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?q=80&w=600', price: 9.50 } },
                        { id: '8b', quantity: 2, unitPrice: 11.75, product: { id: 'p7', slug: 'nespresso-lungo', name: 'Nespresso Lungo Leggero', image: 'https://images.unsplash.com/photo-1611162457474-631244a21754?q=80&w=600', price: 11.75 } }
                    ]
                },
                {
                    id: 'CF-11375I', date: new Date(Date.now() - 90 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK11375FR', subtotal: 18.50, shipping: 5.99, discount: 0, total: 24.49,
                    items: [{ id: '9', quantity: 1, unitPrice: 18.50, product: { id: 'a1', slug: 'cafrezzo-mug-set', name: 'Cafrezzo Mug Set (x2)', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600', price: 18.50 } }]
                },
                {
                    id: 'CF-00264J', date: new Date(Date.now() - 110 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK00264FR', subtotal: 78.00, shipping: 0, discount: 0, total: 78.00,
                    items: [
                        { id: '10', quantity: 6, unitPrice: 8.50, product: { id: 'p8', slug: 'lavazza-espresso-italiano', name: 'Lavazza Espresso Italiano', image: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?q=80&w=600', price: 8.50 } },
                        { id: '10b', quantity: 1, unitPrice: 27.00, product: { id: 's1', slug: 'belgian-chocolate-box', name: 'Belgian Chocolate Box', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=600', price: 27.00 } }
                    ]
                },
                {
                    id: 'CF-99153K', date: new Date(Date.now() - 125 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK99153FR', subtotal: 55.90, shipping: 0, discount: 5.59, total: 50.31,
                    items: [{ id: '11', quantity: 1, unitPrice: 55.90, product: { id: 'a2', slug: 'aeroccino-milk-frother', name: 'Aeroccino Milk Frother', image: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?q=80&w=600', price: 55.90 } }]
                },
                {
                    id: 'CF-88042L', date: new Date(Date.now() - 145 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK88042FR', subtotal: 36.00, shipping: 5.99, discount: 0, total: 41.99,
                    items: [{ id: '12', quantity: 4, unitPrice: 9.00, product: { id: 'p9', slug: 'cafrezzo-arabica', name: 'Cafrezzo Pure Arabica', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600', price: 9.00 } }]
                },
                {
                    id: 'CF-77931M', date: new Date(Date.now() - 170 * 86400000).toISOString(), status: 'cancelled',
                    trackingNumber: undefined, subtotal: 249.00, shipping: 0, discount: 0, total: 249.00,
                    items: [{ id: '13', quantity: 1, unitPrice: 249.00, product: { id: 'm4', slug: 'jura-e4', name: 'Jura E4 Automatic', image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64c54a?q=80&w=600', price: 249.00 } }]
                },
                {
                    id: 'CF-66820N', date: new Date(Date.now() - 195 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK66820FR', subtotal: 14.90, shipping: 5.99, discount: 0, total: 20.89,
                    items: [{ id: '14', quantity: 1, unitPrice: 14.90, product: { id: 's2', slug: 'cafrezzo-macarons', name: 'French Macarons Box', image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?q=80&w=600', price: 14.90 } }]
                },
                {
                    id: 'CF-55709O', date: new Date(Date.now() - 220 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK55709FR', subtotal: 163.00, shipping: 0, discount: 16.30, total: 146.70,
                    items: [
                        { id: '15', quantity: 1, unitPrice: 89.00, product: { id: 'm5', slug: 'nespresso-inissia', name: 'Nespresso Inissia', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600', price: 89.00 } },
                        { id: '15b', quantity: 8, unitPrice: 9.25, product: { id: 'p10', slug: 'lavazza-decaf', name: 'Lavazza Dek Decaf', image: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=600', price: 9.25 } }
                    ]
                },
                {
                    id: 'CF-44598P', date: new Date(Date.now() - 250 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK44598FR', subtotal: 29.80, shipping: 5.99, discount: 0, total: 35.79,
                    items: [{ id: '16', quantity: 2, unitPrice: 14.90, product: { id: 'a3', slug: 'glass-espresso-cups', name: 'Glass Espresso Cups (x4)', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600', price: 14.90 } }]
                },
                {
                    id: 'CF-33487Q', date: new Date(Date.now() - 280 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK33487FR', subtotal: 96.00, shipping: 0, discount: 9.60, total: 86.40,
                    items: [{ id: '17', quantity: 8, unitPrice: 12.00, product: { id: 'p11', slug: 'cafrezzo-signature-blend', name: 'Cafrezzo Signature Blend', image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600', price: 12.00 } }]
                },
                {
                    id: 'CF-22376R', date: new Date(Date.now() - 310 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK22376FR', subtotal: 42.50, shipping: 0, discount: 0, total: 42.50,
                    items: [
                        { id: '18', quantity: 1, unitPrice: 22.00, product: { id: 's3', slug: 'coffee-cantucci', name: 'Cantucci Toscani', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=600', price: 22.00 } },
                        { id: '18b', quantity: 1, unitPrice: 20.50, product: { id: 's4', slug: 'cafrezzo-gift-box', name: 'Cafrezzo Gift Box', image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?q=80&w=600', price: 20.50 } }
                    ]
                },
                {
                    id: 'CF-11265S', date: new Date(Date.now() - 340 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK11265FR', subtotal: 179.00, shipping: 0, discount: 17.90, total: 161.10,
                    items: [{ id: '19', quantity: 1, unitPrice: 179.00, product: { id: 'm6', slug: 'krups-nespresso-citiz', name: 'Krups Nespresso Citiz', image: 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?q=80&w=600', price: 179.00 } }]
                },
                {
                    id: 'CF-00154T', date: new Date(Date.now() - 365 * 86400000).toISOString(), status: 'delivered',
                    trackingNumber: 'TRK00154FR', subtotal: 27.00, shipping: 5.99, discount: 0, total: 32.99,
                    items: [{ id: '20', quantity: 3, unitPrice: 9.00, product: { id: 'p12', slug: 'delta-cafes-classico', name: 'Delta Cafés Clássico', image: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?q=80&w=600', price: 9.00 } }]
                },
            ];

            login({
                id: 'usr_demo_123',
                name: 'Jane Doe (Demo)',
                email: 'jane.doe@example.com',
                orders: demoOrders
            });
            setIsLoading(false);
            closeLoginModal();
        }, 1000);
    };

    if (!isLoginModalOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={closeLoginModal}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLoginModal}
                        className="absolute pl-4 pr-4 pt-4 pb-4 right-2 top-2 text-gray-400 hover:text-sb-black transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-3xl uppercase tracking-tight text-sb-black mb-2">
                                {view === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {view === 'login'
                                    ? 'Log in to track your orders and manage your account.'
                                    : 'Join Cafrezzo for exclusive offers and order tracking.'}
                            </p>
                        </div>

                        {/* Social Buttons */}
                        <div className="space-y-3 mb-8">
                            <button
                                onClick={handleDemoLogin}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-sb-green/10 text-sb-green border border-sb-green/20 hover:bg-sb-green hover:text-white transition-colors"
                            >
                                <Sparkles size={18} />
                                <span className="text-sm font-bold uppercase tracking-wider">Demo: Populated Account</span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin('Google')}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-bold text-gray-700">Continue with Google</span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin('Apple')}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M16.636 7.625c.162-2.327-1.745-4.467-3.92-4.625-.333 2.144 1.77 4.27 3.92 4.625m-6.425 10.74c1.235 0 1.94-.741 3.69-.741 1.77 0 2.227.765 3.59.765 1.556 0 2.864-1.332 3.8-2.618 1.11-1.503 1.555-2.986 1.58-3.085-.049-.025-2.889-1.11-2.913-4.381-.05-2.812 2.39-4.195 2.513-4.269-1.334-1.925-3.407-2.146-4.148-2.221-1.78-.173-3.504 1.061-4.42 1.061-.914 0-2.344-1.036-3.8-1.01-1.898.024-3.663 1.085-4.639 2.763-1.973 3.432-.518 8.47 1.406 11.233 1.036 1.48 2.222 3.109 3.765 3.109l.576.395z" />
                                </svg>
                                <span className="text-sm font-bold">Continue with Apple</span>
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Or</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {view === 'register' && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-sb-green focus:ring-2 focus:ring-sb-green/20 outline-none transition-all text-sm"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-sb-green focus:ring-2 focus:ring-sb-green/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-sb-green focus:ring-2 focus:ring-sb-green/20 outline-none transition-all text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-sb-green text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : view === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        {/* Toggle View */}
                        <div className="mt-8 text-center text-sm">
                            <span className="text-gray-500">
                                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button
                                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                                className="text-sb-green font-bold hover:underline"
                            >
                                {view === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
