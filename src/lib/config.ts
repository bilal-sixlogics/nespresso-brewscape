export const AppConfig = {
    brand: {
        name: "Cafrezzo",
        nameUppercase: "CAFREZZO",
        domain: "cafrezzo.com",
        tagline: "Votre expert en café français",
        description: "Découvrez l'excellence du café avec Cafrezzo. Expert en café français depuis des années, nous vous proposons une sélection premium de grains, capsules et machines.",
        email: "contact@cafrezzo.com",
        phone: "+33 1 39 85 85 65",
        address: "30 rue de l'Escouvrier, 95200 Sarcelles, France",
        hours: "Lundi–Vendredi 9h–17h",
        heroLine1: "CAF-",
        heroLine2: "REZZO",
        heroSubtitle: "Discover the bold and sophisticated world of Cafrezzo premium coffee.",
        seoTitle: "Cafrezzo | Premium Coffee Experience",
        seoDescription: "Discover the art and science of premium coffee with Cafrezzo. Meticulously crafted for the modern coffee aficionado.",
        copyrightYear: new Date().getFullYear(),
    },

    // ─── Promo & Discount System ────────────────────────────────────────────
    // These simulate admin-controlled backend toggles.
    promo: {
        // Sitewide discount applied automatically to every order.
        sitewideDiscount: {
            enabled: true,
            percentage: 10, // 10% off all products automatically
        },

        // Free shipping threshold. Set to 0 to offer free shipping on all.
        freeShippingThreshold: 150, // e.g. EUR 150

        // Announcement banner (the strip at the very top).
        banner: {
            enabled: true,
            messages: [
                "☕ Livraison offerte dès 150€ d'achat",
                "🎉 -10% sur toute la boutique — Automatiquement appliqué",
            ],
            messagesEn: [
                "☕ Free Shipping on orders over €150",
                "🎉 -10% Sitewide — Automatically applied at checkout",
            ],
        },

        // Manual promo codes (simulating backend-provided codes).
        promoCodes: {
            "CAFREZZO20": { type: "percentage", value: 20, label: "20% Off" },
            "BIENVENUE": { type: "fixed", value: 10, label: "€10 Off" },
        } as Record<string, { type: "percentage" | "fixed"; value: number; label: string }>,
    },

    // ─── Shipping Rates ─────────────────────────────────────────────────────
    shipping: {
        standard: { id: 'standard' as const, label: "Standard (3–5 jours)", labelEn: "Standard (3–5 days)", price: 5.99 },
        express: { id: 'express' as const, label: "Express (1–2 jours)", labelEn: "Express (1–2 days)", price: 12.99 },
    },

    socials: [
        { name: 'Fb', url: '#' },
        { name: 'Ig', url: '#' },
        { name: 'Tw', url: '#' },
        { name: 'Yt', url: '#' },
    ],

    supportLinks: [
        { label: 'Contact & Boutiques', url: '/contact' },
        { label: 'FAQ', url: '/faq' },
        { label: 'Livraison & Retours', url: '/shipping' },
        { label: 'Politique de confidentialité', url: '/privacy' },
        { label: "Conditions d'utilisation", url: '/terms' },
    ],
};
