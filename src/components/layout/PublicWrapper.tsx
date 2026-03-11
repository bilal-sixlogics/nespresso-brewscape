"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { PromoStrip } from './PromoStrip';
import { LoginModal } from '@/components/ui/LoginModal';

export function PublicWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="bg-sb-white text-sb-black overflow-x-hidden">
            <PromoStrip />
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
            <LoginModal />
        </div>
    );
}
