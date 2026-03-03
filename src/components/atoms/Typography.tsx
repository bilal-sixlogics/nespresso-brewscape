import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'massive';
    as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant = 'body', as, ...props }, ref) => {
        const Component = as || (
            variant === 'h1' || variant === 'massive' ? 'h1' :
                variant === 'h2' ? 'h2' :
                    variant === 'h3' ? 'h3' :
                        variant === 'h4' ? 'h4' :
                            variant === 'small' ? 'small' : 'p'
        );

        return (
            <Component
                ref={ref as any}
                className={cn(
                    {
                        'font-display text-7xl md:text-9xl font-black tracking-tighter uppercase': variant === 'massive',
                        'font-display text-5xl md:text-7xl font-black tracking-tight': variant === 'h1',
                        'font-display text-4xl md:text-5xl font-bold tracking-tight': variant === 'h2',
                        'font-display text-2xl md:text-3xl font-bold': variant === 'h3',
                        'font-display text-xl font-semibold': variant === 'h4',
                        'font-sans text-base leading-relaxed': variant === 'body',
                        'font-sans text-sm font-medium text-brand-black/70': variant === 'small',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Typography.displayName = 'Typography';
