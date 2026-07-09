"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';

function ResetPasswordContent() {
    const { isDark } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post(Endpoints.resetPassword, {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setDone(true);
            setTimeout(() => router.push('/login'), 2500);
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? 'This reset link is invalid or has expired. Please request a new one.');
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

    const missingLinkParams = !token || !email;

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-16 ${pageBg}`}>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`w-full max-w-md mx-auto rounded-3xl border shadow-xl p-8 ${surface}`}
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="font-display text-2xl uppercase tracking-widest text-[#3B7E5A]">Cafrezzo</span>
                    </Link>
                    <h1 className={`mt-4 font-display text-3xl uppercase tracking-tight ${headingColor}`}>
                        Set New Password
                    </h1>
                    <p className={`mt-2 text-sm ${labelColor}`}>
                        Choose a new password for <strong className={headingColor}>{email || 'your account'}</strong>.
                    </p>
                </div>

                {missingLinkParams ? (
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <p className={`text-sm ${labelColor}`}>
                            This reset link is missing required information. Please request a new one.
                        </p>
                        <Link href="/forgot-password" className="text-[#3B7E5A] font-bold text-sm hover:underline">
                            Request a new link
                        </Link>
                    </div>
                ) : done ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4 text-center py-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#3B7E5A]/10 flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-[#3B7E5A]" />
                        </div>
                        <p className={`text-sm ${labelColor}`}>
                            Your password has been reset. Redirecting you to sign in&hellip;
                        </p>
                    </motion.div>
                ) : (
                    <>
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
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="New password"
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg}`}
                                />
                            </div>
                            <div className="relative">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${iconColor}`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={passwordConfirmation}
                                    onChange={e => setPasswordConfirmation(e.target.value)}
                                    placeholder="Confirm new password"
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#3B7E5A] text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-[11px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>

                        <div className={`mt-8 text-center text-sm ${labelColor}`}>
                            <Link href="/login" className="text-[#3B7E5A] font-bold hover:underline">
                                Back to sign in
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#3B7E5A]" size={32} /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
