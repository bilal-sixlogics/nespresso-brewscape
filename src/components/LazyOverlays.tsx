"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useConsent } from '@/context/ConsentContext';

/**
 * Site-wide overlays, loaded on demand.
 *
 * Both used to be imported eagerly by the root layout, so their code — the
 * login modal alone carries the full login, registration and OTP flows — was
 * in the first-load bundle of every page, for every visitor, including the
 * large majority who never open it.
 *
 * Each mounts the first time it is needed and then stays mounted, so its own
 * AnimatePresence exit animations keep working.
 */

const LoginModal = dynamic(() => import('@/components/ui/LoginModal').then(m => m.LoginModal), {
    ssr: false,
});

const CookieConsentBanner = dynamic(
    () => import('@/components/ui/CookieConsentBanner').then(m => m.CookieConsentBanner),
    { ssr: false },
);

export function LazyLoginModal() {
    const { isLoginModalOpen } = useAuth();
    const [needed, setNeeded] = useState(false);
    // Derived-state update during render: React re-renders immediately,
    // without an effect round-trip.
    if (isLoginModalOpen && !needed) setNeeded(true);
    return needed ? <LoginModal /> : null;
}

export function LazyCookieConsentBanner() {
    const { consent, resolved } = useConsent();
    const [needed, setNeeded] = useState(false);
    // Waits for the stored decision: every visitor starts at 'unknown', and
    // returning visitors who already chose should never download the banner.
    if (resolved && consent === 'unknown' && !needed) setNeeded(true);
    return needed ? <CookieConsentBanner /> : null;
}
