"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AppConfig } from '@/lib/config';

const sections = [
    {
        icon: Eye,
        title: 'Données collectées',
        titleEn: 'Data We Collect',
        content: `Nous collectons les informations que vous nous fournissez directement lors de la création d'un compte, d'une commande ou d'une demande de contact : nom, prénom, adresse e-mail, adresse postale, numéro de téléphone et informations de paiement (traitées de manière sécurisée via nos prestataires certifiés PCI-DSS).

Nous collectons également automatiquement des données techniques : adresse IP, type de navigateur, pages visitées, durée de session. Ces données sont utilisées exclusivement à des fins d'amélioration du service.`,
        contentEn: `We collect information you provide directly when creating an account, placing an order, or submitting a contact request: name, email address, postal address, phone number, and payment information (processed securely via our PCI-DSS certified providers).

We also automatically collect technical data: IP address, browser type, pages visited, session duration. This data is used exclusively to improve the service.`,
    },
    {
        icon: Lock,
        title: 'Utilisation des données',
        titleEn: 'Use of Data',
        content: `Vos données personnelles sont utilisées pour : traiter et livrer vos commandes, vous envoyer des confirmations de commande et mises à jour de livraison, répondre à vos demandes de support, vous envoyer nos newsletters si vous y avez consenti, et améliorer nos services.

Nous ne vendons, louons ou partageons jamais vos données personnelles avec des tiers à des fins commerciales.`,
        contentEn: `Your personal data is used to: process and deliver your orders, send you order confirmations and delivery updates, respond to your support requests, send our newsletters if you have consented, and improve our services.

We never sell, rent, or share your personal data with third parties for commercial purposes.`,
    },
    {
        icon: Shield,
        title: 'Sécurité des données',
        titleEn: 'Data Security',
        content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé, la divulgation, l'altération ou la destruction.

Toutes les données de paiement sont chiffrées via le protocole TLS/SSL et ne sont jamais stockées sur nos serveurs. Nos prestataires de paiement sont certifiés PCI-DSS Niveau 1.`,
        contentEn: `We implement appropriate technical and organisational security measures to protect your data against loss, unauthorised access, disclosure, alteration, or destruction.

All payment data is encrypted via TLS/SSL protocol and is never stored on our servers. Our payment providers are PCI-DSS Level 1 certified.`,
    },
    {
        icon: Trash2,
        title: 'Vos droits',
        titleEn: 'Your Rights',
        content: `Conformément au RGPD, vous disposez des droits suivants : droit d'accès à vos données, droit de rectification, droit à l'effacement ("droit à l'oubli"), droit à la limitation du traitement, droit à la portabilité des données, et droit d'opposition.

Pour exercer ces droits, contactez notre Délégué à la Protection des Données à l'adresse : dpo@cafrezzo.com. Nous répondons à toute demande dans un délai de 30 jours.`,
        contentEn: `In accordance with GDPR, you have the following rights: right of access to your data, right to rectification, right to erasure ("right to be forgotten"), right to restriction of processing, right to data portability, and right to object.

To exercise these rights, contact our Data Protection Officer at: dpo@cafrezzo.com. We respond to all requests within 30 days.`,
    },
    {
        icon: Mail,
        title: 'Cookies',
        titleEn: 'Cookies',
        content: `Nous utilisons des cookies essentiels au fonctionnement du site (panier, session), des cookies analytiques (mesure d'audience anonymisée via des outils conformes RGPD), et des cookies de préférences (langue, devise).

Vous pouvez paramétrer vos préférences de cookies à tout moment via les paramètres de votre navigateur. Le refus des cookies essentiels peut affecter le fonctionnement du site.`,
        contentEn: `We use cookies essential to site functionality (cart, session), analytical cookies (anonymised audience measurement via GDPR-compliant tools), and preference cookies (language, currency).

You can manage your cookie preferences at any time via your browser settings. Refusing essential cookies may affect site functionality.`,
    },
];

export default function PrivacyPage() {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [active, setActive] = useState<number | null>(null);

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* Hero */}
            <section className="bg-sb-black pt-24 pb-16 px-8">
                <div className="max-w-[900px] mx-auto">
                    <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {tx('Légal', 'Legal')}
                    </p>
                    <h1 className="font-display text-6xl md:text-7xl uppercase text-white mb-4">
                        {tx('Politique de', 'Privacy')} <span className="text-sb-green">{tx('Confidentialité', 'Policy')}</span>
                    </h1>
                    <p className="text-white/40 text-sm">
                        {tx('Dernière mise à jour : 1er janvier 2026', 'Last updated: January 1, 2026')} · {AppConfig.brand.name}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-[900px] mx-auto px-8 py-16">
                <p className="text-gray-500 text-base leading-relaxed mb-12 bg-white border border-gray-100 rounded-[20px] p-6">
                    {tx(
                        `${AppConfig.brand.name} (« nous », « notre ») s'engage à protéger la vie privée de ses utilisateurs. La présente politique décrit comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.`,
                        `${AppConfig.brand.name} ("we", "our") is committed to protecting the privacy of its users. This policy describes how we collect, use, and protect your personal data in accordance with the General Data Protection Regulation (GDPR).`
                    )}
                </p>

                <div className="space-y-4">
                    {sections.map((sec, i) => {
                        const Icon = sec.icon;
                        const open = active === i;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm"
                            >
                                <button
                                    onClick={() => setActive(open ? null : i)}
                                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-sb-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon size={18} className="text-sb-green" />
                                    </div>
                                    <span className="font-bold text-sm flex-1">
                                        {language === 'fr' ? sec.title : sec.titleEn}
                                    </span>
                                    <span className="text-gray-300 text-lg">{open ? '−' : '+'}</span>
                                </button>
                                {open && (
                                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                                        <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                                            {language === 'fr' ? sec.content : sec.contentEn}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Contact */}
                <div className="mt-12 bg-sb-green/5 border border-sb-green/20 rounded-[20px] p-6">
                    <p className="font-bold text-sm mb-2">{tx('Contact DPO', 'DPO Contact')}</p>
                    <p className="text-sm text-gray-500">
                        {tx(
                            'Pour toute question relative à vos données personnelles, contactez notre DPO : ',
                            'For any questions about your personal data, contact our DPO: '
                        )}
                        <a href="mailto:dpo@cafrezzo.com" className="text-sb-green font-bold hover:underline">
                            dpo@cafrezzo.com
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
