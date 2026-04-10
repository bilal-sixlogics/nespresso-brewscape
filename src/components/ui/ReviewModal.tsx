"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrderItem, getProductImage } from '@/types';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: OrderItem | null;
}

export function ReviewModal({ isOpen, onClose, item }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when opened with a new item
    React.useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setReviewText('');
            setIsSuccess(false);
            setError(null);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await apiClient.post(Endpoints.productReviews(item.product.slug), {
                rating,
                comment: reviewText.trim() || undefined,
            });
            setIsSuccess(true);
            setTimeout(() => { onClose(); }, 2500);
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr?.status) {
                if (apiErr.status === 422 && apiErr.message?.toLowerCase().includes('already')) {
                    setError("You've already reviewed this product. Thank you for your feedback!");
                } else {
                    setError(apiErr.message ?? 'Something went wrong. Please try again.');
                }
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-sb-black transition-colors z-10 p-2"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        {isSuccess ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-sb-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-sb-green">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-display text-2xl uppercase mb-2">Review Submitted</h3>
                                <p className="text-gray-500 text-sm">Thank you for sharing your experience. It has been published.</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="font-display text-2xl uppercase tracking-tight text-sb-black mb-2">
                                        Rate Your Experience
                                    </h2>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                                        {item.product.name}
                                    </p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shadow-inner">
                                        <img src={getProductImage(item.product) ?? ''} alt={item.product.name} className="w-20 h-20 object-contain drop-shadow-md" />
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Star Rating */}
                                    <div className="flex justify-center gap-2 mb-6">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={32}
                                                    className={`transition-colors duration-200 ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-8 h-4">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                        {rating === 0 && "Select a Rating"}
                                    </p>

                                    {/* Text Review */}
                                    <div className="mb-6">
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Tell us what you loved about it..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm resize-none h-32 focus:bg-white focus:border-sb-green focus:ring-2 focus:ring-sb-green/20 outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>

                                    {/* Error banner */}
                                    {error && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                                            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-red-700 text-xs leading-snug">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={rating === 0 || isSubmitting}
                                        className="w-full bg-sb-black text-white rounded-xl py-4 font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Review'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
