"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SiteSettings {
    currency: string;
    currency_symbol: string;
    tax_rate: number;
    tax_label: string;
    tax_included_in_price: boolean;
    contact_email: string;
    contact_response_time: string;
    store_name: string;
    business_siret: string;
    business_vat_number: string;
    social_facebook_url: string;
    social_instagram_url: string;
    social_tiktok_url: string;
    social_linkedin_url: string;
}

const DEFAULTS: SiteSettings = {
    currency: 'EUR',
    currency_symbol: '\u20ac',
    tax_rate: 0,
    tax_label: 'VAT',
    tax_included_in_price: true,
    contact_email: 'boutique@cafrezzo.com',
    contact_response_time: 'Within 24 business hours',
    store_name: 'Cafrezzo',
    business_siret: '',
    business_vat_number: '',
    social_facebook_url: '',
    social_instagram_url: '',
    social_tiktok_url: '',
    social_linkedin_url: '',
};

const SiteSettingsContext = createContext<SiteSettings>(DEFAULTS);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

    useEffect(() => {
        fetch(`${API_URL}/api/v1/settings`)
            .then(r => r.json())
            .then(data => {
                setSettings({
                    currency: data.currency ?? DEFAULTS.currency,
                    currency_symbol: data.currency_symbol ?? DEFAULTS.currency_symbol,
                    tax_rate: parseFloat(data.tax_rate) || 0,
                    tax_label: data.tax_label ?? DEFAULTS.tax_label,
                    tax_included_in_price: data.tax_included_in_price === 'true',
                    contact_email: data.contact_email ?? DEFAULTS.contact_email,
                    contact_response_time: data.contact_response_time ?? DEFAULTS.contact_response_time,
                    store_name: data.store_name ?? DEFAULTS.store_name,
                    business_siret: data.business_siret ?? DEFAULTS.business_siret,
                    business_vat_number: data.business_vat_number ?? DEFAULTS.business_vat_number,
                    social_facebook_url: data.social_facebook_url ?? DEFAULTS.social_facebook_url,
                    social_instagram_url: data.social_instagram_url ?? DEFAULTS.social_instagram_url,
                    social_tiktok_url: data.social_tiktok_url ?? DEFAULTS.social_tiktok_url,
                    social_linkedin_url: data.social_linkedin_url ?? DEFAULTS.social_linkedin_url,
                });
            })
            .catch(() => {/* keep defaults */});
    }, []);

    return (
        <SiteSettingsContext.Provider value={settings}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext);
}

/** Format a number as a price string using the site currency symbol. */
export function useFormatPrice() {
    const { currency_symbol } = useSiteSettings();
    return (amount: number | string) => {
        const n = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(n)) return `${currency_symbol}0.00`;
        // Clamp to 0 so float rounding error (e.g. -1e-10) never renders as "-0.00"
        return `${currency_symbol}${Math.max(0, n).toFixed(2)}`;
    };
}
