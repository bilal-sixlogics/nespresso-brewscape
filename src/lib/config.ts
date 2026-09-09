export const AppConfig = {
    brand: {
        name: "Cafrezzo",
        nameUppercase: "CAFREZZO",
        domain: "cafrezzo.com",
        tagline: "CAFREZZO — Votre expérience café",
        description: "Découvrez l'excellence du café avec Cafrezzo. Expert en café français depuis des années, nous vous proposons une sélection premium de grains, capsules et machines.",
        email: "boutique@cafrezzo.com",
        phone: "+33 1 39 85 85 65",
        address: "30 rue de l'Escouvrier, 95200 Gonesse, France",
        hours: "Lundi–Vendredi 9h–17h",
        heroLine1: "CAF-",
        heroLine2: "REZZO",
        heroSubtitle: "Discover the bold and sophisticated world of Cafrezzo premium coffee.",
        seoTitle: "Cafrezzo | Intensément Café",
        seoDescription: "Bienvenue dans l’univers Cafrezzo, où chaque tasse raconte une histoire de passion et de qualité. Découvrez notre sélection exclusive ..",
        copyrightYear: new Date().getFullYear(),
    },

    // ─── Promo Banner ────────────────────────────────────────────────────────
    // Static banner messages — promotions themselves are managed via admin panel.
    promoBanner: {
        enabled: true,
        messages: [
            "☕ Livraison offerte dès 150€ d'achat",
        ],
        messagesEn: [
            "☕ Free Shipping on orders over €150",
        ],
    },

    // Social links now live in admin-configurable site settings (see
    // SiteSettingsContext + Footer.tsx) instead of being hardcoded here.

    supportLinks: [
        { label: 'Contact & Boutiques', url: '/contact' },
        { label: 'FAQ', url: '/faq' },
        { label: 'Livraison & Retours', url: '/shipping' },
        { label: 'Politique de confidentialité', url: '/privacy' },
        { label: "Conditions d'utilisation", url: '/terms' },
    ],
};
