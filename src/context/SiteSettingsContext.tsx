"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SiteSettings {
    currency: string;
    currency_symbol: string;
    tax_rate: number;
    tax_label: string;
    tax_included_in_price: boolean;
}

const DEFAULTS: SiteSettings = {
    currency: 'EUR',
    currency_symbol: '\u20ac',
    tax_rate: 0,
    tax_label: 'VAT',
    tax_included_in_price: true,
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
        return `${currency_symbol}${n.toFixed(2)}`;
    };
}
