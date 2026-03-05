"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, Shield, Clock, Package, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ShippingPage() {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    const shippingOptions = [
        {
            icon: Truck,
            title: tx('Standard', 'Standard'),
            subtitle: tx('3–5 jours ouvrés', '3–5 working days'),
            price: '€5.99',
            free: tx('Gratuit dès €150', 'Free from €150'),
            color: 'bg-sb-green',
            features: [
                tx('Suivi en temps réel', 'Real-time tracking'),
                tx('Livraison à domicile ou en point relais', 'Home or pickup point delivery'),
                tx('Avis de passage en cas d\'absence', 'Delivery notice if absent'),
            ],
        },
        {
            icon: Clock,
            title: tx('Express', 'Express'),
            subtitle: tx('1–2 jours ouvrés', '1–2 working days'),
            price: '€12.99',
            free: null,
            color: 'bg-sb-black',
            features: [
                tx('Commandez avant 14h pour livraison le lendemain', 'Order before 2pm for next-day delivery'),
                tx('Suivi prioritaire', 'Priority tracking'),
                tx('Signature requise', 'Signature required'),
            ],
        },
    ];

    const returnSteps = [
        { step: '01', title: tx('Initiez votre retour', 'Initiate your return'), desc: tx('Contactez-nous sous 14 jours à partir de la réception.', 'Contact us within 14 days of receiving your order.') },
        { step: '02', title: tx('Préparez le colis', 'Prepare the package'), desc: tx('Remettez l\'article dans son emballage d\'origine non ouvert.', 'Place the item back in its original unopened packaging.') },
        { step: '03', title: tx('Déposez le colis', 'Drop off the package'), desc: tx('Utilisez l\'étiquette prépayée fournie dans votre e-mail de retour.', 'Use the prepaid label provided in your return email.') },
        { step: '04', title: tx('Remboursement', 'Refund'), desc: tx('Traité sous 5–10 jours ouvrés après réception et vérification.', 'Processed within 5–10 working days after receipt and verification.') },
    ];

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* Hero */}
            <section className="bg-sb-black pt-24 pb-20 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(57,119,77,0.15),_transparent_60%)] pointer-events-none" />
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {tx('Livraison & Retours', 'Shipping & Returns')}
                    </p>
                    <h1 className="font-display text-6xl md:text-8xl uppercase text-white leading-[0.85] mb-6">
                        {tx('Livraison', 'Shipping')}<br />
                        <span className="text-sb-green">{tx('& Retours', '& Returns')}</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-xl">
                        {tx(
                            'Livraison rapide, retours faciles. Votre satisfaction est notre priorité.',
                            'Fast delivery, easy returns. Your satisfaction is our priority.'
                        )}
                    </p>
                </div>
            </section>

            {/* Shipping options */}
            <section className="max-w-[1200px] mx-auto px-8 py-20">
                <h2 className="font-display text-4xl uppercase mb-12 text-center">
                    {tx('Options de Livraison', 'Delivery Options')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shippingOptions.map((opt, i) => {
                        const Icon = opt.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <h3 className="font-display text-3xl uppercase mb-1">{opt.title}</h3>
                                <p className="text-gray-400 text-sm mb-4">{opt.subtitle}</p>
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="font-display text-4xl text-sb-green">{opt.price}</span>
                                    {opt.free && (
                                        <span className="text-xs font-bold bg-sb-green/10 text-sb-green px-3 py-1 rounded-full">
                                            {opt.free}
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-3 mt-6 border-t border-gray-100 pt-6">
                                    {opt.features.map((f, fi) => (
                                        <li key={fi} className="flex items-start gap-3 text-sm text-gray-600">
                                            <CheckCircle size={14} className="text-sb-green mt-0.5 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Free shipping banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-8 bg-gradient-to-r from-sb-green to-[#2C6345] rounded-[24px] p-6 flex items-center gap-4"
                >
                    <Package size={28} className="text-white flex-shrink-0" />
                    <p className="text-white font-semibold text-sm">
                        {tx(
                            '🎉 Livraison standard offerte pour toute commande de €150 ou plus !',
                            '🎉 Free standard shipping on all orders of €150 or more!'
                        )}
                    </p>
                </motion.div>
            </section>

            {/* Returns */}
            <section className="bg-white border-t border-gray-100 py-20 px-8">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex items-start gap-4 mb-12">
                        <RotateCcw size={28} className="text-sb-green mt-1 flex-shrink-0" />
                        <div>
                            <h2 className="font-display text-4xl uppercase mb-2">{tx('Politique de Retour', 'Return Policy')}</h2>
                            <p className="text-gray-500 text-base max-w-xl">
                                {tx(
                                    '14 jours pour changer d\'avis. Retours gratuits pour tout produit défectueux.',
                                    '14 days to change your mind. Free returns for any defective product.'
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {returnSteps.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#FAF9F6] border border-gray-100 rounded-[24px] p-6"
                            >
                                <span className="font-display text-5xl text-sb-green/20">{s.step}</span>
                                <h3 className="font-bold text-sm mt-2 mb-2">{s.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="py-16 px-8 bg-sb-white">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
                    <Shield size={40} className="text-sb-green flex-shrink-0" />
                    <div>
                        <p className="font-bold text-lg">{tx('Paiement & Données 100% Sécurisés', '100% Secure Payment & Data')}</p>
                        <p className="text-gray-400 text-sm mt-1 max-w-md">
                            {tx(
                                'Toutes les transactions sont chiffrées SSL. Vos données ne sont jamais partagées avec des tiers.',
                                'All transactions are SSL-encrypted. Your data is never shared with third parties.'
                            )}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
