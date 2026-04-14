"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { ApiError } from '@/lib/api/types';

const PASSWORD_RULES = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
    const { register } = useAuth();
    const { isDark } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsLoading(true);
        try {
            await register(name, email, password, confirm);
            router.replace('/account');
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr.errors) setFieldErrors(apiErr.errors);
            else setError(apiErr.message ?? 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const pageBg = isDark ? 'bg-[#0e0e0e]' : 'bg-gray-50';
    const surface = isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100';
    const inputBg = isDark
        ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#3B7E5A] focus:ring-[#3B7E5A]/20'
        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#3B7E5A] focus:ring-[#3B7E5A]/20';
    const labelColor = isDark ? 'text-white/60' : 'text-gray-500';
    const headingColor = isDark ? 'text-white' : 'text-gray-900';
    const iconColor = isDark ? 'text-white/30' : 'text-gray-400';

    const firstFieldError = (key: string) => fieldErrors[key]?.[0];

    return (
        <ProtectedRoute requireGuest>
            <div className={`min-h-screen flex items-center justify-center px-4 py-16 ${pageBg}`}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`w-full max-w-md mx-auto rounded-3xl border shadow-xl p-8 ${surface}`}
                >
                    {/* Brand */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <span className="font-display text-2xl uppercase tracking-widest text-[#3B7E5A]">Cafrezzo</span>
                        </Link>
                        <h1 className={`mt-4 font-display text-3xl uppercase tracking-tight ${headingColor}`}>
                            Create Account
                        </h1>
                        <p className={`mt-2 text-sm ${labelColor}`}>
                            Join Cafrezzo for exclusive offers and order tracking.
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                        >
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                                    <UserIcon size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Full name"
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg} ${firstFieldError('name') ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {firstFieldError('name') && <p className="mt-1 text-xs text-red-500 pl-1">{firstFieldError('name')}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg} ${firstFieldError('email') ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {firstFieldError('email') && <p className="mt-1 text-xs text-red-500 pl-1">{firstFieldError('email')}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg} ${firstFieldError('password') ? 'border-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(v => !v)}
                                    className={`absolute inset-y-0 right-0 pr-4 flex items-center ${iconColor} hover:text-[#3B7E5A] transition-colors`}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {firstFieldError('password') && <p className="mt-1 text-xs text-red-500 pl-1">{firstFieldError('password')}</p>}

                            {/* Password strength checklist */}
                            {password.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {PASSWORD_RULES.map(rule => {
                                        const ok = rule.test(password);
                                        return (
                                            <li key={rule.label} className={`flex items-center gap-2 text-xs ${ok ? 'text-[#3B7E5A]' : labelColor}`}>
                                                <CheckCircle2 size={12} className={ok ? 'opacity-100' : 'opacity-30'} />
                                                {rule.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Confirm password"
                                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg} ${confirm && confirm !== password ? 'border-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm(v => !v)}
                                    className={`absolute inset-y-0 right-0 pr-4 flex items-center ${iconColor} hover:text-[#3B7E5A] transition-colors`}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirm && confirm !== password && (
                                <p className="mt-1 text-xs text-red-500 pl-1">Passwords do not match.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || (confirm.length > 0 && confirm !== password)}
                            className="w-full bg-[#3B7E5A] text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-[11px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className={`mt-8 text-center text-sm ${labelColor}`}>
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#3B7E5A] font-bold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        </ProtectedRoute>
    );
}
