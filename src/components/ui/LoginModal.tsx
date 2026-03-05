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
                    id: 'CF-99281A',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'shipped',
                    trackingNumber: 'TRK99281FR',
                    subtotal: 89.90, shipping: 0, discount: 0, total: 89.90,
                    items: [
                        { id: '1', quantity: 2, unitPrice: 44.95, product: { id: 'm1', slug: 'vertuo-pop', name: 'Vertuo Pop', image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64c54a?q=80&w=600&auto=format&fit=crop', price: 99.00 } }
                    ]
                },
                {
                    id: 'CF-88172B',
                    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'delivered',
                    trackingNumber: 'TRK88172FR',
                    subtotal: 45.00, shipping: 5.90, discount: 0, total: 50.90,
                    items: [
                        { id: '2', quantity: 5, unitPrice: 9.00, product: { id: 'p1', slug: 'lavazza-crema-aroma-expert-1kg', name: 'Lavazza Crema e Aroma Expert', image: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600&auto=format&fit=crop', price: 9.00 } }
                    ]
                }
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
