import type { Product, SaleUnit } from '@/types';

/**
 * Conversion tracking: Meta Pixel + GA4 ecommerce events, behind one API.
 *
 * Call sites (cart, PDP, checkout, order success) describe WHAT happened in
 * commerce terms; this module translates it into each platform's vocabulary.
 * Keeping the mapping here means a new destination is one edit, not a hunt
 * through the checkout flow.
 *
 * Every function is a no-op unless the corresponding tag is actually on the
 * page — and tags only mount after consent (see components/MetaPixel.tsx and
 * components/GoogleAnalytics.tsx). So nothing in here needs its own consent
 * check: an event fired before consent simply finds no `fbq`/`gtag` and is
 * dropped, which is the correct outcome.
 */

/**
 * Meta Pixel ID, from the Events Manager data source.
 *
 * No hardcoded fallback, unlike GA_MEASUREMENT_ID: a pixel ID guessed or
 * copied from another project would send this shop's purchases into someone
 * else's ad account. Unset means the pixel is simply not installed.
 *
 * NEXT_PUBLIC_* is inlined at BUILD time — setting it on the server after
 * `next build` has no effect; rebuild after changing it.
 *
 * PRECONDITION — do not set this yet. The pixel loads on the same Accept as
 * GA, and the cookie banner (lib/consent-copy.ts) and the privacy policy
 * cookie section currently disclose analytics only. Before setting the ID:
 *   1. the banner copy must name advertising measurement and Meta;
 *   2. the privacy policy must list Meta as a recipient;
 *   3. STORAGE_KEY in context/ConsentContext.tsx must be bumped, so consent
 *      given against the analytics-only wording is asked for again.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

export function isMetaPixelEnabled(): boolean {
    return process.env.NODE_ENV === 'production' && /^\d{6,20}$/.test(META_PIXEL_ID);
}

const CURRENCY = 'EUR';

/** One line of a cart or order, platform-neutral. */
export interface TrackedItem {
    /** Stable product identifier. Must match the Meta catalogue's `id` if one is connected. */
    id: string;
    name: string;
    price: number;
    quantity: number;
    brand?: string;
    category?: string;
    /** Sale unit label ("1 kg", "Carton de 6") — GA4 `item_variant`. */
    variant?: string;
}

/**
 * Catalogue product + chosen sale unit → TrackedItem.
 *
 * The id is the PRODUCT id, not the sale-unit SKU: a Meta catalogue (and
 * the Product JSON-LD it can be built from) has one row per product, and
 * content_ids that do not match a row silently break dynamic retargeting.
 */
export function toTrackedItem(product: Product, saleUnit: SaleUnit | null, quantity = 1): TrackedItem {
    return {
        id: String(product.id),
        name: product.name,
        price: Number(saleUnit?.selling_price ?? product.selling_price) || 0,
        quantity,
        brand: product.brand?.name,
        category: product.category?.name,
        variant: saleUnit?.name,
    };
}

type Fbq = (...args: unknown[]) => void;

/**
 * Meta events raised before the pixel is installed on THIS page.
 *
 * On a full page load — which is what an ad click is — page effects run
 * before ConsentProvider has restored the stored decision, so the landing
 * page's ViewContent (or a reloaded order page's Purchase) would find no
 * `fbq` and vanish. They wait here instead. ConversionTracking flushes the
 * queue once the pixel is installed with consent, and discards it on every
 * navigation without consent, so nothing raised before a refusal is ever sent.
 */
let pendingMeta: unknown[][] = [];
const MAX_PENDING = 20;

function fbq(...args: unknown[]): void {
    try {
        const f = (window as unknown as { fbq?: Fbq }).fbq;
        if (f) f(...args);
        else if (pendingMeta.length < MAX_PENDING) pendingMeta.push(args);
    } catch { /* tracking must never break the page */ }
}

/** Sends queued events through a freshly installed pixel. */
export function flushPendingMetaEvents(f: Fbq): void {
    const queued = pendingMeta;
    pendingMeta = [];
    for (const args of queued) {
        try { f(...args); } catch { /* ignore */ }
    }
}

export function discardPendingMetaEvents(): void {
    pendingMeta = [];
}

function gtagEvent(name: string, params: Record<string, unknown>): void {
    try {
        window.gtag?.('event', name, params);
    } catch { /* ignore */ }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function metaContents(items: TrackedItem[]) {
    return {
        content_ids: items.map(i => i.id),
        contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: round2(i.price) })),
        content_type: 'product',
        num_items: items.reduce((s, i) => s + i.quantity, 0),
    };
}

function ga4Items(items: TrackedItem[]) {
    return items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        price: round2(i.price),
        quantity: i.quantity,
        ...(i.brand ? { item_brand: i.brand } : {}),
        ...(i.category ? { item_category: i.category } : {}),
        ...(i.variant ? { item_variant: i.variant } : {}),
    }));
}

const sumValue = (items: TrackedItem[]) => round2(items.reduce((s, i) => s + i.price * i.quantity, 0));

/** Product page viewed. */
export function trackViewContent(item: TrackedItem): void {
    const value = round2(item.price);
    fbq('track', 'ViewContent', {
        ...metaContents([item]),
        content_name: item.name,
        ...(item.category ? { content_category: item.category } : {}),
        value,
        currency: CURRENCY,
    });
    gtagEvent('view_item', { currency: CURRENCY, value, items: ga4Items([item]) });
}

export function trackAddToCart(item: TrackedItem): void {
    const value = sumValue([item]);
    fbq('track', 'AddToCart', {
        ...metaContents([item]),
        content_name: item.name,
        value,
        currency: CURRENCY,
    });
    gtagEvent('add_to_cart', { currency: CURRENCY, value, items: ga4Items([item]) });
}

export function trackInitiateCheckout(items: TrackedItem[], value: number): void {
    if (items.length === 0) return;
    fbq('track', 'InitiateCheckout', { ...metaContents(items), value: round2(value), currency: CURRENCY });
    gtagEvent('begin_checkout', { currency: CURRENCY, value: round2(value), items: ga4Items(items) });
}

/**
 * Completed order.
 *
 * `orderId` doubles as Meta's `eventID`. If a server-side Conversions API
 * integration is added later, it must send the same ID so Meta deduplicates
 * the browser and server copies instead of counting every sale twice.
 */
export function trackPurchase(orderId: string, value: number, items: TrackedItem[] = []): void {
    const v = round2(value);
    fbq(
        'track',
        'Purchase',
        { ...(items.length ? metaContents(items) : { content_type: 'product' }), value: v, currency: CURRENCY },
        { eventID: `order-${orderId}` },
    );
    gtagEvent('purchase', {
        transaction_id: orderId,
        currency: CURRENCY,
        value: v,
        ...(items.length ? { items: ga4Items(items) } : {}),
    });
}

/**
 * A visitor reached out (tap-to-call, email). For the B2B side of the
 * business this IS the conversion — trade buyers phone, they rarely check out.
 */
export function trackContact(method: 'phone' | 'email' | 'whatsapp'): void {
    fbq('track', 'Contact', { content_category: method });
    gtagEvent('generate_lead', { method });
}
