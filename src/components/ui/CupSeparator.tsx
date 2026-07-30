import { CoffeeCupIcon } from '@/components/icons/CoffeeCupIcon';

interface CupSeparatorProps {
    /** 'gold' (default) for use on dark/ink sections, 'cocoa' for use on beige sections */
    tone?: 'gold' | 'cocoa';
    className?: string;
}

/**
 * Cup-shaped section divider — replaces plain horizontal-rule separators
 * per the rebrand brief. A small coffee-cup glyph centered between two
 * fading lines, rather than a flat line.
 */
export function CupSeparator({ tone = 'gold', className = '' }: CupSeparatorProps) {
    const toneClass = tone === 'gold' ? 'text-gold' : 'text-cocoa';
    const lineClass = tone === 'gold' ? 'from-transparent via-gold/40 to-transparent' : 'from-transparent via-cocoa/30 to-transparent';

    return (
        <div className={`flex items-center gap-4 w-full ${className}`} role="separator" aria-hidden="true">
            <div className={`flex-1 h-px bg-gradient-to-r ${lineClass}`} />
            <CoffeeCupIcon size={20} className={toneClass} />
            <div className={`flex-1 h-px bg-gradient-to-r ${lineClass}`} />
        </div>
    );
}
