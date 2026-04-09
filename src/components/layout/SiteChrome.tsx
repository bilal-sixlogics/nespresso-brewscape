"use client";

import { PromoStrip } from './PromoStrip';
import { Header } from './Header';
import { Footer } from './Footer';

export function SiteChrome({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-sb-white text-sb-black overflow-x-hidden">
            <PromoStrip />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </div>
    );
}
