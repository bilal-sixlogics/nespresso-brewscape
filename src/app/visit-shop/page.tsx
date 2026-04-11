"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Loader2, ExternalLink } from 'lucide-react';
import { AppConfig } from '@/lib/config';
import { Endpoints } from '@/lib/api/endpoints';

interface StoreLocation {
    id: number; name: string; address: string; city: string; country: string;
    phone: string | null; email: string | null; hours: string | null;
    latitude: number | null; longitude: number | null; image: string | null;
}

export default function VisitShopPage() {
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
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Hero */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
                            Our Stores
                        </motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-white/70 max-w-2xl mx-auto text-lg">
                            Visit {AppConfig.brand.name} and discover our exceptional selection in person.
                        </motion.p>
                    </div>
                </section>

                {/* Stores Grid */}
                <section className="bg-sb-white py-24 px-8">
                    <div className="max-w-[1400px] mx-auto">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 size={32} className="animate-spin text-sb-green" />
                            </div>
                        ) : stores.length === 0 ? (
                            <div className="text-center py-20">
                                <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold">No store locations available yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {stores.map(store => (
                                    <motion.div key={store.id} whileHover={{ y: -8 }}
                                        className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                                        <div className="relative h-[200px] overflow-hidden">
                                            {store.image ? (
                                                <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-sb-green/5 flex items-center justify-center">
                                                    <MapPin size={48} className="text-sb-green/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-4 left-6 right-6">
                                                <h3 className="font-display text-xl uppercase text-white drop-shadow-lg">{store.name}</h3>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-sb-green mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-gray-500">{store.address}, {store.city}, {store.country}</p>
                                            </div>
                                            {store.hours && (
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-sb-green flex-shrink-0" />
                                                    <p className="text-sm text-gray-500">{store.hours}</p>
                                                </div>
                                            )}
                                            {store.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone size={16} className="text-sb-green flex-shrink-0" />
                                                    <a href={`tel:${store.phone}`} className="text-sm text-gray-500 hover:text-sb-green transition-colors">{store.phone}</a>
                                                </div>
                                            )}
                                            {store.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail size={16} className="text-sb-green flex-shrink-0" />
                                                    <a href={`mailto:${store.email}`} className="text-sm text-gray-500 hover:text-sb-green transition-colors">{store.email}</a>
                                                </div>
                                            )}
                                            {store.latitude && store.longitude && (
                                                <a href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-full mt-3 bg-sb-offwhite hover:bg-sb-green hover:text-white text-sb-black py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2">
                                                    <ExternalLink size={14} /> Get Directions
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
                        <section className="bg-sb-offwhite py-24 px-8 relative border-t border-gray-100">
                            <div className="max-w-[1400px] mx-auto text-center">
                                <h3 className="font-display text-4xl md:text-5xl uppercase mb-6">Find Us</h3>
                                <p className="text-gray-500 max-w-lg mx-auto mb-12">Every cup tells a story. Come write yours at our store.</p>
                                <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
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
