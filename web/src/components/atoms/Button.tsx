import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green disabled:opacity-50 disabled:pointer-events-none rounded-full whitespace-nowrap",
                    {
                        'bg-brand-green text-brand-offwhite hover:bg-brand-green/90 hover:scale-105 active:scale-95': variant === 'primary',
                        'bg-brand-black text-brand-offwhite hover:bg-brand-black/90 hover:scale-105 active:scale-95': variant === 'secondary',
                        'border-2 border-brand-black bg-transparent hover:bg-brand-black hover:text-brand-offwhite text-brand-black': variant === 'outline',
                        'hover:bg-brand-beige/50 text-brand-black': variant === 'ghost',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-12 px-8 text-base': size === 'md',
                        'h-14 px-10 text-lg': size === 'lg',
                        'h-10 w-10 p-0': size === 'icon',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
