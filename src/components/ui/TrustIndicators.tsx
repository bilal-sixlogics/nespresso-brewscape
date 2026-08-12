import { LucideIcon, Truck, Coffee, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

export interface TrustIndicatorItem {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface TrustIndicatorsProps {
    items?: TrustIndicatorItem[];
    /** 'row' (default) — inline row of cards, used e.g. on the product page. 'compact' — single item, used in the footer. */
    variant?: 'row' | 'compact';
    className?: string;
}

const DEFAULT_ITEMS: TrustIndicatorItem[] = [
    { icon: Truck, title: 'freeShipping', description: 'freeShippingDesc' },
    { icon: Coffee, title: 'freshlyRoastedTitle', description: 'freshlyRoastedDesc' },
    { icon: ShieldCheck, title: 'secureCheckoutTitle', description: 'secureCheckoutDesc' },
];

/**
 * Shared trust-indicator component — icon + title + description tiles for
 * delivery/roasting/payment reassurance. Used on the product detail page's
 * bottom section and adapted for the footer's single "Free Shipping" card.
 *
 * `items` are expected to hold translation KEY NAMES (not literal text) —
 * the render logic below resolves them via `t()`.
 */
export function TrustIndicators({ items = DEFAULT_ITEMS, variant = 'row', className = '' }: TrustIndicatorsProps) {
    const { t } = useLanguage();
    // `title`/`description` are normally translation key names, but some call sites
    // (e.g. the footer) pre-resolve them to literal text — `t()` falls back to
    // returning its input unchanged when it isn't a recognized key, so this is safe
    // either way.
    const resolve = (value: string) => t(value as TranslationKey);

    if (variant === 'compact') {
        const item = items[0];
        const Icon = item.icon;
        return (
            <div className={`flex items-center gap-4 p-4 bg-sand/8 rounded-2xl border border-sand/10 ${className}`}>
                <div className="w-10 h-10 bg-gold/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                    <div className="text-sm font-bold text-sand">{resolve(item.title)}</div>
                    <div className="text-xs text-cocoa">{resolve(item.description)}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.title} className="flex items-center gap-3 p-4 bg-sand/8 rounded-2xl border border-sand/10">
                        <div className="w-10 h-10 bg-gold/15 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-gold" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-sand">{resolve(item.title)}</div>
                            <div className="text-xs text-cocoa truncate">{resolve(item.description)}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
