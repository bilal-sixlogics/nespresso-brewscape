"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const faqs = [
    {
        category: 'Commandes & Livraison',
        categoryEn: 'Orders & Delivery',
        items: [
            {
                q: 'Quel est le délai de livraison standard ?',
                qEn: 'What is the standard delivery time?',
                a: 'La livraison standard prend 3 à 5 jours ouvrés. La livraison express est disponible en 1 à 2 jours ouvrés pour un supplément de €6,99.',
                aEn: 'Standard delivery takes 3–5 working days. Express delivery is available in 1–2 working days for an additional €6.99.',
            },
            {
                q: 'Comment bénéficier de la livraison gratuite ?',
                qEn: 'How do I get free shipping?',
                a: 'La livraison est offerte pour toute commande de €150 ou plus. La valeur est calculée après application des remises.',
                aEn: 'Shipping is free on all orders of €150 or more. The value is calculated after discounts are applied.',
            },
            {
                q: 'Puis-je modifier ou annuler ma commande ?',
                qEn: 'Can I modify or cancel my order?',
                a: 'Les modifications ou annulations sont possibles dans un délai de 2 heures après la passation de la commande. Contactez-nous rapidement à contact@cafrezzo.com.',
                aEn: 'Modifications or cancellations are possible within 2 hours of placing the order. Contact us promptly at contact@cafrezzo.com.',
            },
            {
                q: 'Livrez-vous en dehors de la France ?',
                qEn: 'Do you deliver outside France?',
                a: 'Nous livrons actuellement en France métropolitaine, Belgique, Luxembourg et Suisse. Des frais supplémentaires peuvent s\'appliquer pour la Suisse.',
                aEn: 'We currently deliver to mainland France, Belgium, Luxembourg, and Switzerland. Additional fees may apply to Switzerland.',
            },
        ],
    },
    {
        category: 'Produits & Café',
        categoryEn: 'Products & Coffee',
        items: [
            {
                q: 'Quelle est la différence entre l\'intensité 5 et 13 ?',
                qEn: 'What is the difference between intensity 5 and 13?',
                a: 'L\'intensité mesure la puissance aromatique et l\'amertume du café. Une intensité de 5 donne un café doux et fruité, tandis qu\'une intensité de 13 offre un espresso très corsé, amer et persistant.',
                aEn: 'Intensity measures the aromatic strength and bitterness of the coffee. An intensity of 5 gives a mild, fruity coffee, while an intensity of 13 delivers a very bold, bitter, and lingering espresso.',
            },
            {
                q: 'Vos cafés sont-ils certifiés bio ou équitables ?',
                qEn: 'Are your coffees certified organic or fair trade?',
                a: 'Plusieurs de nos références portent des certifications biologiques (AB) ou Rainforest Alliance. Ces informations sont indiquées sur chaque fiche produit.',
                aEn: 'Several of our products carry organic (AB) or Rainforest Alliance certifications. This information is shown on each product page.',
            },
            {
                q: 'Comment conserver mon café en grains ?',
                qEn: 'How should I store my coffee beans?',
                a: 'Conservez votre café dans un endroit frais et sec, à l\'abri de la lumière et de l\'humidité. Utilisez un contenant hermétique et évitez le réfrigérateur qui peut transférer des odeurs.',
                aEn: 'Store your coffee in a cool, dry place away from light and moisture. Use an airtight container and avoid the fridge, which can transfer odours.',
            },
            {
                q: 'Quelle mouture choisir pour mon type de machine ?',
                qEn: 'Which grind should I choose for my machine type?',
                a: 'Machine espresso : Fine. Cafetière filtre : Moyenne. French press : Grossière. Machine à piston / moka : Moyenne-fine.',
                aEn: 'Espresso machine: Fine. Filter coffee maker: Medium. French press: Coarse. Moka pot: Medium-fine.',
            },
        ],
    },
    {
        category: 'Machines',
        categoryEn: 'Machines',
        items: [
            {
                q: 'Proposez-vous une installation ou un service après-vente pour les machines ?',
                qEn: 'Do you offer installation or after-sales service for machines?',
                a: 'Oui, nous proposons un service technique pour l\'installation et la maintenance des machines professionnelles. Contactez notre équipe support pour un rendez-vous.',
                aEn: 'Yes, we offer a technical service for the installation and maintenance of professional machines. Contact our support team to book an appointment.',
            },
            {
                q: 'Les machines sont-elles garanties ?',
                qEn: 'Are the machines under warranty?',
                a: 'Toutes nos machines bénéficient d\'une garantie constructeur de 2 ans. Nous proposons également des extensions de garantie jusqu\'à 5 ans.',
                aEn: 'All our machines come with a 2-year manufacturer\'s warranty. We also offer warranty extensions up to 5 years.',
            },
        ],
    },
    {
        category: 'Retours & Remboursements',
        categoryEn: 'Returns & Refunds',
        items: [
            {
                q: 'Quelle est votre politique de retour ?',
                qEn: 'What is your return policy?',
                a: 'Vous disposez de 14 jours après réception pour retourner un article non ouvert dans son emballage d\'origine. Les frais de retour sont à notre charge pour tout article défectueux.',
                aEn: 'You have 14 days after receipt to return an unopened item in its original packaging. Return shipping is covered by us for any defective item.',
            },
            {
                q: 'Quand serai-je remboursé ?',
                qEn: 'When will I be refunded?',
                a: 'Le remboursement est effectué dans un délai de 5 à 10 jours ouvrés après réception et vérification de votre retour, via le même moyen de paiement d\'origine.',
                aEn: 'The refund is processed within 5–10 working days after receipt and verification of your return, via the same original payment method.',
            },
        ],
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-start py-5 text-left gap-4 group"
            >
                <span className="font-semibold text-sm text-sb-black group-hover:text-sb-green transition-colors leading-relaxed">
                    {q}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 mt-0.5">
                    <ChevronDown size={18} className="text-gray-300" />
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
                        <p className="pb-5 text-sm text-gray-500 leading-relaxed pr-8">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQPage() {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? faqs.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                (language === 'fr' ? item.q : item.qEn).toLowerCase().includes(query.toLowerCase()) ||
                (language === 'fr' ? item.a : item.aEn).toLowerCase().includes(query.toLowerCase())
            ),
        })).filter(cat => cat.items.length > 0)
        : faqs;

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* Hero */}
            <section className="bg-sb-black pt-24 pb-20 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.2),_transparent_60%)] pointer-events-none" />
                <div className="max-w-[900px] mx-auto relative z-10 text-center">
                    <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {tx('Support', 'Support')}
                    </p>
                    <h1 className="font-display text-6xl md:text-7xl uppercase text-white mb-6">
                        {tx('Questions', 'Frequently')}
                        <span className="text-sb-green block">{tx('Fréquentes', 'Asked Questions')}</span>
                    </h1>
                    <p className="text-white/50 text-base max-w-lg mx-auto mb-10">
                        {tx(
                            'Trouvez rapidement les réponses à vos questions sur nos produits, livraisons et services.',
                            'Find quick answers about our products, deliveries, and services.'
                        )}
                    </p>
                    {/* Search */}
                    <div className="relative max-w-lg mx-auto">
                        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={tx('Rechercher une question…', 'Search a question…')}
                            className="w-full pl-12 pr-5 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-sb-green transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Accordions */}
            <section className="max-w-[900px] mx-auto px-8 py-20">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="font-bold text-xl">{tx('Aucun résultat', 'No results found')}</p>
                        <button onClick={() => setQuery('')} className="text-sb-green text-sm font-bold mt-4 underline">
                            {tx('Réinitialiser', 'Reset')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {filtered.map((cat, ci) => (
                            <motion.div
                                key={ci}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: ci * 0.1 }}
                            >
                                <h2 className="font-display text-2xl uppercase text-sb-black mb-4 flex items-center gap-3">
                                    <span className="w-6 h-0.5 bg-sb-green block" />
                                    {language === 'fr' ? cat.category : cat.categoryEn}
                                </h2>
                                <div className="bg-white rounded-[24px] border border-gray-100 px-6 shadow-sm">
                                    {cat.items.map((item, ii) => (
                                        <FaqItem
                                            key={ii}
                                            q={language === 'fr' ? item.q : item.qEn}
                                            a={language === 'fr' ? item.a : item.aEn}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Contact CTA */}
                <div className="mt-16 bg-sb-green rounded-[32px] p-10 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70 mb-3">
                        {tx('Besoin d\'aide ?', 'Need help?')}
                    </p>
                    <h3 className="font-display text-3xl uppercase mb-4">
                        {tx('Contactez Notre Équipe', 'Contact Our Team')}
                    </h3>
                    <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                        {tx(
                            'Notre équipe est disponible du lundi au vendredi, 9h–17h.',
                            'Our team is available Monday to Friday, 9am–5pm.'
                        )}
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-sb-green font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full hover:bg-sb-black hover:text-white transition-all duration-300"
                    >
                        {tx('Nous contacter', 'Contact Us')}
                    </a>
                </div>
            </section>
        </div>
    );
}
