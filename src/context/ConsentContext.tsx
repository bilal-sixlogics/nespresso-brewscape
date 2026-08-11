"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ConsentState = 'granted' | 'denied' | 'unknown';

const STORAGE_KEY = 'cafrezzo-analytics-consent';

interface ConsentContextType {
    consent: ConsentState;
    setConsent: (value: Exclude<ConsentState, 'unknown'>) => void;
    /** Re-opens the banner so a visitor can change their mind. */
    resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

/**
 * Analytics consent, opt-in by default.
 *
 * Starts as 'unknown' on every first render, including on the server, so no
 * analytics tag can mount before the visitor has chosen. Only once the stored
 * decision is read (in an effect, after mount) can it become 'granted'.
 *
 * The state deliberately does NOT default to the stored value during the first
 * render: that would make the server and client disagree and, worse, would let
 * GA mount for a split second before hydration corrected it.
 */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
    const [consent, setConsentState] = useState<ConsentState>('unknown');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'granted' || saved === 'denied') setConsentState(saved);
        } catch {
            // localStorage unavailable (private mode, blocked) — stay 'unknown',
            // which means analytics stay off. Failing closed is the safe default.
        }
    }, []);

    const setConsent = useCallback((value: Exclude<ConsentState, 'unknown'>) => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch { /* ignore */ }
        setConsentState(value);

        // Tell Google Consent Mode about the change for this page load. Layer 2
        // of the defence: even if a tag is present, analytics_storage=denied
        // stops it writing cookies.
        try {
            window.gtag?.('consent', 'update', {
                analytics_storage: value === 'granted' ? 'granted' : 'denied',
            });
        } catch { /* gtag not loaded — nothing to update */ }
    }, []);

    const resetConsent = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch { /* ignore */ }
        setConsentState('unknown');
    }, []);

    return (
        <ConsentContext.Provider value={{ consent, setConsent, resetConsent }}>
            {children}
        </ConsentContext.Provider>
    );
}

export function useConsent() {
    const ctx = useContext(ConsentContext);
    if (ctx === undefined) {
        throw new Error('useConsent must be used within a ConsentProvider');
    }
    return ctx;
}

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}
