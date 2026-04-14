"use client";

import { useRef, useEffect } from 'react';
import { PromoStrip } from './PromoStrip';
import { Header } from './Header';
import { Footer } from './Footer';

export function SiteChrome({ children }: { children: React.ReactNode }) {
    const navRef = useRef<HTMLDivElement>(null);

    // Keep --header-h CSS var in sync with the actual rendered height of the
    // sticky nav bar (promo strip + header). Any sticky child can use top-[var(--header-h)].
    useEffect(() => {
        const update = () => {
            if (navRef.current) {
                document.documentElement.style.setProperty(
                    '--header-h',
                    `${navRef.current.offsetHeight}px`
                );
            }
        };
        update();
        const ro = new ResizeObserver(update);
        if (navRef.current) ro.observe(navRef.current);
        return () => ro.disconnect();
    }, []);

    return (
        <div className="bg-sb-white text-sb-black overflow-x-clip">
            <div ref={navRef} className="sticky top-0 z-[9999]">
                <PromoStrip />
                <Header />
            </div>
            <main className="min-h-screen">{children}</main>
            <Footer />
        </div>
    );
}
