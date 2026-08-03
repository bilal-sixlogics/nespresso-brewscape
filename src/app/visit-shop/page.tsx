"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Loader2, ExternalLink } from 'lucide-react';
import { Endpoints } from '@/lib/api/endpoints';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { useLanguage } from '@/context/LanguageContext';

interface StoreLocation {
    id: number; name: string; address: string; city: string; country: string;
    phone: string | null; email: string | null; hours: string | null;
    latitude: number | null; longitude: number | null; image: string | null;
}

export default function VisitShopPage() {
    const { t } = useLanguage();
    const [stores, setStores] = useState<StoreLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(Endpoints.storeLocations)
            .then(r => r.json())
            .then(json => setStores(json?.data ?? []))
            .catch(() => setStores([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Hero */}
                <section className="bg-ink pt-20 pb-16 px-8 relative text-sand">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
                            {t('visitShopTitle')}
                        </motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-sand/60 max-w-2xl mx-auto text-lg">
                            {t('visitShopSubtitle')}
                        </motion.p>
                        <div className="max-w-xs mx-auto mt-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </div>
                </section>

                {/* Stores Grid */}
                <section className="bg-ink py-24 px-8">
                    <div className="max-w-[1400px] mx-auto">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 size={32} className="animate-spin text-gold" />
                            </div>
                        ) : stores.length === 0 ? (
                            <div className="text-center py-20">
                                <MapPin size={48} className="mx-auto text-cocoa/30 mb-4" />
                                <p className="text-cocoa font-bold">{t('noStoresAvailable')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {stores.map(store => (
                                    <motion.div key={store.id} whileHover={{ y: -8 }}
                                        className="bg-sand rounded-3xl overflow-hidden border border-ink/10 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                                        <div className="relative h-[200px] overflow-hidden">
                                            {store.image ? (
                                                <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-ink/5 flex items-center justify-center">
                                                    <MapPin size={48} className="text-ink/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                                            <div className="absolute bottom-4 left-6 right-6">
                                                <h3 className="font-display text-xl uppercase text-sand drop-shadow-lg">{store.name}</h3>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-gold mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-ink/60">{store.address}, {store.city}, {store.country}</p>
                                            </div>
                                            {store.hours && (
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-gold flex-shrink-0" />
                                                    <p className="text-sm text-ink/60">{store.hours}</p>
                                                </div>
                                            )}
                                            {store.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone size={16} className="text-gold flex-shrink-0" />
                                                    <a href={`tel:${store.phone}`} className="text-sm text-ink/60 hover:text-gold transition-colors">{store.phone}</a>
                                                </div>
                                            )}
                                            {store.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail size={16} className="text-gold flex-shrink-0" />
                                                    <a href={`mailto:${store.email}`} className="text-sm text-ink/60 hover:text-gold transition-colors">{store.email}</a>
                                                </div>
                                            )}
                                            {store.latitude && store.longitude && (
                                                <a href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-full mt-3 bg-ink/5 hover:bg-gold hover:text-ink text-ink py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2">
                                                    <ExternalLink size={14} /> {t('getDirections')}
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Map — OpenStreetMap embed (no API key needed) */}
                {stores.some(s => s.latitude && s.longitude) && (() => {
                    const first = stores.find(s => s.latitude && s.longitude)!;
                    return (
                        <section className="bg-ink py-24 px-8 relative border-t border-sand/10">
                            <div className="max-w-[1400px] mx-auto text-center">
                                <h3 className="font-display text-4xl md:text-5xl uppercase mb-6 text-sand">{t('visitUsToday')}</h3>
                                <p className="text-sand/60 max-w-lg mx-auto mb-12">{t('visitUsDesc')}</p>
                                <div className="rounded-3xl overflow-hidden border border-sand/15 shadow-lg">
                                    <iframe
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(first.longitude) - 0.01},${Number(first.latitude) - 0.01},${Number(first.longitude) + 0.01},${Number(first.latitude) + 0.01}&layer=mapnik&marker=${first.latitude},${first.longitude}`}
                                        width="100%"
                                        height="450"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </section>
                    );
                })()}
            </motion.div>
        </div>
    );
}
