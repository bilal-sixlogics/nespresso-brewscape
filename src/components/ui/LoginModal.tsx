"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/types';
import Link from 'next/link';

export function LoginModal() {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirm, setConfirm] = useState('');

    const reset = () => {
        setEmail(''); setPassword(''); setName(''); setConfirm('');
        setError(null); setShowPassword(false);
    };

    const switchView = (v: 'login' | 'register') => { reset(); setView(v); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (view === 'login') {
                await login(email, password);
            } else {
                // For register from the modal, redirect to the dedicated register page
                // to avoid duplicating complex validation UX here
                closeLoginModal();
                window.location.href = `/register`;
                return;
            }
            reset();
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                    <button
                        onClick={closeLoginModal}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-3xl uppercase tracking-tight text-gray-900 mb-2">
                                {view === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {view === 'login'
                                    ? 'Sign in to track your orders and manage your account.'
                                    : 'Join Brewscape for exclusive offers and order tracking.'}
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-200 text-red-600 text-sm"
                            >
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {view === 'login' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#3B7E5A] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <Link
                                        href="/forgot-password"
                                        onClick={closeLoginModal}
                                        className="text-xs text-[#3B7E5A] hover:underline font-semibold"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#3B7E5A] text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 text-center">
                                    For the best experience, use the dedicated registration page.
                                </p>
                                <Link
                                    href="/register"
                                    onClick={closeLoginModal}
                                    className="block w-full text-center bg-[#3B7E5A] text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#2C6345] transition-colors"
                                >
                                    Go to Register Page
                                </Link>
                            </div>
                        )}

                        <div className="mt-8 text-center text-sm text-gray-500">
                            {view === 'login' ? (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <button onClick={() => switchView('register')} className="text-[#3B7E5A] font-bold hover:underline">
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button onClick={() => switchView('login')} className="text-[#3B7E5A] font-bold hover:underline">
                                        Log in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
