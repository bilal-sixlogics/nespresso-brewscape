"use client";

import Script from 'next/script';

import { useConsent } from '@/context/ConsentContext';
import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from '@/lib/analytics';

/**
 * Google Analytics, mounted only after explicit consent.
 *
 * Returning null means the <script> is never inserted, so no request reaches
 * googletagmanager.com and no cookie is written while the visitor is undecided
 * or has refused. That is the strongest reading of "reject means no data" —
 * Consent Mode alone would still load the tag.
 *
 * Also gated on production, so local development never pollutes the live
 * property.
 */
export function GoogleAnalytics() {
    const { consent } = useConsent();

    if (!isAnalyticsEnabled() || consent !== 'granted') return null;

    return (
        <>
            <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}');
                `}
            </Script>
        </>
    );
}
