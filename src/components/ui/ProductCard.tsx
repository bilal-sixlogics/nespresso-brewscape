"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/CartContext';
import { IntensityBar } from './IntensityBar';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    index: number;
}

export function ProductCard({ product, onClick, index }: ProductCardProps) {
    const { addToCart } = useCart();
    const { language } = useLanguage();

    const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
    const displayNamePart2 = language === 'en' && product.namePart2En ? product.namePart2En : product.namePart2;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            onClick={() => onClick(product)}
            className="bg-white rounded-[40px] p-4 border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 w-full max-w-lg mx-auto relative group cursor-pointer z-10 hover:z-20 aspect-[3/4] flex flex-col"
        >
            <div className="bg-[#60A17B] rounded-[32px] h-[65%] w-full relative flex items-center justify-center mb-6 overflow-hidden transition-colors duration-500 group-hover:bg-sb-green shrink-0">
                {/* Subtle background flair */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay"></div>

                {/* Quick add icon */}
                <motion.div
                    className="w-10 h-10 bg-white/20 backdrop-blur-md shadow-xl border border-white/20 rounded-full flex items-center justify-center absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 cursor-pointer"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the product details overlay
                        addToCart(1);
                    }}
                >
                    <ShoppingBag className="w-4 h-4 text-white" />
                </motion.div>

                <motion.img
                    whileHover={{ scale: 1.15, rotate: 5, y: -10 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    src={product.image}
                    alt={product.name}
                    className="h-[85%] object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] z-10"
                />
            </div>
            <div className="px-4 flex flex-col flex-1 justify-between pb-2 h-full">
                <div>
                    <div className="min-h-[70px] flex flex-col justify-start">
                        <h3 className="font-display text-2xl uppercase leading-tight group-hover:text-sb-green transition-colors line-clamp-2">
                            {displayName} {displayNamePart2 && <><br className="hidden md:block" /> {displayNamePart2}</>}
                        </h3>
                    </div>
                    {/* Premium Intensity Scale */}
                    <div className="mt-1 mb-4">
                        <IntensityBar intensity={product.intensity} />
                    </div>

                    <div className="flex justify-end items-center mt-auto">
                        <div className="text-2xl font-bold text-sb-green tracking-tighter">${product.price.toFixed(2)}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                    {product.brewSizes?.map((size, i) => (
                        <div key={size} className="flex flex-col items-center cursor-pointer group/size relative">
                            <motion.div
                                whileHover={{ scale: 1.15 }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${i === 1 ? 'bg-sb-green text-white shadow-lg shadow-sb-green/30' : 'bg-gray-50 border border-gray-100 text-gray-400 group-hover/size:border-sb-green group-hover/size:bg-sb-green/5 group-hover/size:text-sb-green'}`}
                            >
                                <div className={`border-2 border-current rounded-b-sm transition-all ${i === 0 ? 'w-2.5 h-3.5' : i === 1 ? 'w-3 h-4' : i === 2 ? 'w-4 h-5 text-current' : 'w-3 h-3 rounded-full border-current'}`}></div>
                            </motion.div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover/size:text-sb-green transition-colors">{size}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
