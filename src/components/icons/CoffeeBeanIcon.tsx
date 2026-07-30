interface CoffeeBeanIconProps {
    filled?: boolean;
    size?: number;
    className?: string;
}

/** A classic coffee-bean silhouette — oval body with a center crease.
 *  `filled` renders a solid bean (fill=currentColor); otherwise a faint
 *  outline-only bean, used together as the "full/empty bean" intensity legend. */
export function CoffeeBeanIcon({ filled = true, size = 16, className }: CoffeeBeanIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M12 2.5c5.2 0 9.5 4.3 9.5 9.5s-4.3 9.5-9.5 9.5S2.5 17.2 2.5 12 6.8 2.5 12 2.5Z"
                fill={filled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={filled ? 0 : 1.5}
                opacity={filled ? 1 : 0.35}
            />
            <path
                d="M12 3.2C9 6 7.3 9 7.3 12s1.7 6 4.7 8.8"
                fill="none"
                stroke={filled ? 'var(--color-ink)' : 'currentColor'}
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={filled ? 0.55 : 0.35}
            />
        </svg>
    );
}
