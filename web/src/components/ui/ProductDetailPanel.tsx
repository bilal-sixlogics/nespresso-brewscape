import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Coffee } from 'lucide-react';
import { useCart } from '@/store/CartContext';
import { Product } from '@/types';
import { IntensityBar } from './IntensityBar';

interface ProductDetailPanelProps {
    product: Product | null;
    onClose: () => void;
}

export function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        if (product) {
            addToCart(quantity);
            setIsAdded(true);
            setTimeout(() => {
                setIsAdded(false);
            }, 1500);
        }
    };

    return (
        <AnimatePresence>
            {product && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
                    />
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-[#FAF9F6] z-[110] shadow-2xl overflow-y-auto overflow-x-hidden border-l border-white/20"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-gray-100 z-20 px-8 py-6 flex justify-between items-center">
                            <button
                                onClick={onClose}
                                className="flex items-center space-x-3 text-sb-black opacity-60 hover:opacity-100 transition-opacity group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><ArrowLeft size={16} /></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">Keep Exploring</span>
                            </button>
                            <div className="text-[10px] font-bold tracking-widest uppercase px-4 py-2 bg-white rounded-full shadow-sm text-sb-green">
                                Details
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Product Hero */}
                            <div className="bg-white rounded-[40px] p-8 mb-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2EDE4] rounded-full blur-3xl opacity-50 -mr-20 -mt-20 mix-blend-multiply group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-sb-green/5 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>

                                <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                                    <img src={product.image} alt={product.name} className="w-64 h-64 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] relative z-10" />
                                </motion.div>
                            </div>

                            {/* Title & Price */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10 px-2 lg:px-4">
                                <div className="flex justify-between items-end mb-4 gap-6">
                                    <div>
                                        <h2 className="font-display text-4xl lg:text-5xl uppercase leading-[0.9] text-sb-black">
                                            {product.name}
                                            <br />
                                            <span className="text-gray-400 text-3xl lg:text-4xl">{product.namePart2}</span>
                                        </h2>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Price</div>
                                        <div className="font-display text-4xl lg:text-5xl text-sb-green">${product.price.toFixed(2)}</div>
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    {product.desc || "A meticulously crafted blend honoring tradition and innovation in every cup."}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {['Sustainably Sourced', 'Premium Origins'].map(tag => (
                                        <span key={tag} className="text-[9px] bg-white border border-gray-100 text-gray-500 px-3 py-1.5 rounded-full font-bold tracking-widest uppercase shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Specifications */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4 mb-10 px-2">
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">Cup Size</span>
                                    <div className="flex gap-2">
                                        {(product.brewSizes || ['Espresso', 'Lungo']).map((size, idx) => (
                                            <span key={idx} className="bg-sb-offwhite px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-sb-black border border-gray-200">
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {product.intensity > 0 ? (
                                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Intensity</span>
                                            <span className="text-xs font-bold text-sb-black">{product.intensity} / 13</span>
                                        </div>
                                        <IntensityBar intensity={product.intensity} />
                                    </div>
                                ) : (
                                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center justify-center">
                                        <Coffee className="w-6 h-6 text-sb-green/40 mb-2" />
                                        <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Equipment / Apparel</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Aromatic Profile */}
                            {product.notes && product.notes.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-sb-green p-8 rounded-[32px] mb-12 relative overflow-hidden text-white shadow-xl shadow-sb-green/20">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                    <h3 className="font-bold uppercase tracking-widest text-[10px] mb-6 opacity-80">Aromatic Profile</h3>
                                    <div className="flex flex-wrap gap-2 relative z-10">
                                        {product.notes.map((note, i) => (
                                            <span key={i} className="bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex gap-4 items-center">
                            <div className="flex items-center justify-between border-2 border-gray-100 rounded-full p-2 w-[140px] bg-gray-50 flex-shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-sb-black transition-colors"
                                >
                                    <span className="sr-only">Decrease</span>
                                    <div className="w-3 h-0.5 bg-current rounded-full" />
                                </button>
                                <span className="font-display text-xl font-bold w-6 text-center text-sb-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-sb-black transition-colors"
                                >
                                    <span className="sr-only">Increase</span>
                                    <div className="relative w-3 h-3">
                                        <div className="absolute top-1/2 left-0 w-3 h-0.5 -mt-[1px] bg-current rounded-full" />
                                        <div className="absolute top-0 left-1/2 w-0.5 h-3 -ml-[1px] bg-current rounded-full" />
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`flex-1 flex justify-between items-center px-8 lg:px-10 py-5 rounded-full shadow-xl transition-all duration-300 relative overflow-hidden group ${isAdded
                                    ? 'bg-sb-black text-white shadow-sb-black/20'
                                    : 'bg-sb-green text-white hover:bg-[#2C6345] shadow-sb-green/30 hover:shadow-sb-green/50 hover:-translate-y-1'
                                    }`}
                            >
                                <div className="flex flex-col items-start translate-y-0 relative z-10">
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">{isAdded ? 'Success' : 'Total'}</span>
                                    <AnimatePresence mode="wait">
                                        {isAdded ? (
                                            <motion.span
                                                key="added"
                                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                                                className="font-bold text-sm tracking-widest uppercase mt-0.5"
                                            >
                                                Item Added
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="total"
                                                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                                                className="font-display text-2xl leading-none mt-1"
                                            >
                                                ${(product.price * quantity).toFixed(2)}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="relative z-10">
                                    <AnimatePresence mode="wait">
                                        {isAdded ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                                            >
                                                <Check size={20} className="text-white" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="arrow"
                                                initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -180 }}
                                                className="flex items-center space-x-3"
                                            >
                                                <span className="font-bold text-xs uppercase tracking-[0.2em] hidden sm:block">Add to Cart</span>
                                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-sb-green transition-colors">
                                                    <Check size={16} className="opacity-0 hidden" />
                                                    <svg className="w-5 h-5 fill-current transform -rotate-45" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Shine effect */}
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:animate-shine" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
