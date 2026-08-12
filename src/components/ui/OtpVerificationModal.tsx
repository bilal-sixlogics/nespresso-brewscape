"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ApiError } from '@/lib/api/types';

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: () => void;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    email: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function OtpVerificationModal({ isOpen, onClose, onVerified, onVerify, onResend, email }: OtpVerificationModalProps) {
    const { t } = useLanguage();
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [resendSuccess, setResendSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Portals require a DOM node — only available once mounted on the client.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (!isOpen) return;
        setResendTimer(RESEND_COOLDOWN);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Focus first input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setDigits(Array(OTP_LENGTH).fill(''));
            setError(null);
            setResendSuccess(false);
        }
    }, [isOpen]);

    const handleDigitChange = useCallback((index: number, value: string) => {
        // Only allow single digits
        const digit = value.replace(/\D/g, '').slice(-1);
        setDigits(prev => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        setError(null);

        // Auto-focus next input
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }, []);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }, [digits]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pasted.length > 0) {
            const newDigits = Array(OTP_LENGTH).fill('');
            for (let i = 0; i < pasted.length; i++) {
                newDigits[i] = pasted[i];
            }
            setDigits(newDigits);
            setError(null);
            // Focus the next empty input or the last one
            const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    }, []);

    const otpCode = digits.join('');
    const isComplete = otpCode.length === OTP_LENGTH;

    const handleVerify = async () => {
        if (!isComplete) return;
        setIsVerifying(true);
        setError(null);
        try {
            await onVerify(otpCode);
            onVerified();
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? t('authOtpError'));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || isResending) return;
        setIsResending(true);
        setError(null);
        setResendSuccess(false);
        try {
            await onResend();
            setResendTimer(RESEND_COOLDOWN);
            setResendSuccess(true);
            setDigits(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
            // Start countdown again
            const interval = setInterval(() => {
                setResendTimer(prev => {
                    if (prev <= 1) { clearInterval(interval); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message ?? t('authResendError'));
        } finally {
            setIsResending(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-sand rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-ink/40 hover:text-ink transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gold/15 flex items-center justify-center">
                                <Mail size={28} className="text-gold" />
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-8">
                            <h2 className="font-display text-3xl uppercase tracking-tight text-ink mb-2">
                                {t('authVerifyEmail')}
                            </h2>
                            <p className="text-sm text-ink/60">
                                {t('authOtpSubtitle')}{' '}
                                <span className="font-bold text-ink/80">{email}</span>.
                                {' '}{t('authOtpInstructions')}
                            </p>
                        </div>

                        {/* Error */}
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

                        {/* Resend success */}
                        {resendSuccess && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm"
                            >
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                <span>{t('authCodeSent')}</span>
                            </motion.div>
                        )}

                        {/* OTP Digit Inputs */}
                        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                            {digits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleDigitChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none text-ink
                                        ${digit ? 'border-gold bg-gold/5' : 'border-ink/10 bg-ink/5'}
                                        focus:border-gold focus:ring-2 focus:ring-gold/20 focus:bg-sand`}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerify}
                            disabled={!isComplete || isVerifying}
                            className="w-full bg-gold text-ink rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#b8914d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mb-6"
                        >
                            {isVerifying ? <Loader2 size={16} className="animate-spin" /> : t('authVerifyButton')}
                        </button>

                        {/* Resend */}
                        <div className="text-center">
                            <p className="text-sm text-ink/60 mb-1">{t('authDidntReceive')}</p>
                            {resendTimer > 0 ? (
                                <p className="text-sm text-ink/50">
                                    {t('authResendIn')} <span className="font-bold text-ink/70">{resendTimer}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-sm font-bold text-gold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isResending ? t('authSending') : t('authResendCode')}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
