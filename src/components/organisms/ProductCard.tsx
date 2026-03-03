"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Typography } from '../atoms/Typography';
import { QuantityStepper } from '../molecules/QuantityStepper';
import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';

export interface ProductCardProps {
    id: string;
    title: string;
    intensity: number;
    price: number;
    imageUrl: string;
    cupSize: 'espresso' | 'lungo' | 'vertuo';
    className?: string;
}

export const ProductCard = ({ title, intensity, price, imageUrl, cupSize, className }: ProductCardProps) => {
    const [quantity, setQuantity] = useState(0);

    return (
        <div className={cn("group flex flex-col relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500", className)}>
            {/* Top Half - Green Background */}
            <div className="h-56 bg-brand-green relative flex items-center justify-center p-6 overflow-hidden">
                {/* Optional decorative element */}
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1 z-10">
                    <Coffee className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-semibold uppercase">{cupSize}</span>
                </div>
                {/* Product Image */}
                <div className="relative w-40 h-40 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 z-0">
                    {/* Using unoptimized for placeholder external imagery safety */}
                    <Image src={imageUrl} alt={title} fill className="object-contain drop-shadow-2xl" unoptimized />
                </div>
            </div>

            {/* Bottom Half - White Background */}
            <div className="p-6 flex flex-col flex-1 bg-white">
                <Typography variant="small" className="text-brand-green font-bold mb-1 tracking-wider uppercase">
                    Intensity {intensity}
                </Typography>
                <Typography variant="h3" className="mb-2 leading-tight text-brand-black">
                    {title}
                </Typography>

                <div className="mt-auto flex items-center justify-between pt-6">
                    <Typography variant="h3" className="text-brand-black">
                        ${price.toFixed(2)}
                    </Typography>
                    <QuantityStepper
                        quantity={quantity}
                        onIncrement={() => setQuantity(q => q + 1)}
                        onDecrement={() => setQuantity(q => Math.max(0, q - 1))}
                    />
                </div>
            </div>
        </div>
    );
};
