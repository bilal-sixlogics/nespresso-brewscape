"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { AppConfig } from '@/lib/config';

const termsContent = [
    {
        num: '01',
        title: 'Objet',
        titleEn: 'Purpose',
        body: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre ${AppConfig.brand.name} et tout acheteur effectuant une commande en ligne sur le site cafrezzo.com. Toute commande implique l'acceptation sans réserve des présentes CGV.`,
        bodyEn: `These General Terms and Conditions of Sale govern the contractual relationship between ${AppConfig.brand.name} and any buyer placing an online order on cafrezzo.com. Any order implies unconditional acceptance of these Terms.`,
    },
    {
        num: '02',
        title: 'Commandes',
        titleEn: 'Orders',
        body: `Les commandes sont passées en ligne via le site. La confirmation de commande est envoyée par e-mail après validation du paiement. ${AppConfig.brand.name} se réserve le droit d'annuler toute commande en cas de rupture de stock, d'erreur de prix manifeste, ou de suspicion de fraude.`,
        bodyEn: `Orders are placed online via the website. An order confirmation is sent by email after payment validation. ${AppConfig.brand.name} reserves the right to cancel any order in case of stock shortage, obvious pricing error, or suspected fraud.`,
    },
    {
        num: '03',
        title: 'Prix & Paiement',
        titleEn: 'Prices & Payment',
        body: `Les prix sont indiqués en euros TTC. Ils peuvent être modifiés à tout moment, mais les commandes sont facturées au prix en vigueur lors de la validation. Les paiements sont acceptés par carte bancaire (Visa, Mastercard, American Express), PayPal et virement bancaire pour les commandes professionnelles.`,
        bodyEn: `Prices are in euros including VAT. They may be changed at any time, but orders are invoiced at the price applicable at the time of validation. Payments are accepted by credit card (Visa, Mastercard, American Express), PayPal, and bank transfer for professional orders.`,
    },
    {
        num: '04',
        title: 'Livraison',
        titleEn: 'Delivery',
        body: `Les délais de livraison sont indiqués lors de la commande (3–5 jours ouvrés en standard, 1–2 jours en express). En cas de retard imputable au transporteur, ${AppConfig.brand.name} ne pourra être tenu responsable. Tout colis endommagé à la réception doit être signalé dans les 48 heures.`,
        bodyEn: `Delivery times are indicated at the time of ordering (3–5 working days standard, 1–2 days express). In case of delay attributable to the carrier, ${AppConfig.brand.name} cannot be held liable. Any parcel damaged upon receipt must be reported within 48 hours.`,
    },
    {
        num: '05',
        title: 'Droit de rétractation',
        titleEn: 'Right of Withdrawal',
        body: `Conformément à la directive européenne, vous disposez d'un délai de 14 jours à compter de la réception pour exercer votre droit de rétractation sans justification. Les produits doivent être retournés dans leur emballage d'origine non ouvert. Les denrées périssables et produits alimentaires ouverts ne peuvent être retournés.`,
        bodyEn: `In accordance with European directive, you have 14 days from receipt to exercise your right of withdrawal without justification. Products must be returned in their original unopened packaging. Perishable goods and opened food products cannot be returned.`,
    },
    {
        num: '06',
        title: 'Responsabilité',
        titleEn: 'Liability',
        body: `${AppConfig.brand.name} ne saurait être tenu responsable des dommages indirects résultant de l'utilisation des produits. Sa responsabilité est limitée au montant de la commande concernée. Les informations figurant sur le site sont données à titre indicatif et peuvent être modifiées.`,
        bodyEn: `${AppConfig.brand.name} cannot be held liable for indirect damages resulting from the use of products. Its liability is limited to the amount of the order concerned. Information on the website is provided for guidance only and may be subject to change.`,
    },
    {
        num: '07',
        title: 'Loi applicable & Juridiction',
        titleEn: 'Applicable Law & Jurisdiction',
        body: `Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Paris seront seuls compétents. Pour tout litige de consommation, vous pouvez également recourir à la médiation via la plateforme européenne de règlement en ligne des litiges (RLL).`,
        bodyEn: `These Terms are governed by French law. In the event of a dispute, an amicable resolution will be sought first. Failing that, the competent courts of Paris shall have sole jurisdiction. For consumer disputes, you may also use mediation via the European online dispute resolution (ODR) platform.`,
    },
];

export default function TermsPage() {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* Hero */}
            <section className="bg-sb-black pt-24 pb-16 px-8">
                <div className="max-w-[900px] mx-auto">
                    <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {tx('Légal', 'Legal')}
                    </p>
                    <h1 className="font-display text-5xl md:text-7xl uppercase text-white mb-4">
                        {tx("Conditions", "Terms of")} <span className="text-sb-green">{tx("d'Utilisation", "Service")}</span>
                    </h1>
                    <p className="text-white/40 text-sm">
                        {tx('Version en vigueur au 1er janvier 2026', 'Version effective January 1, 2026')} · {AppConfig.brand.name}
                    </p>
                </div>
            </section>

            {/* Terms content */}
            <section className="max-w-[900px] mx-auto px-8 py-16">
                <div className="space-y-6">
                    {termsContent.map((sec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm"
                        >
                            <div className="flex items-start gap-5">
                                <span className="font-display text-4xl text-sb-green/20 leading-none flex-shrink-0">
                                    {sec.num}
                                </span>
                                <div>
                                    <h2 className="font-bold text-base text-sb-black mb-3">
                                        {language === 'fr' ? sec.title : sec.titleEn}
                                    </h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {language === 'fr' ? sec.body : sec.bodyEn}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact */}
                <div className="mt-10 bg-gray-50 border border-gray-100 rounded-[20px] p-6 text-center">
                    <p className="text-sm text-gray-500">
                        {tx('Pour toute question : ', 'For any questions: ')}
                        <a href={`mailto:${AppConfig.brand.email}`} className="text-sb-green font-bold hover:underline">
                            {AppConfig.brand.email}
                        </a>
                        {' · '}
                        <span>{AppConfig.brand.address}</span>
                    </p>
                </div>
            </section>
        </div>
    );
}
