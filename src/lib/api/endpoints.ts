/**
 * API Endpoints — all backend routes in one place.
 * In production, BASE_URL comes from NEXT_PUBLIC_API_URL env variable.
 * Keeping it centralised means a single change updates the whole app.
 */

const API_VERSION = 'v1';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.cafrezzo.com';

export const API_BASE = `${BASE_URL}/api/${API_VERSION}`;

export const Endpoints = {
    // ── Store Config & CMS ───────────────────────────────────────────────
    settings: `${API_BASE}/settings`,
    shippingMethods: `${API_BASE}/shipping-methods`,
    paymentMethods: `${API_BASE}/payment-methods`,
    applyPromo: `${API_BASE}/promotions/apply`,
    promoStrips: `${API_BASE}/promo-strips`,
    heroBanners: `${API_BASE}/hero-banners`,
    featuredCollections: (key: string) => `${API_BASE}/featured-collections/${key}`,

    // ── Products ─────────────────────────────────────────────────────────
    products: `${API_BASE}/products`,
    product: (slug: string) => `${API_BASE}/products/${slug}`,
    productReviews: (slug: string) => `${API_BASE}/products/${slug}/reviews`,

    // ── Categories ───────────────────────────────────────────────────────
    categories: `${API_BASE}/categories`,

    // ── Blog ─────────────────────────────────────────────────────────────
    blogPosts: `${API_BASE}/blog`,
    blogPost: (id: string | number) => `${API_BASE}/blog/${id}`,

    // ── Store Locations ─────────────────────────────────────────────────
    storeLocations: `${API_BASE}/store-locations`,

    // ── Auth ─────────────────────────────────────────────────────────────
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
    forgotPassword: `${API_BASE}/auth/forgot-password`,
    resetPassword: `${API_BASE}/auth/reset-password`,
    profile: `${API_BASE}/profile`,
    profilePassword: `${API_BASE}/profile/password`,

    // ── User Account ─────────────────────────────────────────────────────
    addresses: `${API_BASE}/addresses`,
    address: (id: string | number) => `${API_BASE}/addresses/${id}`,
    addressDefault: (id: string | number) => `${API_BASE}/addresses/${id}/default`,
    notifications: `${API_BASE}/notifications`,
    notification: (id: string | number) => `${API_BASE}/notifications/${id}`,
    markAllRead: `${API_BASE}/notifications/read-all`,
    wishlist: `${API_BASE}/wishlist`,
    wishlistItem: (productId: string | number) => `${API_BASE}/wishlist/${productId}`,
    newsletter: `${API_BASE}/newsletter/subscribe`,
    newsletterUnsubscribe: `${API_BASE}/newsletter/unsubscribe`,
    contact: `${API_BASE}/contact`,

    // ── Catalog public ───────────────────────────────────────────────────
    featuredBrands: `${API_BASE}/brands/featured`,
    featuredReviews: `${API_BASE}/reviews/featured`,

    // ── Orders ───────────────────────────────────────────────────────────
    orders: `${API_BASE}/orders`,
    order: (id: string) => `${API_BASE}/orders/${id}`,
    placeOrder: `${API_BASE}/checkout`,
    trackOrder: `${API_BASE}/orders/track`,
    cancelOrder: (id: string) => `${API_BASE}/orders/${id}/cancel`,
    paymentStatus: (id: string | number) => `${API_BASE}/orders/${id}/payment-status`,
    returns: `${API_BASE}/returns`,
    return: (id: string) => `${API_BASE}/returns/${id}`,
} as const;
