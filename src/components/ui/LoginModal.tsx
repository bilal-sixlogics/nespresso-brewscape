"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User as UserIcon, CheckCircle2, Phone as PhoneIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/translations';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import Link from 'next/link';

function usePasswordRules(t: (key: TranslationKey) => string) {
    return [
        { label: t('authPwMin'), test: (p: string) => p.length >= 8 },
        { label: t('authPwUpper'), test: (p: string) => /[A-Z]/.test(p) },
        { label: t('authPwLower'), test: (p: string) => /[a-z]/.test(p) },
        { label: t('authPwNumber'), test: (p: string) => /[0-9]/.test(p) },
    ];
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

type RegisterStep = 'form' | 'otp' | 'verified';

export function LoginModal() {
    const { isLoginModalOpen, closeLoginModal, login, register } = useAuth();
    const { language, t } = useLanguage();
    const passwordRules = usePasswordRules(t);
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirm, setConfirm] = useState('');
    const [phone, setPhone] = useState('');

    // OTP state
    const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [verificationToken, setVerificationToken] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [resendSuccess, setResendSuccess] = useState(false);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const reset = () => {
        setEmail(''); setPassword(''); setName(''); setConfirm(''); setPhone('');
        setError(null); setFieldErrors({}); setShowPassword(false); setShowConfirm(false);
        setRegisterStep('form'); setOtpDigits(Array(OTP_LENGTH).fill(''));
        setVerificationToken(''); setResendTimer(0); setOtpError(null);
        setResendSuccess(false);
    };

    const switchView = (v: 'login' | 'register') => { reset(); setView(v); };

    const handleClose = () => {
        reset();
        setView('login');
        closeLoginModal();
    };

    // ── Login submit ──
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsLoading(true);
        try {
            await login(email, password);
            reset();
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr.errors) setFieldErrors(apiErr.errors);
            else setError(apiErr.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Send OTP ──
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsLoading(true);
        try {
            await apiClient.post(Endpoints.sendOtp, { email, name, locale: (['en', 'fr', 'ar'].includes(language) ? language : 'fr') });
            setRegisterStep('otp');
            setResendTimer(RESEND_COOLDOWN);
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr.status === 422 && (apiErr as ApiError & { email_exists?: boolean }).email_exists) {
                setError(t('authEmailRegistered'));
            } else if (apiErr.errors) {
                setFieldErrors(apiErr.errors);
            } else {
                setError(apiErr.message ?? t('authSendError'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── OTP digit handling ──
    const handleOtpDigitChange = useCallback((index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        setOtpDigits(prev => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        setOtpError(null);
        if (digit && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    }, []);

    const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    }, [otpDigits]);

    const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pasted.length > 0) {
            const newDigits = Array(OTP_LENGTH).fill('');
            for (let i = 0; i < pasted.length; i++) {
                newDigits[i] = pasted[i];
            }
            setOtpDigits(newDigits);
            setOtpError(null);
            const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
            otpInputRefs.current[focusIndex]?.focus();
        }
    }, []);

    // ── Verify OTP → then register ──
    const handleVerifyOtp = async () => {
        const otpCode = otpDigits.join('');
        if (otpCode.length !== OTP_LENGTH) return;
        setIsVerifyingOtp(true);
        setOtpError(null);
        try {
            const res = await apiClient.post<{ message: string; verification_token: string }>(
                Endpoints.verifyOtp, { email, otp: otpCode }
            );
            setVerificationToken(res.verification_token);
            setRegisterStep('verified');
            // Auto-register
            await register(name, email, password, confirm, phone || undefined, res.verification_token);
            reset();
        } catch (err) {
            const apiErr = err as ApiError;
            setOtpError(apiErr.message ?? t('authOtpError'));
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // ── Resend OTP ──
    const handleResendOtp = async () => {
        if (resendTimer > 0 || isResendingOtp) return;
        setIsResendingOtp(true);
        setOtpError(null);
        setResendSuccess(false);
        try {
            await apiClient.post(Endpoints.resendOtp, { email, name, locale: (['en', 'fr', 'ar'].includes(language) ? language : 'fr') });
            setResendTimer(RESEND_COOLDOWN);
            setResendSuccess(true);
            setOtpDigits(Array(OTP_LENGTH).fill(''));
            otpInputRefs.current[0]?.focus();
        } catch (err) {
            const apiErr = err as ApiError;
            setOtpError(apiErr.message ?? t('authResendError'));
        } finally {
            setIsResendingOtp(false);
        }
    };

    const firstFieldError = (key: string) => fieldErrors[key]?.[0];
    const otpComplete = otpDigits.join('').length === OTP_LENGTH;
    const allPasswordRulesPassed = passwordRules.every(r => r.test(password));
    const canSendOtp = !!(name && email && password && confirm && confirm === password && allPasswordRulesPassed);

    if (!isLoginModalOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
                >
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <img src="/assets/logo.svg" alt="Cafrezzo" className="h-8" />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="font-display text-3xl uppercase tracking-tight text-gray-900 mb-2">
                                {view === 'login' ? t('authWelcomeBack') : registerStep === 'otp' ? t('authVerifyEmail') : t('authCreateAccount')}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {view === 'login'
                                    ? t('authLoginSubtitle')
                                    : registerStep === 'otp'
                                    ? <>{t('authOtpSubtitle')} <span className="font-bold text-gray-700">{email}</span>.</>
                                    : t('authRegisterSubtitle')}
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

                        <AnimatePresence mode="wait">
                            {view === 'login' ? (
                                <motion.form
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleLoginSubmit}
                                    className="space-y-4"
                                >
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
                                            placeholder={t('authEmailAddress')}
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
                                            placeholder={t('authPassword')}
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
                                            onClick={handleClose}
                                            className="text-xs text-[#3B7E5A] hover:underline font-semibold"
                                        >
                                            {t('authForgotPassword')}
                                        </Link>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#3B7E5A] text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : t('authSignIn')}
                                    </button>
                                </motion.form>
                            ) : registerStep === 'form' ? (
                                <motion.form
                                    key="register-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSendOtp}
                                    className="space-y-4"
                                >
                                    {/* Name */}
                                    <div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <UserIcon size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                autoComplete="name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder={t('authFullName')}
                                                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm ${firstFieldError('name') ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {firstFieldError('name') && <p className="mt-1 text-xs text-red-500 pl-1">{firstFieldError('name')}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
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
                                                placeholder={t('authEmailAddress')}
                                                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm ${firstFieldError('email') ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {firstFieldError('email') && <p className="mt-1 text-xs text-red-500 pl-1">{firstFieldError('email')}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <PhoneIcon size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder={t('authPhone')}
                                                autoComplete="tel"
                                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                autoComplete="new-password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder={t('authPassword')}
                                                className={`w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm ${firstFieldError('password') ? 'border-red-500' : ''}`}
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
                                        {firstFieldError('password') && <p className="mt-1 text-xs text-red-500 pl-1">{firstFieldError('password')}</p>}

                                        {/* Password strength */}
                                        {password.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {passwordRules.map(rule => {
                                                    const ok = rule.test(password);
                                                    return (
                                                        <li key={rule.label} className={`flex items-center gap-2 text-xs ${ok ? 'text-[#3B7E5A]' : 'text-gray-400'}`}>
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
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                required
                                                autoComplete="new-password"
                                                value={confirm}
                                                onChange={e => setConfirm(e.target.value)}
                                                placeholder={t('authConfirmPassword')}
                                                className={`w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 outline-none transition-all text-sm ${confirm && confirm !== password ? 'border-red-500' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowConfirm(v => !v)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#3B7E5A] transition-colors"
                                            >
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {confirm && confirm !== password && (
                                            <p className="mt-1 text-xs text-red-500 pl-1">{t('authPasswordsMismatch')}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !canSendOtp}
                                        className="w-full bg-[#3B7E5A] text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : t('authSendCode')}
                                    </button>
                                </motion.form>
                            ) : (
                                /* OTP step (covers both 'otp' and 'verified') */
                                <motion.div
                                    key="register-otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* OTP error */}
                                    {otpError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-200 text-red-600 text-sm"
                                        >
                                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                            <span>{otpError}</span>
                                        </motion.div>
                                    )}

                                    {/* Resend success */}
                                    {resendSuccess && !otpError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 p-4 rounded-xl bg-[#3B7E5A]/10 border border-[#3B7E5A]/20 text-[#3B7E5A] text-sm"
                                        >
                                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                            <span>{t('authCodeSent')}</span>
                                        </motion.div>
                                    )}

                                    {/* OTP Digit Inputs */}
                                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                        {otpDigits.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => { otpInputRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpDigitChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                                                    ${digit ? 'border-[#3B7E5A] bg-[#3B7E5A]/5' : 'border-gray-200 bg-gray-50'}
                                                    focus:border-[#3B7E5A] focus:ring-2 focus:ring-[#3B7E5A]/20 focus:bg-white`}
                                            />
                                        ))}
                                    </div>

                                    {/* Verify Button */}
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={!otpComplete || isVerifyingOtp}
                                        className="w-full bg-[#3B7E5A] text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#2C6345] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isVerifyingOtp ? <Loader2 size={16} className="animate-spin" /> : t('authVerifyCreate')}
                                    </button>

                                    {/* Resend */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-1">{t('authDidntReceive')}</p>
                                        {resendTimer > 0 ? (
                                            <p className="text-sm text-gray-400">
                                                {t('authResendIn')} <span className="font-bold text-gray-600">{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleResendOtp}
                                                disabled={isResendingOtp}
                                                className="text-sm font-bold text-[#3B7E5A] hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isResendingOtp ? t('authSending') : t('authResendCode')}
                                            </button>
                                        )}
                                    </div>

                                    {/* Back to form */}
                                    <button
                                        onClick={() => { setRegisterStep('form'); setOtpError(null); setResendSuccess(false); setOtpDigits(Array(OTP_LENGTH).fill('')); }}
                                        className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {t('authBackToForm')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 text-center text-sm text-gray-500">
                            {view === 'login' ? (
                                <>
                                    {t('authNoAccount')}{' '}
                                    <button onClick={() => switchView('register')} className="text-[#3B7E5A] font-bold hover:underline">
                                        {t('authSignUp')}
                                    </button>
                                </>
                            ) : registerStep === 'form' ? (
                                <>
                                    {t('authHaveAccount')}{' '}
                                    <button onClick={() => switchView('login')} className="text-[#3B7E5A] font-bold hover:underline">
                                        {t('authLogIn')}
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
