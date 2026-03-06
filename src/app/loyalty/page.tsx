"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, Zap, Coffee, Crown, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const TIERS = [
    { name: 'Espresso', icon: Coffee, min: 0, max: 499, color: 'from-amber-700 to-amber-900', badge: 'bg-amber-100 text-amber-700', desc: 'Your journey starts here' },
    { name: 'Café', icon: Star, min: 500, max: 1499, color: 'from-gray-400 to-gray-600', badge: 'bg-gray-100 text-gray-600', desc: 'Double points on weekends' },
    { name: 'Grand Crème', icon: Zap, min: 1500, max: 2999, color: 'from-yellow-400 to-yellow-600', badge: 'bg-yellow-100 text-yellow-700', desc: 'Free shipping + priority support' },
    { name: 'Barista Elite', icon: Crown, min: 3000, max: Infinity, color: 'from-sb-green to-[#2C6345]', badge: 'bg-sb-green/10 text-sb-green', desc: 'Exclusive products + VIP events' },
];

const MOCK_HISTORY = [
    { date: '2026-02-28', desc: 'Order CF-99281A', points: +120, type: 'earn' },
    { date: '2026-02-14', desc: 'Valentine\'s Bonus', points: +50, type: 'bonus' },
    { date: '2026-01-30', desc: 'Redeemed — Free Shipping', points: -100, type: 'redeem' },
    { date: '2026-01-15', desc: 'Order CF-77002B', points: +85, type: 'earn' },
    { date: '2025-12-25', desc: 'Happy Holidays Bonus', points: +200, type: 'bonus' },
];

export default function LoyaltyPage() {
    const { isAuthenticated, user } = useAuth();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    // Mock points for demo
    const mockPoints = 820;
    const currentTier = TIERS.find(t => mockPoints >= t.min && mockPoints <= t.max) ?? TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
    const progressPct = nextTier
        ? Math.min(100, ((mockPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
        : 100;

    return (
        <div className="min-h-screen bg-[#FAF9F6] pt-20">
            {/* Hero */}
            <section className="bg-sb-black pt-12 sm:pt-16 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.25),_transparent_60%)]" />
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Gift size={12} className="text-sb-green" />
                            <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase">Café Rewards</p>
                        </div>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl uppercase text-white leading-[0.85] mb-4">
                            {tx('Fidélité', 'Loyalty')}<br />
                            <span className="text-white/30">{tx('& Récompenses', '& Rewards')}</span>
                        </h1>
                        <p className="text-white/50 max-w-md text-lg">
                            {tx('Gagnez des points à chaque achat et débloquez des avantages exclusifs.', 'Earn points with every purchase and unlock exclusive perks.')}
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
                {/* Coming Soon Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-sb-green/10 to-transparent border border-sb-green/20 rounded-2xl p-4 flex items-center gap-3 mb-10"
                >
                    <Lock size={16} className="text-sb-green flex-shrink-0" />
                    <p className="text-sm font-bold text-sb-green">
                        Café Rewards is launching soon! Sign up to our newsletter to be the first to know and earn 200 bonus points on launch day.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Points Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Points Balance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`bg-gradient-to-br ${currentTier.color} rounded-[28px] p-7 text-white relative overflow-hidden shadow-2xl`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Café Rewards</p>
                                <p className="font-display text-6xl font-black mb-1">{mockPoints.toLocaleString()}</p>
                                <p className="text-sm font-bold opacity-70 mb-6">points</p>
                                <div className="flex items-center gap-2">
                                    <currentTier.icon size={14} />
                                    <span className="text-sm font-black">{currentTier.name}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tier Progress */}
                        {nextTier && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm"
                            >
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Progress to {nextTier.name}</p>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-sb-green rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                                    <span>{mockPoints} pts</span>
                                    <span>{nextTier.min} pts needed</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    {nextTier.min - mockPoints} more points to reach <span className="font-bold text-sb-black">{nextTier.name}</span>
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Tiers + History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tiers */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <h2 className="font-display text-2xl uppercase text-sb-black mb-4">Reward Tiers</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {TIERS.map((tier, i) => {
                                    const Icon = tier.icon;
                                    const isActive = tier.name === currentTier.name;
                                    return (
                                        <div
                                            key={tier.name}
                                            className={`p-5 rounded-2xl border-2 transition-all ${isActive ? 'border-sb-green bg-sb-green/5' : 'border-gray-100 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tier.badge}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm">{tier.name}</p>
                                                    <p className="text-[9px] text-gray-400">{tier.min === 0 ? '0' : `${tier.min.toLocaleString()}`}{tier.max === Infinity ? '+' : `–${tier.max.toLocaleString()}`} pts</p>
                                                </div>
                                                {isActive && <span className="ml-auto text-[8px] font-black text-sb-green uppercase bg-sb-green/10 px-2 py-0.5 rounded-full">Current</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{tier.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* History */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h2 className="font-display text-2xl uppercase text-sb-black mb-4">Points History</h2>
                            <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
                                {MOCK_HISTORY.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <p className="font-bold text-sm text-sb-black">{item.desc}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <span className={`font-black text-base ${item.points > 0 ? 'text-sb-green' : 'text-red-400'}`}>
                                            {item.points > 0 ? '+' : ''}{item.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
