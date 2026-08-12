"use client";

import React, { useState, Suspense } from 'react';
import Link from '@/components/LocaleLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { ApiError } from '@/lib/api/types';

function LoginForm() {
    const { login } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') ?? '/account';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            router.replace(redirect);
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? t('authGenericError'));
        } finally {
            setIsLoading(false);
        }
    };

    const surface = 'bg-sand border-ink/10';
    const inputBg = 'bg-ink/5 border-ink/10 text-ink placeholder-ink/30 focus:border-gold focus:ring-gold/20';
    const labelColor = 'text-ink/60';
    const headingColor = 'text-ink';
    const iconColor = 'text-ink/30';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`w-full max-w-md mx-auto rounded-3xl border shadow-xl p-8 ${surface}`}
        >
            {/* Logo / Brand */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <span className="font-display text-2xl uppercase tracking-widest text-gold">Cafrezzo</span>
                </Link>
                <h1 className={`mt-4 font-display text-3xl uppercase tracking-tight ${headingColor}`}>
                    {t('authWelcomeBack')}
                </h1>
                <p className={`mt-2 text-sm ${labelColor}`}>
                    {t('authLoginSubtitle')}
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
                {/* Email */}
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
                        placeholder={t('authEmailAddress')}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg}`}
                    />
                </div>

                {/* Password */}
                <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                        <Lock size={18} />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={t('authPassword')}
                        className={`w-full pl-11 pr-11 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg}`}
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        className={`absolute inset-y-0 right-0 pr-4 flex items-center ${iconColor} hover:text-gold transition-colors`}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Forgot password */}
                <div className="text-right">
                    <Link
                        href="/forgot-password"
                        className="text-xs text-gold hover:underline font-semibold"
                    >
                        {t('authForgotPassword')}
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gold text-ink rounded-xl py-3.5 font-black uppercase tracking-widest text-[11px] hover:bg-[#b8914d] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : t('authSignIn')}
                </button>
            </form>

            <div className={`mt-8 text-center text-sm ${labelColor}`}>
                {t('authNoAccount')}{' '}
                <Link href="/register" className="text-gold font-bold hover:underline">
                    {t('authSignUp')}
                </Link>
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <ProtectedRoute requireGuest>
            <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-ink grain-overlay">
                <Suspense fallback={
                    <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin text-gold" size={48} />
                    </div>
                }>
                    <LoginForm />
                </Suspense>
            </div>
        </ProtectedRoute>
    );
}
