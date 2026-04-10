"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** When true, redirects authenticated users away (e.g. /login, /register) */
    requireGuest?: boolean;
}

export function ProtectedRoute({ children, requireGuest = false }: ProtectedRouteProps) {
    const { isAuthenticated, isHydrating } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isHydrating) return;

        if (requireGuest && isAuthenticated) {
            router.replace('/account');
        } else if (!requireGuest && !isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, isHydrating, requireGuest, router, pathname]);

    if (isHydrating || (requireGuest ? isAuthenticated : !isAuthenticated)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#3B7E5A]" size={48} />
            </div>
        );
    }

    return <>{children}</>;
}
