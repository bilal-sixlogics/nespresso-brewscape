// ContactPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown, AlertCircle, Loader2, Globe, ArrowUpRight, Navigation } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { StoreGallery } from './StoreGallery';

interface StoreImage {
    id: number;
    path: string;
    is_primary: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    store_location_id: number;
}

interface StoreLocation {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    hours: string;
    latitude: string;
    longitude: string;
    image: string;
    is_active: boolean;
    sort_order: number;
    images?: StoreImage[];
}

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-sand/10 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-center py-5 text-left group"
            >
                <span className="font-bold text-sm text-sand group-hover:text-gold transition-colors pr-4">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="text-cocoa/50 flex-shrink-0" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <p className="text-sm text-sand/60 leading-relaxed pb-5 pr-8">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MapPanel({ store, t }: { store: StoreLocation; t: (k: string) => string }) {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(store.address)}`;
    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="relative h-full min-h-[160px] rounded-2xl overflow-hidden border border-ink/10 flex flex-col items-center justify-center gap-3 group"
            style={{
                backgroundColor: '#e9e4da',
                backgroundImage:
                    'radial-gradient(rgba(26,22,20,0.08) 1px, transparent 1px), radial-gradient(rgba(26,22,20,0.08) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                backgroundPosition: '0 0, 11px 11px',
            }}
        >
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors" />
            <div className="w-11 h-11 rounded-full bg-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MapPin size={20} className="text-ink" />
            </div>
            <span className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-ink bg-sand/90 px-3 py-1.5 rounded-full">
                {t('getDirections')} <Navigation size={11} />
            </span>
        </a>
    );
}

function StoreCard({ store, index, t }: { store: StoreLocation; index: number; t: (k: string) => string }) {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(store.address)}`;
    const locationLabel = store.country ? `${store.city} - ${store.country}` : store.city;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: Math.min(index, 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-sand rounded-3xl border border-ink/10 overflow-hidden hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/30 transition-all duration-300"
        >
            <div className="p-4 pb-0">
                <StoreGallery images={store.images || []} />
            </div>

            <div className="p-6 pt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-5">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gold/90 mb-1.5 block">
                            {locationLabel}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl uppercase text-ink leading-tight">
                            {store.name}
                        </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-2.5 text-ink/55 hover:text-gold transition-colors"
                        >
                            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                            <span className="text-[12px] leading-snug">{store.address}</span>
                        </a>
                        <div className="flex items-start gap-2.5 text-ink/55">
                            <Clock size={14} className="mt-0.5 flex-shrink-0" />
                            <span className="text-[12px] leading-snug">{store.hours}</span>
                        </div>
                        <a
                            href={`tel:${store.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-2.5 text-ink/55 hover:text-gold transition-colors"
                        >
                        
                            <Phone size={14} className="flex-shrink-0" />
                            <span className="text-[12px]">{store.phone}</span>
                        </a>
                        <a
                            href={`mailto:${store.email}`}
                            className="flex items-center gap-2.5 text-ink/55 hover:text-gold transition-colors"
                        >
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="text-[12px]">{store.email}</span>
                        </a>
                    </div>

                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink text-sand text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-ink transition-all duration-200"
                    >
                        {t('getDirections')} <ArrowUpRight size={12} />
                    </a>
                </div>

                {/* <div className="lg:col-span-1">
                    <MapPanel store={store} t={t} />
                </div> */}
            </div>
        </motion.div>
    );
}

export default function ContactPage() {
    const { t } = useLanguage();
    const {
        contact_email: contactEmail,
        contact_response_time: responseTime,
    } = useSiteSettings();
    const [formState, setFormState] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const [locations, setLocations] = useState<StoreLocation[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<string>('All');

    const FAQS = [
        { q: t('contactFaqQ1'), a: t('contactFaqA1') },
        { q: t('contactFaqQ2'), a: t('contactFaqA2') },
        { q: t('contactFaqQ3'), a: t('contactFaqA3') },
        { q: t('contactFaqQ4'), a: t('contactFaqA4') },
    ];

    useEffect(() => {
        apiClient.get<{ data: StoreLocation[] }>(Endpoints.storeLocations)
            .then(res => {
                const active = (res.data ?? []).filter(l => l.is_active);
                active.sort((a, b) => a.sort_order - b.sort_order);
                setLocations(active);
            })
            .catch(() => setLocations([]))
            .finally(() => setLocationsLoading(false));
    }, []);

    const countries = ['All', ...Array.from(new Set(locations.map(l => l.country)))];

    const filteredLocations = selectedCountry === 'All'
        ? locations
        : locations.filter(l => l.country === selectedCountry);

    const handleSend = async () => {
        setSendError(null);
        if (!formState.firstName || !formState.email || !formState.message) {
            setSendError(t('contactRequiredFieldsError'));
            return;
        }
        setIsSending(true);
        try {
            await apiClient.post(Endpoints.contact, {
                name: `${formState.firstName} ${formState.lastName}`.trim(),
                email: formState.email,
                subject: formState.subject || undefined,
                message: formState.message,
            });
            setSent(true);
            setFormState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr.status === 429) {
                setSendError(t('rateLimitError'));
            } else {
                setSendError(apiErr.message ?? t('sendFailedError'));
            }
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full bg-ink text-sand grain-overlay">
            <section className="bg-ink pt-24 pb-24 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,160,90,0.12),_transparent_60%)]" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {t('contactHeroEyebrow')}
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl uppercase text-sand leading-[0.85] mb-8">
                            {t('contactHeroTitle1')}<br />
                            <span className="text-sand/40">{t('contactHeroTitle2')}</span>
                        </h1>
                        <p className="text-sand/60 text-lg max-w-lg leading-relaxed">
                            {t('contactHeroDesc')}
                        </p>
                        <div className="max-w-xs mt-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 px-8 bg-sand/5 border-y border-sand/10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cocoa mb-2 flex items-center gap-1.5">
                                <Globe size={10} />
                                {t('ourLocations')}
                            </p>
                            <h2 className="font-display text-4xl uppercase text-sand">
                                {t('findAStore')}
                            </h2>
                        </div>

                        {!locationsLoading && countries.length > 2 && (
                            <div className="flex flex-wrap gap-2">
                                {countries.map(country => (
                                    <button
                                        key={country}
                                        onClick={() => setSelectedCountry(country)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                                            selectedCountry === country
                                                ? 'bg-gold text-ink shadow-md shadow-gold/20'
                                                : 'bg-sand/8 text-sand/50 border border-sand/10 hover:border-gold/30 hover:text-gold'
                                        }`}
                                    >
                                        {country === 'All' ? t('all') : country}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {locationsLoading ? (
                        <div className="flex flex-col gap-10">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="bg-sand/8 rounded-3xl border border-sand/10 overflow-hidden animate-pulse">
                                    <div className="h-[280px] m-4 rounded-2xl bg-sand/10" />
                                    <div className="p-6 pt-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 space-y-3">
                                            <div className="h-3 w-24 bg-sand/10 rounded-full" />
                                            <div className="h-6 w-56 bg-sand/10 rounded-full" />
                                            <div className="h-3 w-full bg-sand/10 rounded-full" />
                                            <div className="h-3 w-2/3 bg-sand/10 rounded-full" />
                                        </div>
                                        <div className="h-32 bg-sand/10 rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="text-center py-20 text-cocoa">
                            <MapPin size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">{t('noStoresFoundMsg')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10">
                            {filteredLocations.map((store, i) => (
                                <StoreCard key={store.id} store={store} index={i} t={t} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="py-20 px-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8"
                    >
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cocoa mb-2">
                                {t('contactHeroEyebrow')}
                            </p>
                            <h2 className="font-display text-4xl uppercase mb-4 text-sand">{t('writeToUsHeading')}</h2>
                            <p className="text-cocoa text-sm leading-relaxed max-w-md">
                                {t('writeToUsDesc')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 p-5 bg-sand/8 rounded-2xl border border-sand/10 hover:border-gold/30 hover:shadow-md transition-all group">
                                <div className="w-11 h-11 bg-gold/15 rounded-xl flex items-center justify-center group-hover:bg-gold transition-colors flex-shrink-0">
                                    <Mail size={18} className="text-gold group-hover:text-ink transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-cocoa mb-0.5">{t('email')}</p>
                                    <p className="text-sm font-bold text-sand">{contactEmail}</p>
                                </div>
                            </a>
                            <div className="flex items-center gap-4 p-5 bg-sand/8 rounded-2xl border border-sand/10">
                                <div className="w-11 h-11 bg-gold/15 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock size={18} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-cocoa mb-0.5">{t('responseTimeLabel')}</p>
                                    <p className="text-sm font-bold text-sand">{responseTime}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-sand/8 border border-sand/10 rounded-3xl p-8 md:p-10"
                    >
                        <h2 className="font-display text-4xl uppercase mb-8 text-sand">{t('sendMessage')}</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-cocoa mb-2">{t('firstName')}</label>
                                    <input
                                        type="text"
                                        value={formState.firstName}
                                        onChange={e => setFormState(s => ({ ...s, firstName: e.target.value }))}
                                        className="w-full border-b-2 border-sand/15 py-3 focus:border-gold focus:outline-none transition-colors bg-transparent text-sm font-medium text-sand placeholder:text-sand/30"
                                        placeholder={t('placeholderFirstName')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-cocoa mb-2">{t('lastName')}</label>
                                    <input
                                        type="text"
                                        value={formState.lastName}
                                        onChange={e => setFormState(s => ({ ...s, lastName: e.target.value }))}
                                        className="w-full border-b-2 border-sand/15 py-3 focus:border-gold focus:outline-none transition-colors bg-transparent text-sm font-medium text-sand placeholder:text-sand/30"
                                        placeholder={t('placeholderLastName')}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold tracking-widest uppercase text-cocoa mb-2">{t('email')}</label>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                                    className="w-full border-b-2 border-sand/15 py-3 focus:border-gold focus:outline-none transition-colors bg-transparent text-sm font-medium text-sand placeholder:text-sand/30"
                                    placeholder={t('placeholderEmail')}
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold tracking-widest uppercase text-cocoa mb-2">{t('subjectLabel')}</label>
                                <div className="relative">
                                    <select
                                        value={formState.subject}
                                        onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))}
                                        className="w-full appearance-none border-b-2 border-sand/15 py-3 pr-8 focus:border-gold focus:outline-none transition-colors bg-transparent text-sm font-medium text-sand/70"
                                    >
                                        <option value="" className="bg-ink">{t('selectSubjectPlaceholder')}</option>
                                        <option value="order" className="bg-ink">{t('subjectOrderTracking')}</option>
                                        <option value="product" className="bg-ink">{t('subjectProductQuestion')}</option>
                                        <option value="return" className="bg-ink">{t('subjectReturnRefund')}</option>
                                        <option value="wholesale" className="bg-ink">{t('subjectWholesaleOrder')}</option>
                                        <option value="other" className="bg-ink">{t('subjectOther')}</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-cocoa pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold tracking-widest uppercase text-cocoa mb-2">{t('message')}</label>
                                <textarea
                                    rows={5}
                                    value={formState.message}
                                    onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                                    className="w-full border-b-2 border-sand/15 py-3 focus:border-gold focus:outline-none transition-colors bg-transparent resize-none text-sm font-medium text-sand placeholder:text-sand/30"
                                    placeholder={t('contactMessagePlaceholder')}
                                />
                            </div>
                            {sendError && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3">
                                    <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-xs leading-snug">{sendError}</p>
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: isSending || sent ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSend}
                                disabled={isSending || sent}
                                className={`w-full flex justify-between items-center px-8 py-5 rounded-full font-bold tracking-widest uppercase text-sm shadow-lg transition-all duration-300 disabled:cursor-not-allowed ${sent ? 'bg-sand text-ink' : 'bg-gold text-ink hover:bg-[#b8914d] shadow-gold/25 disabled:opacity-60'}`}
                            >
                                <span>{sent ? t('messageSentConfirm') : t('sendMessage')}</span>
                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-sand/5 border-t border-sand/10 grain-overlay py-20 px-8">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="font-display text-4xl uppercase text-center mb-12 text-sand">{t('faqSectionHeading')}</h2>
                    <div className="bg-sand/8 rounded-3xl border border-sand/10 px-8 py-2">
                        {FAQS.map((faq, i) => (
                            <FAQItem
                                key={i}
                                q={faq.q}
                                a={faq.a}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}