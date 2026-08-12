interface CoffeeCupIconProps {
    size?: number;
    className?: string;
}

/** A simple espresso-cup-and-saucer silhouette, used by CupSeparator. */
export function CoffeeCupIcon({ size = 18, className }: CoffeeCupIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <path d="M5 9h11v5.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5V9Z" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M16 10.5h1.5a2.25 2.25 0 0 1 0 4.5H16" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
            <path d="M3 21h16" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
            <path d="M7.5 5.5c.6-.8.6-1.2 0-2M11 5.5c.6-.8.6-1.2 0-2" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
        </svg>
    );
}
