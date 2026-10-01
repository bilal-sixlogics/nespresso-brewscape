"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useConsent } from '@/context/ConsentContext';
import {
    META_PIXEL_ID,
    discardPendingMetaEvents,
    flushPendingMetaEvents,
    isMetaPixelEnabled,
    trackContact,
} from '@/lib/tracking';

type FbqStub = ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[][];
    push: FbqStub;
    loaded: boolean;
    version: string;
};

/**
 * Meta's base snippet, as code rather than an inline <script>.
 *
 * Defining the `fbq` queue synchronously here (instead of via next/script)
 * means the first PageView is queued in the same tick as `init` — with an
 * afterInteractive script, the effect below can run before the script has
 * executed and the landing-page PageView, the one that matters most for an
 * ad click, would be lost.
 */
function installPixel(pixelId: string): void {
    const w = window as unknown as { fbq?: FbqStub; _fbq?: FbqStub };
    if (w.fbq) return;

    const n = function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
    } as FbqStub;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    w.fbq = n;
    w._fbq = n;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);

    n('init', pixelId);
}

/**
 * Meta Pixel + contact-click conversions, mounted only after consent.
 *
 * Mirrors GoogleAnalytics.tsx: nothing is requested from facebook.net until
 * the visitor accepts. Unlike GA it cannot simply render null afterwards,
 * because App Router navigations do not reload the page — PageView has to be
 * re-sent on every pathname change, or Meta sees one page per session.
 */
export function ConversionTracking() {
    const { consent } = useConsent();
    const pathname = usePathname();
    const pixelOn = consent === 'granted' && isMetaPixelEnabled();
    const lastTracked = useRef<string | null>(null);

    useEffect(() => {
        if (!pixelOn) {
            // Events raised on a page the visitor never consented on must not
            // be replayed later on a different page.
            discardPendingMetaEvents();
            // Consent withdrawn mid-session: stop the already-loaded pixel
            // from setting or sending anything further.
            try {
                (window as unknown as { fbq?: FbqStub }).fbq?.('consent', 'revoke');
            } catch { /* ignore */ }
            lastTracked.current = null;
            return;
        }
        installPixel(META_PIXEL_ID);
        const w = window as unknown as { fbq: FbqStub };
        w.fbq('consent', 'grant');
        if (lastTracked.current !== pathname) {
            lastTracked.current = pathname;
            w.fbq('track', 'PageView');
        }
        flushPendingMetaEvents(w.fbq);
    }, [pixelOn, pathname]);

    // Tap-to-call and email links are the main B2B conversion, and they live
    // in a dozen components. One delegated listener covers all of them,
    // including links added later, without threading a handler through each.
    useEffect(() => {
        if (consent !== 'granted') return;
        const onClick = (e: MouseEvent) => {
            const a = (e.target as Element | null)?.closest?.('a[href]');
            const href = a?.getAttribute('href') ?? '';
            if (href.startsWith('tel:')) trackContact('phone');
            else if (href.startsWith('mailto:')) trackContact('email');
            else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackContact('whatsapp');
        };
        document.addEventListener('click', onClick, { capture: true });
        return () => document.removeEventListener('click', onClick, { capture: true });
    }, [consent]);

    return null;
}
