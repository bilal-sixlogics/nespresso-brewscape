"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface QuantityStepperProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    className?: string;
}

export const QuantityStepper = ({
    quantity,
    onIncrement,
    onDecrement,
    className
}: QuantityStepperProps) => {
    return (
        <div className={cn("flex items-center space-x-3 bg-white p-1 md:p-2 border border-brand-beige rounded-full shadow-sm", className)}>
            <button
                onClick={onDecrement}
                disabled={quantity <= 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-brand-beige text-brand-black hover:bg-brand-offwhite disabled:opacity-50 transition-colors"
                aria-label="Decrease quantity"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold font-sans w-6 text-center text-brand-black shrink-0">
                {quantity}
            </span>
            <button
                onClick={onIncrement}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-green text-brand-offwhite hover:bg-brand-green/90 transition-colors"
                aria-label="Increase quantity"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};
