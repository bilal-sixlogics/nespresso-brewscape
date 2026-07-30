"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await apiClient.post(Endpoints.forgotPassword, { email });
            setSent(true);
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const pageBg = 'bg-ink grain-overlay';
    const surface = 'bg-sand border-ink/10';
    const inputBg = 'bg-ink/5 border-ink/10 text-ink placeholder-ink/30 focus:border-gold focus:ring-gold/20';
    const labelColor = 'text-ink/60';
    const headingColor = 'text-ink';
    const iconColor = 'text-ink/30';

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
                        <span className="font-display text-2xl uppercase tracking-widest text-gold">Cafrezzo</span>
                    </Link>
                    <h1 className={`mt-4 font-display text-3xl uppercase tracking-tight ${headingColor}`}>
                        Reset Password
                    </h1>
                    <p className={`mt-2 text-sm ${labelColor}`}>
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4 text-center py-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-gold" />
                        </div>
                        <p className={`text-sm ${labelColor}`}>
                            If an account exists for <strong className={headingColor}>{email}</strong>, a reset link has been sent. Check your inbox.
                        </p>
                        <Link href="/login" className="text-gold font-bold text-sm hover:underline">
                            Back to sign in
                        </Link>
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
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border focus:ring-2 outline-none transition-all text-sm ${inputBg}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gold text-ink rounded-xl py-3.5 font-black uppercase tracking-widest text-[11px] hover:bg-[#b8914d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className={`mt-8 text-center text-sm ${labelColor}`}>
                            <Link href="/login" className="text-gold font-bold hover:underline">
                                Back to sign in
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
