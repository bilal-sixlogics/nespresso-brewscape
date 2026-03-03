"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Coffee } from 'lucide-react';
import { AppConfig } from '@/lib/config';

export default function VisitShopPage() {
    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">Nos Boutiques</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">Retrouvez {AppConfig.brand.name} et découvrez notre sélection d'exception en personne.</motion.p>
                    </div>
                </section>

                {/* Stores Grid */}
                <section className="bg-sb-white py-24 px-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { name: `${AppConfig.brand.name} Sarcelles`, address: '30 rue de l\'Escouvrier, 95200 Sarcelles, France', hours: '9:00 - 17:00 (Lun-Ven)', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop' },
                            ].map((store) => (
                                <motion.div key={store.name} whileHover={{ y: -8 }} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group">
                                    <div className="relative h-[200px] overflow-hidden">
                                        <img src={store.img} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute bottom-4 left-6 right-6">
                                            <h3 className="font-display text-xl uppercase text-white drop-shadow-lg">{store.name}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <MapPin size={16} className="text-sb-green mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-500">{store.address}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <Coffee size={16} className="text-sb-green flex-shrink-0" />
                                            <p className="text-sm text-gray-500">{store.hours}</p>
                                        </div>
                                        <button className="w-full bg-sb-offwhite hover:bg-sb-green hover:text-white text-sb-black py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300">
                                            Get Directions
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="bg-sb-offwhite py-24 px-8 relative border-t border-gray-100">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <h3 className="font-display text-4xl md:text-5xl uppercase mb-6">Nous Rendre Visite</h3>
                        <p className="text-gray-500 max-w-lg mx-auto mb-12">Chaque tasse raconte une histoire. Venez écrire la vôtre dans notre boutique.</p>
                        <div className="bg-sb-green/10 rounded-3xl h-[400px] flex items-center justify-center border border-sb-green/20">
                            <div className="text-center">
                                <MapPin size={48} className="text-sb-green mx-auto mb-4" />
                                <p className="text-sb-green font-bold tracking-widest uppercase text-sm">Interactive Map Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
