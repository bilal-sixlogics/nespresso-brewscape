"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown, AlertCircle, Loader2, Globe } from 'lucide-react';
import { AppConfig } from '@/lib/config';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── Static data ──────────────────────────────────────────────────────────────

const FAQS = [
    {
        q: { fr: 'Quels sont vos horaires d\'ouverture ?', en: 'What are your opening hours?' },
        a: { fr: 'Les horaires varient selon la boutique. Consultez la page de chaque boutique pour les horaires locaux.', en: 'Hours vary by location. Check each store\'s page for local opening times.' },
    },
    {
        q: { fr: 'Proposez-vous la livraison à domicile ?', en: 'Do you offer home delivery?' },
        a: { fr: 'Oui, nous livrons dans le monde entier. Livraison standard offerte dès 100€.', en: 'Yes, we ship worldwide. Free standard shipping from €100.' },
    },
    {
        q: { fr: 'Puis-je retourner un produit ?', en: 'Can I return a product?' },
        a: { fr: 'Tout produit non ouvert peut être retourné sous 14 jours. Contactez-nous pour initier un retour.', en: 'Any unopened product can be returned within 14 days. Contact us to initiate a return.' },
    },
    {
        q: { fr: 'Avez-vous un programme de fidélité ?', en: 'Do you have a loyalty program?' },
        a: { fr: 'Nous lançons bientôt Cafrezzo+. Inscrivez-vous à notre newsletter pour être le premier informé.', en: 'We are launching Cafrezzo+ soon. Sign up to our newsletter to be the first to know.' },
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-center py-5 text-left group"
            >
                <span className="font-bold text-sm text-sb-black group-hover:text-sb-green transition-colors pr-4">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="text-gray-300 flex-shrink-0" />
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
                        <p className="text-sm text-gray-500 leading-relaxed pb-5">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StoreCard({ store }: { store: StoreLocation }) {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(store.address)}`;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-sb-green/20 transition-all duration-300 group"
        >
            {/* Image */}
            <div className="h-44 overflow-hidden bg-gray-50 relative">
                <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/80 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                        {store.city}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                <h3 className="font-bold text-sm text-sb-black leading-tight">{store.name}</h3>

                <div className="space-y-2">
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2 text-gray-400 hover:text-sb-green transition-colors group/link"
                    >
                        <MapPin size={13} className="mt-0.5 flex-shrink-0 group-hover/link:text-sb-green" />
                        <span className="text-[11px] leading-snug">{store.address}</span>
                    </a>
                    <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-gray-400 hover:text-sb-green transition-colors">
                        <Phone size={13} className="flex-shrink-0" />
                        <span className="text-[11px]">{store.phone}</span>
                    </a>
                    <a href={`mailto:${store.email}`} className="flex items-center gap-2 text-gray-400 hover:text-sb-green transition-colors">
                        <Mail size={13} className="flex-shrink-0" />
                        <span className="text-[11px]">{store.email}</span>
                    </a>
                    <div className="flex items-start gap-2 text-gray-400">
                        <Clock size={13} className="mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] leading-snug">{store.hours}</span>
                    </div>
                </div>

                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full mt-2 py-2.5 rounded-full border-2 border-sb-green/20 text-sb-green text-[10px] font-black uppercase tracking-widest text-center hover:bg-sb-green hover:text-white transition-all duration-200"
                >
                    Get Directions
                </a>
            </div>
        </motion.div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
    const { language } = useLanguage();
    const [formState, setFormState] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // Store locations state
    const [locations, setLocations] = useState<StoreLocation[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<string>('All');

    const t = (fr: string, en: string) => language === 'fr' ? fr : en;

    // Fetch store locations from API
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

    // Derive countries list
    const countries = ['All', ...Array.from(new Set(locations.map(l => l.country)))];

    const filteredLocations = selectedCountry === 'All'
        ? locations
        : locations.filter(l => l.country === selectedCountry);

    const handleSend = async () => {
        setSendError(null);
        if (!formState.firstName || !formState.email || !formState.message) {
            setSendError(t('Veuillez remplir tous les champs obligatoires.', 'Please fill in all required fields.'));
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
                setSendError(t('Trop de tentatives. Réessayez dans quelques minutes.', 'Too many attempts. Please try again in a few minutes.'));
            } else {
                setSendError(apiErr.message ?? t('Erreur lors de l\'envoi. Réessayez.', 'Failed to send. Please try again.'));
            }
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full bg-sb-white text-sb-black">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-sb-green pt-24 pb-40 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <p className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {t('Nous contacter', 'Get in Touch')}
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-8">
                            {t('Contact', 'Contact')}<br />
                            <span className="text-white/40">{t('& Boutiques', '& Boutiques')}</span>
                        </h1>
                        <p className="text-white/70 text-lg max-w-lg">
                            {t('Notre équipe est à votre écoute. Visitez-nous ou envoyez-nous un message — nous répondons sous 24h.', 'Our team is here for you. Visit us or send a message — we reply within 24h.')}
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            {/* ── Store Locations ──────────────────────────────── */}
            <section className="py-20 px-8 bg-gray-50/50">
                <div className="max-w-[1400px] mx-auto">
                    {/* Section header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 flex items-center gap-1.5">
                                <Globe size={10} />
                                {t('Nos boutiques', 'Our Stores')}
                            </p>
                            <h2 className="font-display text-4xl uppercase">
                                {t('Trouvez-nous', 'Find a Store')}
                            </h2>
                        </div>

                        {/* Country filter tabs */}
                        {!locationsLoading && countries.length > 2 && (
                            <div className="flex flex-wrap gap-2">
                                {countries.map(country => (
                                    <button
                                        key={country}
                                        onClick={() => setSelectedCountry(country)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                                            selectedCountry === country
                                                ? 'bg-sb-green text-white shadow-md shadow-sb-green/20'
                                                : 'bg-white text-gray-400 border border-gray-100 hover:border-sb-green/30 hover:text-sb-green'
                                        }`}
                                    >
                                        {country === 'All' ? t('Tous', 'All') : country}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Grid */}
                    {locationsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl border border-gray-100 h-72 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <MapPin size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">{t('Aucune boutique trouvée', 'No stores found')}</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedCountry}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {filteredLocations.map(store => (
                                    <StoreCard key={store.id} store={store} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </section>

            {/* ── Contact Form ─────────────────────────────────── */}
            <section className="py-20 px-8 border-t border-gray-100">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8"
                    >
                        <div>
                            <h2 className="font-display text-4xl uppercase mb-4">{t('Nous écrire', 'Write to Us')}</h2>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                                {t(
                                    'Vous avez une question, une demande spéciale ou souhaitez nous faire part de vos impressions ? Notre équipe vous répond sous 24h.',
                                    'Have a question, special request, or just want to share your thoughts? Our team replies within 24h.'
                                )}
                            </p>
                        </div>

                        {/* Contact cards */}
                        <div className="space-y-4">
                            <a href="mailto:contact@cafrezzo.com" className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-sb-green/30 hover:shadow-md transition-all group">
                                <div className="w-11 h-11 bg-sb-green/10 rounded-xl flex items-center justify-center group-hover:bg-sb-green transition-colors">
                                    <Mail size={18} className="text-sb-green group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Email</p>
                                    <p className="text-sm font-bold">contact@cafrezzo.com</p>
                                </div>
                            </a>
                            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                                <div className="w-11 h-11 bg-sb-green/10 rounded-xl flex items-center justify-center">
                                    <Clock size={18} className="text-sb-green" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{t('Délai de réponse', 'Response time')}</p>
                                    <p className="text-sm font-bold">{t('Sous 24h ouvrées', 'Within 24 business hours')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Business info */}
                        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">SIRET</p>
                                <p className="text-sm font-mono font-bold">84126359500010</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">N° TVA</p>
                                <p className="text-sm font-mono font-bold">FR39841263595</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('Marque', 'Brand')}</p>
                                <p className="text-sm font-bold">{AppConfig.brand.name}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-display text-4xl uppercase mb-8">{t('Envoyer un message', 'Send a Message')}</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('Prénom', 'First Name')}</label>
                                    <input
                                        type="text"
                                        value={formState.firstName}
                                        onChange={e => setFormState(s => ({ ...s, firstName: e.target.value }))}
                                        className="w-full border-b-2 border-gray-100 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent text-sm font-medium placeholder:text-gray-300"
                                        placeholder="Marie"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('Nom', 'Last Name')}</label>
                                    <input
                                        type="text"
                                        value={formState.lastName}
                                        onChange={e => setFormState(s => ({ ...s, lastName: e.target.value }))}
                                        className="w-full border-b-2 border-gray-100 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent text-sm font-medium placeholder:text-gray-300"
                                        placeholder="Dupont"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                                    className="w-full border-b-2 border-gray-100 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent text-sm font-medium placeholder:text-gray-300"
                                    placeholder="marie@exemple.fr"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('Sujet', 'Subject')}</label>
                                <select
                                    value={formState.subject}
                                    onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))}
                                    className="w-full border-b-2 border-gray-100 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent text-sm font-medium text-gray-600"
                                >
                                    <option value="">{t('Choisir un sujet', 'Select a subject')}</option>
                                    <option value="order">{t('Suivi de commande', 'Order tracking')}</option>
                                    <option value="product">{t('Question produit', 'Product question')}</option>
                                    <option value="return">{t('Retour / remboursement', 'Return / refund')}</option>
                                    <option value="wholesale">{t('Commande professionnelle', 'Professional order')}</option>
                                    <option value="other">{t('Autre', 'Other')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('Message', 'Message')}</label>
                                <textarea
                                    rows={5}
                                    value={formState.message}
                                    onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                                    className="w-full border-b-2 border-gray-100 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent resize-none text-sm font-medium placeholder:text-gray-300"
                                    placeholder={t('Votre message...', 'Your message...')}
                                />
                            </div>
                            {sendError && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                                    <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-xs leading-snug">{sendError}</p>
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: isSending || sent ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSend}
                                disabled={isSending || sent}
                                className={`w-full flex justify-between items-center px-8 py-5 rounded-full font-bold tracking-widest uppercase text-sm shadow-lg transition-all duration-300 disabled:cursor-not-allowed ${sent ? 'bg-sb-black text-white' : 'bg-sb-green text-white hover:bg-[#2C6345] shadow-sb-green/25 disabled:opacity-60'}`}
                            >
                                <span>{sent ? t('Message envoyé ✓', 'Message Sent ✓') : t('Envoyer le message', 'Send Message')}</span>
                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────── */}
            <section className="bg-white py-20 px-8 border-t border-gray-100">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="font-display text-4xl uppercase text-center mb-12">{t('Questions fréquentes', 'Frequently Asked Questions')}</h2>
                    <div className="bg-gray-50 rounded-3xl border border-gray-100 px-8 py-2">
                        {FAQS.map((faq, i) => (
                            <FAQItem
                                key={i}
                                q={language === 'fr' ? faq.q.fr : faq.q.en}
                                a={language === 'fr' ? faq.a.fr : faq.a.en}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
