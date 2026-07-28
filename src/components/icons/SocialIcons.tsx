interface SocialIconProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

/**
 * lucide-react has deprecated all brand icons (Facebook, Instagram, LinkedIn,
 * etc.) and will remove them in v1.0 (see lucide-icons/lucide#670) — these
 * inline SVGs replace them so the footer doesn't break on a future upgrade.
 */

export function FacebookIcon({ size = 16, className }: SocialIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.5 1.53-1.5H16.5V4.3c-.26-.03-1.15-.11-2.19-.11-2.17 0-3.66 1.32-3.66 3.75V10.5H8.5v3H10.65V21h2.85z" />
        </svg>
    );
}

export function InstagramIcon({ size = 16, className }: SocialIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function LinkedinIcon({ size = 16, className }: SocialIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M6.94 8.5H3.56V20.5H6.94V8.5Z" />
            <path d="M5.25 7.02c1.15 0 2.08-.93 2.08-2.08 0-1.15-.93-2.08-2.08-2.08-1.15 0-2.08.93-2.08 2.08 0 1.15.93 2.08 2.08 2.08Z" />
            <path d="M9.19 8.5h3.24v1.64h.05c.45-.85 1.55-1.75 3.19-1.75 3.41 0 4.04 2.25 4.04 5.17v6.94h-3.38v-6.15c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.37 1.6-2.37 3.25v6.26H9.19V8.5Z" />
        </svg>
    );
}
