"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown } from 'lucide-react';
import { AppConfig } from '@/lib/config';

const FAQS = [
    {
        q: { fr: 'Quels sont vos horaires d\'ouverture ?', en: 'What are your opening hours?' },
        a: { fr: 'Nous sommes ouverts du lundi au samedi de 9h à 19h et le dimanche de 10h à 17h.', en: 'We are open Monday to Saturday 9am–7pm and Sunday 10am–5pm.' },
    },
    {
        q: { fr: 'Proposez-vous la livraison à domicile ?', en: 'Do you offer home delivery?' },
        a: { fr: 'Oui, nous livrons en France métropolitaine sous 2–3 jours ouvrés. Livraison offerte dès 150€.', en: 'Yes, we deliver across mainland France in 2–3 business days. Free shipping from €150.' },
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

export default function ContactPage() {
    const { language } = useLanguage();
    const [formState, setFormState] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const t = (fr: string, en: string) => language === 'fr' ? fr : en;

    const contactInfo = [
        {
            icon: MapPin,
            label: t('Adresse', 'Address'),
            value: '16 Boulevard du Général de Gaulle\n95200 Sarcelles, France',
            link: 'https://maps.google.com/?q=16+Boulevard+du+Général+de+Gaulle+95200+Sarcelles',
        },
        {
            icon: Phone,
            label: t('Téléphone', 'Phone'),
            value: '+33 1 34 19 62 10',
            link: 'tel:+33134196210',
        },
        {
            icon: Mail,
            label: 'Email',
            value: 'contact@cafrezzo.com',
            link: 'mailto:contact@cafrezzo.com',
        },
        {
            icon: Clock,
            label: t('Horaires', 'Hours'),
            value: t('Lun–Sam : 9h–19h\nDim : 10h–17h', 'Mon–Sat: 9am–7pm\nSun: 10am–5pm'),
        },
    ];

    const handleSend = () => {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
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

            {/* ── Contact Info Strip ───────────────────────────── */}
            <section className="bg-white border-b border-gray-100 py-14 px-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {contactInfo.map((item, i) => {
                        const Icon = item.icon;
                        const content = (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center text-center p-6 rounded-3xl border border-gray-100 hover:border-sb-green/30 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 bg-sb-green/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-sb-green group-hover:text-white transition-all duration-300">
                                    <Icon size={22} className="text-sb-green group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                                <p className="text-sm font-medium text-sb-black whitespace-pre-line leading-relaxed">{item.value}</p>
                            </motion.div>
                        );
                        return item.link ? (
                            <a key={i} href={item.link} target="_blank" rel="noreferrer">{content}</a>
                        ) : (
                            <div key={i}>{content}</div>
                        );
                    })}
                </div>
            </section>

            {/* ── Map + Form ───────────────────────────────────── */}
            <section className="py-20 px-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* ── Embedded Map ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <h2 className="font-display text-4xl uppercase mb-3">{t('Nous trouver', 'Find Us')}</h2>
                            <p className="text-gray-400 text-sm">16 Boulevard du Général de Gaulle, 95200 Sarcelles</p>
                        </div>
                        <div className="rounded-[32px] overflow-hidden border border-gray-100 shadow-lg h-[420px] bg-gray-50 relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2616.0!2d2.3726!3d48.9964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66de6d29e9609%3A0x54e1e0a01ab765e0!2s16%20Bd%20du%20G%C3%A9n%C3%A9ral%20de%20Gaulle%2C%2095200%20Sarcelles%2C%20France!5e0!3m2!1sfr!2sfr!4v1709589600000!5m2!1sfr!2sfr"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
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

                    {/* ── Contact Form ── */}
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
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSend}
                                className={`w-full flex justify-between items-center px-8 py-5 rounded-full font-bold tracking-widest uppercase text-sm shadow-lg transition-all duration-300 ${sent ? 'bg-sb-black text-white' : 'bg-sb-green text-white hover:bg-[#2C6345] shadow-sb-green/25'}`}
                            >
                                <span>{sent ? t('Message envoyé ✓', 'Message Sent ✓') : t('Envoyer le message', 'Send Message')}</span>
                                <Send size={16} />
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
