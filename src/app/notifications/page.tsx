"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, Tag, Settings, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { useLanguage } from '@/context/LanguageContext';
import { CupSeparator } from '@/components/ui/CupSeparator';

const TYPE_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    order: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Order Update' },
    promo: { icon: Tag, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Promotion' },
    system: { icon: Settings, color: 'text-cocoa', bg: 'bg-sand/10', label: 'System' },
};

export default function NotificationsPage() {
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    return (
        <div className="min-h-screen bg-ink text-sand pt-20 grain-overlay">
            {/* Hero */}
            <section className="bg-ink pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,160,90,0.15),_transparent_60%)]" />
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Bell size={12} className="text-gold" />
                            <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase">{tx('Centre de Notifications', 'Notification Center')}</p>
                        </div>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl uppercase text-sand leading-[0.85] mb-4">
                            {tx('Notifications', 'Notifications')}
                        </h1>
                        <p className="text-sand/50 text-lg">
                            {unreadCount > 0
                                ? tx(`${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`, `${unreadCount} unread`)
                                : tx('Tout est à jour.', 'All caught up.')}
                        </p>
                        <div className="max-w-xs mt-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
                {/* Actions Bar */}
                {unreadCount > 0 && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 text-sm font-bold text-gold hover:underline"
                        >
                            <CheckCheck size={14} />
                            {tx('Tout marquer comme lu', 'Mark all as read')}
                        </button>
                    </div>
                )}

                {/* Empty */}
                {notifications.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                        <div className="w-20 h-20 bg-sand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={32} className="text-cocoa/50" />
                        </div>
                        <h2 className="font-display text-3xl uppercase mb-3 text-sand">{tx('Rien pour le moment', 'Nothing here yet')}</h2>
                        <p className="text-cocoa text-sm">{tx('Vos notifications apparaîtront ici.', 'Your notifications will appear here.')}</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n, i) => {
                            const meta = TYPE_META[n.type] || TYPE_META.system;
                            const Icon = meta.icon;
                            return (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => markRead(n.id)}
                                    className={`flex items-start gap-4 p-5 rounded-[20px] border transition-all cursor-pointer hover:shadow-md ${!n.isRead ? 'bg-sand/10 border-gold/30 shadow-sm' : 'bg-sand/5 border-sand/10'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                        <Icon size={18} className={meta.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`font-bold text-sm ${n.isRead ? 'text-sand/60' : 'text-sand'}`}>{n.title}</p>
                                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />}
                                        </div>
                                        <p className="text-xs text-sand/60 mb-2 leading-relaxed">{n.body}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                                            <span className="text-[9px] text-sand/30">
                                                {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    {n.href && (
                                        <Link
                                            href={n.href}
                                            onClick={e => e.stopPropagation()}
                                            className="text-[9px] font-bold text-gold uppercase tracking-widest hover:underline flex-shrink-0 mt-1"
                                        >
                                            View →
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
