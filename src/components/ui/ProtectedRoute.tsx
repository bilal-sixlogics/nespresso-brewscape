"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, requireGuest = false }: { children: React.ReactNode, requireGuest?: boolean }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for a tiny tick to ensure localStorage is read by AuthContext
        const timer = setTimeout(() => {
            if (requireGuest && isAuthenticated) {
                // If it's a guest-only route (like a dedicated /login page if we had one) and user is logged in
                router.replace('/account');
            } else if (!requireGuest && !isAuthenticated) {
                // If it's a protected route (like /account) and user is NOT logged in
                router.replace('/');
            } else {
                setIsChecking(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isAuthenticated, requireGuest, router, pathname]);

    if (isChecking) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-sb-green" size={48} />
            </div>
        );
    }

    return <>{children}</>;
}
