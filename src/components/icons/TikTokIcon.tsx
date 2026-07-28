interface TikTokIconProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

/** TikTok's logo mark isn't in lucide-react — inline SVG matching the same 24x24/currentColor convention as lucide icons. */
export function TikTokIcon({ size = 16, className }: TikTokIconProps) {
    // strokeWidth is accepted (for prop-shape parity with lucide-react icons
    // used alongside this one) but unused — the mark is a filled shape, not a stroke.
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M16.6 5.82c-.99-.65-1.7-1.66-1.9-2.83-.05-.28-.08-.57-.08-.86h-3.02v13.5c0 1.45-1.18 2.63-2.63 2.63a2.63 2.63 0 0 1-2.63-2.63 2.63 2.63 0 0 1 2.63-2.63c.24 0 .48.04.7.1v-3.09c-.23-.03-.46-.05-.7-.05a5.66 5.66 0 0 0-5.66 5.67A5.66 5.66 0 0 0 8.97 21.3a5.66 5.66 0 0 0 5.66-5.67V9.01a8.6 8.6 0 0 0 5.03 1.62V7.61c-1.13 0-2.19-.4-3.06-1.08z" />
        </svg>
    );
}
