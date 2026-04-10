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
