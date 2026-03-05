
import { Product } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// ENRICHED PRODUCT CATALOGUE
// Demonstrates all data scenarios: full fields, partial fields, multi-pack
// units, discounts, gallery images, taste profiles, machine specs, etc.
// Each product category uses domain-correct research-backed attributes.
// ─────────────────────────────────────────────────────────────────────────────

// Helper to compute average rating
function avg(reviews: { rating: number }[]) {
    if (!reviews.length) return undefined;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

export const enrichedProducts: Product[] = [

    // ═══ CAFÉ EN GRAINS — Scenario: Full data, intensity 11/13, taste profile ═══
    {
        id: "eg-001",
        slug: "lavazza-crema-aroma-expert-1kg",
        category: "Café en Grains",
        name: "LAVAZZA CREMA & AROMA EXPERT",
        nameEn: "LAVAZZA CREMA & AROMA EXPERT",
        namePart2: "1 KG",
        namePart2En: "1 KG",
        tagline: "L'allié idéal des baristas professionnels.",
        taglineEn: "The ideal ally for professional baristas.",
        price: 19.90,
        originalPrice: 23.90,
        saleUnits: [
            { id: "su-1kg", label: "1 KG", labelEn: "1 KG", price: 19.90, originalPrice: 23.90, quantity: 1 },
            { id: "su-3kg", label: "3 KG", labelEn: "3 KG", price: 57.89, quantity: 3 },
            { id: "su-6kg", label: "6 KG", labelEn: "6 KG", price: 108.62, quantity: 6 },
        ],
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
        ],
        intensity: 11,
        tasteProfile: { bitterness: 4, acidity: 2, roastiness: 4, body: 5, sweetness: 2 },
        notes: ["Caramel", "Noix", "Dark Chocolate"],
        brewSizes: ["Espresso", "Lungo", "Ristretto"],
        isFeatured: true,
        tags: ["best-seller", "robusta-arabica"],
        desc: `Un mélange d'exception combinant **Robusta de haute qualité** et Arabica soigneusement sélectionné.\n\n- [x] Torréfaction foncée pour un espresso corsé\n- [x] Crème onctueuse et persistante\n- [x] Notes distinctes de caramel et noix\n\nIdéal pour les amateurs d'intensité et parfait pour les machines à grain professionnelles.`,
        descEn: `An exceptional blend combining **high-quality Robusta** and carefully selected Arabica.\n\n- [x] Dark roasted for a bold espresso\n- [x] Thick, lingering crema\n- [x] Distinct notes of caramel and nuts\n\nIdeal for those who prefer intensity and perfect for professional bean-to-cup machines.`,
        features: [
            {
                title: "Caractéristiques principales",
                titleEn: "Key Features",
                items: ["Intensité 11/13", "Mélange Arabica-Robusta", "Torréfaction Foncée", "Origine : Brésil & Ouganda", "Méthode : Lavé & Naturel"],
                itemsEn: ["Intensity 11/13", "Arabica-Robusta Blend", "Dark Roast", "Origin: Brazil & Uganda", "Process: Washed & Natural"],
            },
            {
                title: "Conseils de préparation",
                titleEn: "Brewing Tips",
                items: ["Température eau : 90–96°C", "Ratio : 1:2 (café:eau)", "Extraction : 25–30 secondes", "Mouture : Fine-Moyenne"],
                itemsEn: ["Water temp: 90–96°C", "Ratio: 1:2 (coffee:water)", "Extraction: 25–30 seconds", "Grind: Fine-Medium"],
            },
        ],
        reviews: [
            { id: "r1", user: "Jean-Pierre M.", rating: 5, title: "Parfait pour mon café pro", comment: "Un goût intense et très crémeux. Mes clients l'adorent.", date: "2025-11-12", verified: true },
            { id: "r2", user: "Amira K.", rating: 4, title: "Très bon rapport qualité/prix", comment: "Bonne intensité, convient bien pour les expressos courts.", date: "2025-10-28", verified: true },
            { id: "r3", user: "Thomas R.", rating: 5, title: "Le meilleur que j'ai essayé", comment: "Crème parfaite, arôme persistant. Livraison rapide.", date: "2025-12-01", verified: false },
        ],
        averageRating: 4.7,
    },

    // ═══ CAFÉ EN GRAINS — Scenario: Intensity 5, light roast, no sale units ════
    {
        id: "eg-002",
        slug: "delta-cafes-gold-1kg",
        category: "Café en Grains",
        name: "DELTA CAFES GOLD",
        nameEn: "DELTA CAFES GOLD",
        namePart2: "1 KG",
        tagline: "Un café en grains léger et fruité, torréfié avec finesse.",
        taglineEn: "A light, fruity whole-bean coffee, delicately roasted.",
        price: 25.50,
        image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1486912500284-6f4f69f8be8c?q=80&w=800&auto=format&fit=crop",
        ],
        intensity: 5,
        tasteProfile: { bitterness: 2, acidity: 4, roastiness: 2, body: 3, sweetness: 4 },
        notes: ["Agrumes", "Floral", "Fruits Rouges"],
        brewSizes: ["Espresso", "Lungo", "Filtre"],
        tags: ["arabica", "single-origin", "light-roast"],
        // No desc — tests the UI hiding this gracefully
    },

    // ═══ CAFE MOULU — Scenario: Intensity 9, discount, no taste profile ═════════
    {
        id: "cm-001",
        slug: "cafe-moulu-marcilla-natural-250g",
        category: "Café Moulu",
        name: "CAFÉ MOULU MARCILLA NATURAL",
        nameEn: "MARCILLA NATURAL GROUND COFFEE",
        namePart2: "250G",
        price: 6.20,
        originalPrice: 7.90,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
        intensity: 9,
        notes: ["Fumé", "Épices", "Caramel"],
        brewSizes: ["Filtre", "Cafetière à piston", "Percolateur"],
        tags: ["best-seller"],
        desc: `Un café moulu d'origine naturelle, idéal pour les amateurs d'un café bien corsé.\n\n- Sélectionné depuis les meilleures plantations d'Amérique Latine\n- Torréfié soigneusement pour un **arôme fumé et épicé**\n- Mouture idéale pour cafetières à piston ou filtre`,
        descEn: `A naturally processed ground coffee, ideal for those who prefer a full-bodied brew.\n\n- Sourced from the finest Latin American plantations\n- Carefully roasted for a **smoky, spiced aroma**\n- Perfect grind for French press or filter coffee makers`,
        features: [
            {
                title: "Caractéristiques",
                titleEn: "Characteristics",
                items: ["Intensité 9/13", "Origine : Amérique Latine", "Torréfaction : Moyenne-Foncée", "Mouture : Medium"],
                itemsEn: ["Intensity 9/13", "Origin: Latin America", "Roast: Medium-Dark", "Grind: Medium"],
            },
        ],
        reviews: [
            { id: "r4", user: "Claire D.", rating: 4, comment: "Très bon café moulu, bonne crèma. Je recommande.", date: "2025-11-05", verified: true },
        ],
        averageRating: 4,
    },

    // ═══ CAPSULES — Scenario: No description, no taste profile, intensity 13 ════
    {
        id: "cap-001",
        slug: "capsules-nespresso-comp-intenso-10st",
        category: "Capsules de Café",
        name: "CAPSULES COMPATIBLES NESPRESSO — INTENSO",
        nameEn: "NESPRESSO-COMPATIBLE CAPSULES — INTENSO",
        namePart2: "10 CAPSULES",
        price: 3.90,
        saleUnits: [
            { id: "c10", label: "10 Capsules", price: 3.90, quantity: 10 },
            { id: "c50", label: "50 Capsules", price: 18.00, quantity: 50 },
            { id: "c100", label: "100 Capsules", price: 33.00, quantity: 100 },
        ],
        image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop",
        intensity: 13,
        // No tasteProfile, no desc, no notes — fully tests graceful rendering
        brewSizes: ["Espresso", "Ristretto"],
        tags: ["eco-friendly"],
        isNew: true,
    },

    // ═══ CAPSULES — Scenario: Full data, intensity 7 ════════════════════════════
    {
        id: "cap-002",
        slug: "capsules-biodegradables-lungo-50st",
        category: "Capsules de Café",
        name: "CAPSULES BIODÉGRADABLES LUNGO",
        nameEn: "BIODEGRADABLE LUNGO CAPSULES",
        namePart2: "LOT DE 50",
        namePart2En: "PACK OF 50",
        tagline: "Profitez de votre café avec une conscience tranquille.",
        taglineEn: "Enjoy your coffee with a clear conscience.",
        price: 21.50,
        image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
        intensity: 7,
        tasteProfile: { bitterness: 3, acidity: 3, roastiness: 3, body: 3, sweetness: 3 },
        notes: ["Noisette", "Boisé", "Doux"],
        saleUnits: [
            { id: "l50", label: "Lot de 50", price: 21.50, quantity: 50 },
            { id: "l200", label: "Lot de 200", price: 78.00, quantity: 200 },
        ],
        tags: ["eco-friendly", "biodegradable"],
        desc: "Capsules 100% compostables et biodégradables, compatibles avec les machines Nespresso. Un café équilibré, ni trop fort ni trop léger, pour une pause café parfaite à tout moment.",
        descEn: "100% compostable and biodegradable capsules compatible with Nespresso machines. A balanced coffee — not too bold, not too light — for the perfect coffee break at any time.",
        features: [
            {
                title: "Éco-responsabilité",
                titleEn: "Sustainability",
                items: ["Capsules 100% compostables", "Emballage recyclable", "Café issu du commerce équitable"],
                itemsEn: ["100% compostable capsules", "Recyclable packaging", "Fair-trade sourced coffee"],
            },
        ],
        averageRating: 4.5,
    },

    // ═══ MACHINES — Scenario: Full specs, super-automatic, featured ═════════════
    {
        id: "mach-001",
        slug: "delonghi-magnifica-evo-super-auto",
        category: "Machines à Café",
        name: "DELONGHI MAGNIFICA EVO",
        nameEn: "DELONGHI MAGNIFICA EVO",
        namePart2: "MACHINE SUPER-AUTOMATIQUE",
        namePart2En: "SUPER-AUTOMATIC MACHINE",
        tagline: "Du grain à la tasse, en une touche.",
        taglineEn: "From bean to cup, at a touch.",
        price: 549.00,
        originalPrice: 649.00,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542778098-87e909a29f0b?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
        ],
        // No intensity (machines don't have a roast intensity)
        brewSizes: ["Espresso", "Latte", "Cappuccino", "Lungo", "Americano"],
        isFeatured: true,
        tags: ["super-automatic", "best-seller", "home", "professional"],
        desc: "La DeLonghi Magnifica Evo est la machine super-automatique par excellence. Grâce à son moulin intégré à meules coniques, elle moud les grains à la demande pour un espresso toujours frais. Son bras vapeur vapeur LatteCrema prépare une mousse de lait parfaitement veloutée.",
        descEn: "The DeLonghi Magnifica Evo is the super-automatic machine par excellence. Its integrated conical burr grinder grinds fresh beans on demand for an always-fresh espresso. The LatteCrema steam wand produces perfectly velvety milk foam.",
        features: [
            {
                title: "Spécifications Techniques",
                titleEn: "Technical Specifications",
                items: [
                    "Type : Super-Automatique",
                    "Pression pompe : 15 bars",
                    "Système chauffe : Thermoblock",
                    "Moulin : Conique Inox, 13 niveaux de mouture",
                    "Réservoir eau : 1.8L",
                    "Capacité fèves : 250g",
                    "Bac à marc : 14 doses",
                    "Puissance : 1450W",
                    "Dimensions : L21 × H35 × P43 cm",
                ],
                itemsEn: [
                    "Type: Super-Automatic",
                    "Pump pressure: 15 bar",
                    "Heating: Thermoblock",
                    "Grinder: Conical Stainless, 13 grind settings",
                    "Water tank: 1.8L",
                    "Bean hopper: 250g",
                    "Grounds container: 14 doses",
                    "Power: 1450W",
                    "Dimensions: W21 × H35 × D43 cm",
                ],
            },
            {
                title: "Boissons disponibles",
                titleEn: "Available Drinks",
                items: ["Espresso", "Espresso Long", "Cappuccino", "Latte Macchiato", "Americano", "Café Chaud"],
                itemsEn: ["Espresso", "Long Espresso", "Cappuccino", "Latte Macchiato", "Americano", "Hot Coffee"],
            },
        ],
        reviews: [
            { id: "r5", user: "Marc L.", rating: 5, title: "Incroyable machine !", comment: "L'espresso est parfait, la mousse de lait est excellente. Meilleur achat de l'années.", date: "2025-12-15", verified: true },
            { id: "r6", user: "Sophie T.", rating: 4, title: "Facile à utiliser", comment: "Très pratique, bonne qualité de café. Le nettoyage est simple.", date: "2025-11-30", verified: true },
        ],
        averageRating: 4.5,
    },

    // ═══ MACHINES — Scenario: Semi-auto, no discount, no reviews ═══════════════
    {
        id: "mach-002",
        slug: "sage-barista-express-semi-auto",
        category: "Machines à Café",
        name: "SAGE THE BARISTA EXPRESS",
        nameEn: "SAGE THE BARISTA EXPRESS",
        namePart2: "MACHINE SEMI-AUTOMATIQUE",
        namePart2En: "SEMI-AUTOMATIC MACHINE",
        tagline: "La précision barista chez vous.",
        taglineEn: "Barista precision at home.",
        price: 749.00,
        image: "https://images.unsplash.com/photo-1542778098-87e909a29f0b?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Espresso", "Flat White", "Lungo"],
        tags: ["semi-automatic", "home", "barista"],
        isFeatured: true,
        features: [
            {
                title: "Spécifications",
                titleEn: "Specifications",
                items: [
                    "Type : Semi-Automatique",
                    "Pression : 9 bars optimisée",
                    "Chauffe : Thermocoil",
                    "Moulin intégré : Conique 54mm",
                    "Réservoir : 2L",
                    "Puissance : 1680W",
                    "Bec vapeur manuel",
                ],
                itemsEn: [
                    "Type: Semi-Automatic",
                    "Pressure: 9 bar optimised",
                    "Heating: Thermocoil",
                    "Integrated grinder: 54mm conical burr",
                    "Tank: 2L",
                    "Power: 1680W",
                    "Manual steam wand",
                ],
            },
        ],
    },
    {
        id: "mach-003",
        slug: "nespresso-vertuo-pop",
        category: "Machines à Café",
        name: "NESPRESSO VERTUO POP",
        nameEn: "NESPRESSO VERTUO POP",
        namePart2: "COMPACT & COLORÉ",
        namePart2En: "COMPACT & COLOURFUL",
        tagline: "Un style éclatant pour de grands cafés.",
        taglineEn: "A dash of colour for big coffee moments.",
        price: 99.00,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Espresso", "Mug", "Gran Lungo"],
        tags: ["capsule", "compact", "vertuo"],
        isFeatured: true,
        desc: "La machine Vertuo Pop ajoute une touche de couleur à votre vie. Disponible en plusieurs coloris vifs, elle utilise la technologie Centrifusion™ pour extraire le meilleur de chaque capsule.",
        descEn: "Vertuo Pop adds a splash of colour to your lifestyle. Available in various vibrant colours, it uses Centrifusion™ technology to extract the best from every capsule.",
    },
    {
        id: "mach-004",
        slug: "philips-lattego-2200",
        category: "Machines à Café",
        name: "PHILIPS LATTEGO 2200",
        nameEn: "PHILIPS LATTEGO 2200",
        namePart2: "SÉRIE 2200",
        namePart2En: "2200 SERIES",
        tagline: "Une mousse de lait onctueuse en un clin d'œil.",
        taglineEn: "Silky-smooth milk froth in an instant.",
        price: 399.00,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Cappuccino", "Espresso", "Classic Coffee"],
        tags: ["super-automatic", "lattego", "value"],
        isFeatured: true,
        desc: "Le système LatteGo le plus rapide à nettoyer. Dégustez 2 types de café d'une simple pression sur un bouton et profitez d'une mousse de lait onctueuse.",
        descEn: "The fastest-to-clean LatteGo system ever. Enjoy 2 types of coffee at the touch of a button and indulge in silky-smooth milk foam.",
    },
    {
        id: "mach-005",
        slug: "krups-evidence-one",
        category: "Machines à Café",
        name: "KRUPS EVIDENCE ONE",
        nameEn: "KRUPS EVIDENCE ONE",
        namePart2: "SUPER-AUTOMATIQUE",
        namePart2En: "SUPER-AUTOMATIC",
        tagline: "La perfection de l'espresso, de l'extraction à la tasse.",
        taglineEn: "Espresso perfection, from extraction to cup.",
        price: 649.00,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Espresso", "Double Espresso", "Lattes"],
        tags: ["made-in-france", "professional", "OLED-screen"],
        isFeatured: true,
        desc: "L'Evidence One de Krups offre une personnalisation totale de vos boissons préférées. Son broyeur en acier inoxydable garantit une mouture précise et durable.",
        descEn: "Krups Evidence One offers full customisation of your favourite drinks. Its stainless steel grinder ensures precise and long-lasting grinding.",
    },
    {
        id: "mach-006",
        slug: "breville-oracle-touch",
        category: "Machines à Café",
        name: "BREVILLE ORACLE TOUCH",
        nameEn: "BREVILLE ORACLE TOUCH",
        namePart2: "SÉCURITÉ ET PERFORMANCE",
        namePart2En: "SAFETY AND PERFORMANCE",
        tagline: "Le barista automatisé dans votre cuisine.",
        taglineEn: "The automated barista in your kitchen.",
        price: 2499.00,
        image: "https://images.unsplash.com/photo-1542778098-87e909a29f0b?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Flat White", "Cappuccino", "Long Black"],
        tags: ["luxury", "fully-automated", "touch-screen"],
        isFeatured: true,
        desc: "L'Oracle Touch automatise les étapes les plus difficiles de la préparation d'un espresso manuel : dosage, tassage et moussage du lait.",
        descEn: "The Oracle Touch automates the hardest parts of manual espresso making: dosing, tamping, and milk frothing.",
    },
    {
        id: "mach-007",
        slug: "jura-ena-8",
        category: "Machines à Café",
        name: "JURA ENA 8",
        nameEn: "JURA ENA 8",
        namePart2: "SIGNATURE LINE",
        namePart2En: "SIGNATURE LINE",
        tagline: "Design compact, café exceptionnel.",
        taglineEn: "Small design, big coffee.",
        price: 1199.00,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Espresso", "Macchiato", "Cortado"],
        tags: ["swiss-made", "compact-luxury", "one-touch"],
        isFeatured: true,
        desc: "La nouvelle ENA 8 se distingue par son design compact et ses technologies de pointe, comme le moulin AromaG3 et le procédé d'extraction pulsée (P.E.P.®).",
        descEn: "The new ENA 8 stands out with its compact design and high-end technologies, like the AromaG3 grinder and Pulse Extraction Process (P.E.P.®).",
    },
    {
        id: "mach-008",
        slug: "smeg-50s-style-espresso",
        category: "Machines à Café",
        name: "SMEG 50'S STYLE",
        nameEn: "SMEG 50'S STYLE",
        namePart2: "MACHINE EXPRESSO MANUELLE",
        namePart2En: "MANUAL ESPRESSO MACHINE",
        tagline: "L'élégance vintage rencontre la modernité.",
        taglineEn: "Vintage elegance meets modern performance.",
        price: 349.00,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Single Espresso", "Double Espresso"],
        tags: ["retro", "design-icon", "compact"],
        isFeatured: true,
        desc: "Alliant design iconique et performance, la machine à café Smeg apporte une touche rétro-chic à votre cuisine tout en garantissant un espresso parfait.",
        descEn: "Combining iconic design and performance, the Smeg coffee machine brings a retro-chic touch to your kitchen while ensuring a perfect espresso.",
    },
    {
        id: "mach-009",
        slug: "melitta-caffeo-barista-ts",
        category: "Machines à Café",
        name: "MELITTA CAFFEO BARISTA TS",
        nameEn: "MELITTA CAFFEO BARISTA TS",
        namePart2: "SMART",
        namePart2En: "SMART",
        tagline: "Le connaisseur de café intelligent.",
        taglineEn: "The smart coffee connoisseur.",
        price: 899.00,
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["21 Variétés", "Espresso", "Latte"],
        tags: ["smart-connectivity", "triple-chamber-grinder", "custom-profiles"],
        isFeatured: true,
        desc: "Avec 21 variétés de café prédéfinies et son réservoir à grains à deux compartiments, la Caffeo Barista TS Smart s'adapte à toutes vos envies.",
        descEn: "With 21 preset coffee varieties and its dual-chamber bean container, the Caffeo Barista TS Smart adapts to all your preferences.",
    },
    {
        id: "mach-010",
        slug: "gaggia-classic-pro",
        category: "Machines à Café",
        name: "GAGGIA CLASSIC PRO",
        nameEn: "GAGGIA CLASSIC PRO",
        namePart2: "L'ESSENTIEL DE L'ESPRESSO",
        namePart2En: "THE ESPRESSO ESSENTIAL",
        tagline: "L'authentique espresso italien à la maison.",
        taglineEn: "Authentic Italian espresso at home.",
        price: 449.00,
        image: "https://images.unsplash.com/photo-1542778098-87e909a29f0b?q=80&w=800&auto=format&fit=crop",
        brewSizes: ["Espresso", "Ristretto"],
        tags: ["manual", "prosumer", "stainless-steel"],
        isFeatured: true,
        desc: "La Gaggia Classic Pro est la machine préférée des puristes. Sa conception robuste et son groupe professionnel vous permettent de maîtriser l'art de l'espresso.",
        descEn: "The Gaggia Classic Pro is the favorite machine for purists. Its robust design and professional group head allow you to master the art of espresso.",
    },

    // ═══ ACCESSOIRES / GOBELET — Scenario: No intensity, multi-pack, eco ════════
    {
        id: "acc-001",
        slug: "gobelets-carton-12cl-cafemalin-lot-50",
        category: "Accessoires",
        name: "GOBELETS EN CARTON CAFÉMALIN 4 OZ (12 CL)",
        nameEn: "CAFÉMALIN CARDBOARD CUPS 4 OZ (12 CL)",
        namePart2: "LOT DE 50",
        namePart2En: "PACK OF 50",
        tagline: "L'allié idéal pour vos pauses café professionnelles et personnelles.",
        taglineEn: "The ideal partner for your professional and personal coffee breaks.",
        price: 4.90,
        originalPrice: 5.90,
        saleUnits: [
            { id: "lot50", label: "Lot de 50", labelEn: "Pack of 50", price: 4.90, originalPrice: 5.90, quantity: 50 },
            { id: "lot250", label: "Lot de 250", labelEn: "Pack of 250", price: 21.00, quantity: 250 },
            { id: "lot500", label: "Carton 500", labelEn: "Carton of 500", price: 38.00, quantity: 500 },
        ],
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600871890700-a46ab2f94e26?q=80&w=800&auto=format&fit=crop",
        ],
        // No intensity — UI should not render the intensity bar
        tags: ["eco-friendly", "professional"],
        desc: "Les gobelets en carton 12 cl Cafémalin sont conçus pour s'adapter aux besoins des professionnels comme des particuliers. Parfaits pour servir des expressos, cafés allongés, thés ou autres boissons chaudes.",
        descEn: "Cafémalin 12cl cardboard cups are designed for both professionals and individuals. Perfect for serving espressos, long coffees, teas, or other hot beverages.",
        features: [
            {
                title: "Caractéristiques",
                titleEn: "Characteristics",
                items: [
                    "Capacité : 12 cl (4 Oz)",
                    "Revêtement intérieur anti-fuite",
                    "Carton robuste pour maintien thermique",
                ],
                itemsEn: [
                    "Capacity: 12 cl (4 Oz)",
                    "Leak-proof inner lining",
                    "Robust board for heat retention",
                ],
            },
            {
                title: "Éco-responsabilité",
                titleEn: "Sustainability",
                items: ["Carton issus de forêts gérées durablement (FSC)", "Recyclable après usage"],
                itemsEn: ["Board from sustainably managed forests (FSC)", "Recyclable after use"],
            },
        ],
        reviews: [
            { id: "r7", user: "Hélène V.", rating: 5, comment: "Qualité impeccable, tiennent la chaleur longtemps. J'en commande tout le temps.", date: "2025-12-03", verified: true },
        ],
        averageRating: 5,
    },

    // ═══ FRIANDISES (SWEETS) — Scenario: No intensity, no taste profile ═════════
    {
        id: "swt-001",
        slug: "speculoos-biscuits-cafe-lot-200",
        category: "Friandises",
        name: "SPÉCULOOS BISCUITS CAFÉ",
        nameEn: "COFFEE SPECULOOS BISCUITS",
        namePart2: "LOT DE 200 SACHETS",
        namePart2En: "BOX OF 200 SACHETS",
        tagline: "La douceur qui accompagne toutes les pauses café.",
        taglineEn: "The sweet treat that elevates every coffee break.",
        price: 18.50,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop",
        saleUnits: [
            { id: "lot100", label: "Lot de 100", labelEn: "Pack of 100", price: 10.50, quantity: 100 },
            { id: "lot200", label: "Lot de 200", labelEn: "Pack of 200", price: 18.50, quantity: 200 },
        ],
        // No intensity, no taste profile, no notes — pure sweet, tests graceful UI
        tags: ["sweet", "biscuit"],
        desc: "Des biscuits spéculoos individuellement emballés, parfaits pour accompagner un café ou un thé. Le goût unique, caramélisé et épicé du spéculoos en format mini.",
        descEn: "Individually wrapped speculoos biscuits, perfect to accompany a coffee or tea. The unique, caramelised, spiced flavour of speculoos in a mini format.",
        features: [
            {
                title: "Informations produit",
                titleEn: "Product Information",
                items: ["Poids unitaire : 6g", "Ingrédients : Farine, Sugar, Beurre, Cannelle", "Allergènes : Gluten, Lait, Œufs"],
                itemsEn: ["Unit weight: 6g", "Ingredients: Flour, Sugar, Butter, Cinnamon", "Allergens: Gluten, Milk, Eggs"],
            },
        ],
    },

    // ═══ VENDING / DISTRIBUTEUR — Scenario: No intensity, professional use ══════
    {
        id: "vend-001",
        slug: "distributeur-automatique-necta-brio",
        category: "Vending",
        name: "DISTRIBUTEUR NECTA BRIO 3",
        nameEn: "NECTA BRIO 3 VENDING MACHINE",
        namePart2: "DISTRIBUTEUR AUTOMATIQUE CAFÉ",
        namePart2En: "AUTOMATIC COFFEE VENDING MACHINE",
        tagline: "La solution café complète pour vos espaces professionnels.",
        taglineEn: "The complete coffee solution for your professional spaces.",
        price: 0, // Price on request
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
        tags: ["professional", "vending"],
        isFeatured: true,
        features: [
            {
                title: "Spécifications",
                titleEn: "Specifications",
                items: [
                    "Capacité : 350 tasses/jour",
                    "Boissons : Espresso, Lungo, Cappuccino, Chocolat Chaud, Thé",
                    "Réservoir eau : 10L",
                    "Besoins électriques : 220V / 10A",
                    "Dimensions : L43 × H182 × P56 cm",
                    "Paiement : Monnayeur, Carte sans contact",
                ],
                itemsEn: [
                    "Capacity: 350 cups/day",
                    "Drinks: Espresso, Lungo, Cappuccino, Hot Chocolate, Tea",
                    "Water tank: 10L",
                    "Power: 220V / 10A",
                    "Dimensions: W43 × H182 × D56 cm",
                    "Payment: Coin, Contactless card",
                ],
            },
        ],
        desc: "Le NECTA Brio 3 est un distributeur automatique compact et polyvalent, idéal pour les entreprises, hôtels, et espaces communs. Il prépare une large gamme de boissons chaudes en moins de 30 secondes.",
        descEn: "The NECTA Brio 3 is a compact, versatile vending machine, ideal for businesses, hotels, and shared spaces. It prepares a wide range of hot drinks in under 30 seconds.",
    },

    // ═══ THÉ & BOISSONS — Scenario: No intensity, pack units ═════════════════════
    {
        id: "the-001",
        slug: "infusions-the-noir-english-breakfast",
        category: "Thé & Boissons",
        name: "ENGLISH BREAKFAST THÉ NOIR",
        nameEn: "ENGLISH BREAKFAST BLACK TEA",
        namePart2: "100 SACHETS",
        price: 8.90,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop",
        saleUnits: [
            { id: "t100", label: "100 Sachets", price: 8.90, quantity: 100 },
            { id: "t500", label: "500 Sachets", price: 39.00, quantity: 500, originalPrice: 44.50 },
        ],
        tags: ["tea", "hot-drinks"],
        // No intensity — tea doesn't use coffee intensity scale
        desc: "Un thé noir robuste et corsé, parfait pour bien commencer la matinée. Sachets individuels emballés pour une fraîcheur maximale.",
        descEn: "A robust, full-bodied black tea, perfect for starting the morning. Individually wrapped sachets for maximum freshness.",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Flat helper to search across all enriched products
// ─────────────────────────────────────────────────────────────────────────────
export function getAllEnrichedProducts(): Product[] {
    return enrichedProducts;
}

export function getEnrichedProductBySlug(slug: string): Product | undefined {
    return enrichedProducts.find(p => p.slug === slug);
}

export function getEnrichedProductsByCategory(category: string): Product[] {
    return enrichedProducts.filter(p => p.category === category);
}

export function getFeaturedMachines(): Product[] {
    return enrichedProducts.filter(p => p.category === "Machines à Café" && p.isFeatured);
}

// All products in the enriched database (for search across all types)
export function getAllProducts(): Product[] {
    return getAllEnrichedProducts();
}



export const categoriesList = [
    "Café en Grains",
    "Café Moulu",
    "Capsules de Café",
    "Machines à Café",
    "Packs",
    "Vending",
    "Thé & Boissons",
    "Accessoires",
    "Friandises",
    "Blog CaféMalin"
];

export const productDatabase: Record<string, Product[]> = {
    "Café en Grains": [
        {
            "id": 2000,
            "name": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT", "nameEn": "COFFEE BEANS LAVAZZA CREMA & AROMA EXPERT",
            "namePart2": "1 KG",
            "price": 19.9,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2001,
            "name": "CAFÉ EN GRAINS DELTA CAFES GOLD 1KG", "nameEn": "COFFEE BEANS DELTA CAFES GOLD 1KG",
            "namePart2": "",
            "price": 25.5,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2002,
            "name": "CAFÉ EN GRAINS DELTA PLATINUM 1 KG", "nameEn": "COFFEE BEANS DELTA PLATINUM 1 KG",
            "namePart2": "",
            "price": 26.5,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2003,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 57.89,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2004,
            "name": "CAFÉ EN GRAIN COVIM", "nameEn": "COFFEE BEANS COVIM",
            "namePart2": "GRANBAR",
            "price": 15.5,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2005,
            "name": "20KG", "nameEn": "20KG",
            "namePart2": "CAFÉ EN GRAINS DELTA CAFES GOLD",
            "price": 0,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2006,
            "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
            "namePart2": "BIO COFFEE 1KG",
            "price": 18.8,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2007,
            "name": "6KG", "nameEn": "6KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 108.62,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2008,
            "name": "5KG", "nameEn": "5KG",
            "namePart2": "CAFÉ EN GRAINS DELTA CAFÉS GRAN CREMA",
            "price": 0,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2009,
            "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
            "namePart2": "COLOMBIA 500G",
            "price": 14.8,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2010,
            "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
            "namePart2": "BRAZIL 500G",
            "price": 13.75,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2011,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "GASTRONOMIQUE",
            "price": 4.9,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2012,
            "name": "PACK 6KG", "nameEn": "PACK 6KG",
            "namePart2": "CAFÉ EN GRAIN BRISTOT CLASSICO INTENSO E CREMOSO",
            "price": 101.85,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2013,
            "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
            "namePart2": "3×1 KG",
            "price": 62.57,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2014,
            "name": "20KG CAFÉ EN GRAINS CREMA ET AROMA", "nameEn": "20KG COFFEE BEANS CREMA ET AROMA",
            "namePart2": "LAVAZZA",
            "price": 480.87,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2015,
            "name": "KIMBO SUPERIOR BLEND", "nameEn": "KIMBO SUPERIOR BLEND",
            "namePart2": "CAFÉ EN GRAIN 1KG",
            "price": 16.3,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2016,
            "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 6X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 6X1KG",
            "namePart2": "",
            "price": 162.68,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2017,
            "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 12X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 12X1KG",
            "namePart2": "",
            "price": 318.65,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2018,
            "name": "CAFÉ EN GRAINS LAVAZZA CREMA CLASSICA 3KG", "nameEn": "COFFEE BEANS LAVAZZA CREMA CLASSICA 3KG",
            "namePart2": "",
            "price": 64,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Café Moulu": [
        {
            "id": 3000,
            "name": "CAFÉ MOULU 250G GOLD", "nameEn": "GROUND COFFEE 250G GOLD",
            "namePart2": "DELTA",
            "price": 5.9,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 3001,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "PRESTIGE",
            "price": 4.9,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 3002,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "DÉGUSTATION",
            "price": 4.9,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 3003,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "GASTRONOMIQUE",
            "price": 4.9,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Capsules de Café": [
        {
            "id": 4000,
            "name": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES",
            "namePart2": "",
            "price": 6.2,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4001,
            "name": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES",
            "namePart2": "",
            "price": 6.2,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4002,
            "name": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES", "nameEn": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES",
            "namePart2": "",
            "price": 28.7,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4003,
            "name": "DELTA Q QHARACTER N°9", "nameEn": "DELTA Q QHARACTER N°9",
            "namePart2": "10 CAPSULES",
            "price": 3.45,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4004,
            "name": "PACK CAPSULES LAVAZZA BLUE", "nameEn": "PACK CAPSULES LAVAZZA BLUE",
            "namePart2": "",
            "price": 5,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4005,
            "name": "LAVAZZA BLUE RICCO", "nameEn": "LAVAZZA BLUE RICCO",
            "namePart2": "X100 CAPSULES",
            "price": 32,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4006,
            "name": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®",
            "namePart2": "LAVAZZA",
            "price": 26.34,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4007,
            "name": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES",
            "namePart2": "",
            "price": 32.77,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4008,
            "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
            "namePart2": "",
            "price": 128.08,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4009,
            "name": "DELTA Q COLOMBIA", "nameEn": "DELTA Q COLOMBIA",
            "namePart2": "10 CAPSULES",
            "price": 4.4,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4010,
            "name": "DELTA Q VIETNAM", "nameEn": "DELTA Q VIETNAM",
            "namePart2": "10 CAPSULES",
            "price": 4.4,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4011,
            "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
            "namePart2": "40 CAPSULES",
            "price": 14.65,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4012,
            "name": "DELTA Q QHARISMA N°12", "nameEn": "DELTA Q QHARISMA N°12",
            "namePart2": "40 CAPSULES",
            "price": 11.3,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4013,
            "name": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES", "nameEn": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES",
            "namePart2": "",
            "price": 9.7,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4014,
            "name": "DELTA Q MENTHE CHOCOLAT", "nameEn": "DELTA Q MENTHE CHOCOLAT",
            "namePart2": "10 CAPSULES",
            "price": 3.65,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4015,
            "name": "DELTA Q", "nameEn": "DELTA Q",
            "namePart2": "PACK DÉCOUVERTE",
            "price": 8.08,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4016,
            "name": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES",
            "namePart2": "",
            "price": 14.78,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4017,
            "name": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES", "nameEn": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES",
            "namePart2": "",
            "price": 5,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4018,
            "name": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES", "nameEn": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES",
            "namePart2": "",
            "price": 5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4019,
            "name": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®",
            "namePart2": "LAVAZZA",
            "price": 27.63,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4020,
            "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
            "namePart2": "10 CAPSULES LUNGO",
            "price": 2.55,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4021,
            "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
            "namePart2": "PACK 10X10 CAPSULES",
            "price": 0,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4022,
            "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
            "namePart2": "",
            "price": 5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4023,
            "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE",
            "namePart2": "18 UNITÉS",
            "price": 8.79,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4024,
            "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA",
            "namePart2": "18 UNITÉS",
            "price": 8.79,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4025,
            "name": "KIMBO COMPATIBLE MODO MIO", "nameEn": "KIMBO COMPATIBLE MODO MIO",
            "namePart2": "CAPRI",
            "price": 16,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4026,
            "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO",
            "namePart2": "18 DOSETTES",
            "price": 8.05,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4027,
            "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA",
            "namePart2": "18 UNITÉS",
            "price": 8.79,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4028,
            "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES",
            "namePart2": "",
            "price": 5,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4029,
            "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ",
            "namePart2": "18 DOSETTES",
            "price": 8.05,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4030,
            "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4031,
            "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
            "namePart2": "10X10 CAPSULES LUNGO",
            "price": 0,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4032,
            "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4033,
            "name": "KIMBO COMPATIBLE NESPRESSO", "nameEn": "KIMBO COMPATIBLE NESPRESSO",
            "namePart2": "NAPOLI",
            "price": 0,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4034,
            "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE",
            "namePart2": "180 DOSETTES",
            "price": 0,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Machines à Café": [
        {
            "id": 5000,
            "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
            "namePart2": "LAVAZZA BLUE LB900 COMPACT",
            "price": 199,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5001,
            "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
            "namePart2": "",
            "price": 128.08,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5002,
            "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
            "namePart2": "LAVAZZA BLUE LB1050 CLASSY MILK",
            "price": 239,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5003,
            "name": "MACHINE À CAFÉ LAVAZZA A MODO MIO", "nameEn": "MACHINE À CAFÉ LAVAZZA A MODO MIO",
            "namePart2": "JOLIE PLUS SILVER",
            "price": 119,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5004,
            "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5005,
            "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5006,
            "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
            "namePart2": "NOIR",
            "price": 199.5,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5007,
            "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
            "namePart2": "ROUGE",
            "price": 199.5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5008,
            "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
            "namePart2": "INOX",
            "price": 699,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5009,
            "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
            "namePart2": "ROUGE",
            "price": 699,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Packs": [
        {
            "id": 6000,
            "name": "6KG", "nameEn": "6KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 108.62,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6001,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 57.89,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6002,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAINS GOLD SELECTION",
            "price": 84.38,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6003,
            "name": "3KG LAVAZZA CREMA CLASSICA", "nameEn": "3KG LAVAZZA CREMA CLASSICA",
            "namePart2": "",
            "price": 64,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6004,
            "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
            "namePart2": "",
            "price": 5,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6005,
            "name": "PACK CAFÉ EN GRAIN ORIGINE", "nameEn": "PACK COFFEE BEANS ORIGINE",
            "namePart2": "DELTA CAFÉS",
            "price": 27.9,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6006,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAIN PRONTO CREMA LAVAZZA",
            "price": 57.89,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6007,
            "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
            "namePart2": "6×1 KG",
            "price": 122.55,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6008,
            "name": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6009,
            "name": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 32,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6010,
            "name": "ILLY COMPATIBLES NESPRESSO®", "nameEn": "ILLY COMPATIBLES NESPRESSO®",
            "namePart2": "10×10 CAPSULES CLASSICO LUNGO",
            "price": 44.52,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6011,
            "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Vending": [
        {
            "id": 7000,
            "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
            "namePart2": "1KG",
            "price": 8.44,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 7001,
            "name": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE",
            "namePart2": "RÉGILAIT",
            "price": 7.5,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 7002,
            "name": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG", "nameEn": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG",
            "namePart2": "VENDING",
            "price": 8,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 7003,
            "name": "LAIT ÉCRÉMÉ EN POUDRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE",
            "namePart2": "PROLAIT",
            "price": 12,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Thé & Boissons": [
        {
            "id": 8000,
            "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
            "namePart2": "1KG",
            "price": 8.44,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8001,
            "name": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES", "nameEn": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES",
            "namePart2": "",
            "price": 3.8,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8002,
            "name": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES", "nameEn": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES",
            "namePart2": "",
            "price": 17.5,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8003,
            "name": "CAPPUCINO VANILLE", "nameEn": "CAPPUCINO VANILLE",
            "namePart2": "1KG",
            "price": 8.44,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8004,
            "name": "THÉ AU CITRON INSTANTANÉ RISTORA", "nameEn": "THÉ AU CITRON INSTANTANÉ RISTORA",
            "namePart2": "1KG",
            "price": 5.49,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8005,
            "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
            "namePart2": "10X1KG",
            "price": 93.05,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Accessoires": [
        {
            "id": 9000,
            "name": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50",
            "namePart2": "",
            "price": 1.5,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9001,
            "name": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500", "nameEn": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500",
            "namePart2": "",
            "price": 10.9,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9002,
            "name": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)", "nameEn": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)",
            "namePart2": "",
            "price": 6,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9003,
            "name": "SUCRE BÛCHETTE 4GR LAVAZZA X200", "nameEn": "SUCRE BÛCHETTE 4GR LAVAZZA X200",
            "namePart2": "",
            "price": 6.19,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9004,
            "name": "6.5 OZ (20CL) GOBELET CAFEMALIN X50", "nameEn": "6.5 OZ (20CL) GOBELET CAFEMALIN X50",
            "namePart2": "",
            "price": 1.92,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9005,
            "name": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50",
            "namePart2": "",
            "price": 2.04,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9006,
            "name": "SOUS", "nameEn": "SOUS",
            "namePart2": "LOT DE 12 POUR TASSES ESPRESSO 70 ML",
            "price": 30,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9007,
            "name": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST", "nameEn": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST",
            "namePart2": "",
            "price": 72,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9008,
            "name": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST", "nameEn": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST",
            "namePart2": "",
            "price": 162,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Friandises": [
        {
            "id": 10000,
            "name": "LAVAZZA AMANDE CACAOTÉE", "nameEn": "LAVAZZA AMANDE CACAOTÉE",
            "namePart2": "500 CHOCOLATS",
            "price": 39,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 10001,
            "name": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL", "nameEn": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL",
            "namePart2": "",
            "price": 25.98,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 10002,
            "name": "200 PETITES GALETTES PUR BEURRE", "nameEn": "200 PETITES GALETTES PUR BEURRE",
            "namePart2": "ST MICHEL",
            "price": 21.05,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Blog CaféMalin": []
};

export const allProducts: Product[] = [
    {
        "id": 2000,
        "name": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT", "nameEn": "COFFEE BEANS LAVAZZA CREMA & AROMA EXPERT",
        "namePart2": "1 KG",
        "price": 19.9,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2001,
        "name": "CAFÉ EN GRAINS DELTA CAFES GOLD 1KG", "nameEn": "COFFEE BEANS DELTA CAFES GOLD 1KG",
        "namePart2": "",
        "price": 25.5,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2002,
        "name": "CAFÉ EN GRAINS DELTA PLATINUM 1 KG", "nameEn": "COFFEE BEANS DELTA PLATINUM 1 KG",
        "namePart2": "",
        "price": 26.5,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2003,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 57.89,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2004,
        "name": "CAFÉ EN GRAIN COVIM", "nameEn": "COFFEE BEANS COVIM",
        "namePart2": "GRANBAR",
        "price": 15.5,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2005,
        "name": "20KG", "nameEn": "20KG",
        "namePart2": "CAFÉ EN GRAINS DELTA CAFES GOLD",
        "price": 0,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2006,
        "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
        "namePart2": "BIO COFFEE 1KG",
        "price": 18.8,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2007,
        "name": "6KG", "nameEn": "6KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 108.62,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2008,
        "name": "5KG", "nameEn": "5KG",
        "namePart2": "CAFÉ EN GRAINS DELTA CAFÉS GRAN CREMA",
        "price": 0,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2009,
        "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
        "namePart2": "COLOMBIA 500G",
        "price": 14.8,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2010,
        "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
        "namePart2": "BRAZIL 500G",
        "price": 13.75,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2011,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "GASTRONOMIQUE",
        "price": 4.9,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2012,
        "name": "PACK 6KG", "nameEn": "PACK 6KG",
        "namePart2": "CAFÉ EN GRAIN BRISTOT CLASSICO INTENSO E CREMOSO",
        "price": 101.85,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2013,
        "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
        "namePart2": "3×1 KG",
        "price": 62.57,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2014,
        "name": "20KG CAFÉ EN GRAINS CREMA ET AROMA", "nameEn": "20KG COFFEE BEANS CREMA ET AROMA",
        "namePart2": "LAVAZZA",
        "price": 480.87,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2015,
        "name": "KIMBO SUPERIOR BLEND", "nameEn": "KIMBO SUPERIOR BLEND",
        "namePart2": "CAFÉ EN GRAIN 1KG",
        "price": 16.3,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2016,
        "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 6X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 6X1KG",
        "namePart2": "",
        "price": 162.68,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2017,
        "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 12X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 12X1KG",
        "namePart2": "",
        "price": 318.65,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2018,
        "name": "CAFÉ EN GRAINS LAVAZZA CREMA CLASSICA 3KG", "nameEn": "COFFEE BEANS LAVAZZA CREMA CLASSICA 3KG",
        "namePart2": "",
        "price": 64,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3000,
        "name": "CAFÉ MOULU 250G GOLD", "nameEn": "GROUND COFFEE 250G GOLD",
        "namePart2": "DELTA",
        "price": 5.9,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3001,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "PRESTIGE",
        "price": 4.9,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3002,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "DÉGUSTATION",
        "price": 4.9,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3003,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "GASTRONOMIQUE",
        "price": 4.9,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4000,
        "name": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES",
        "namePart2": "",
        "price": 6.2,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4001,
        "name": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES",
        "namePart2": "",
        "price": 6.2,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4002,
        "name": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES", "nameEn": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES",
        "namePart2": "",
        "price": 28.7,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4003,
        "name": "DELTA Q QHARACTER N°9", "nameEn": "DELTA Q QHARACTER N°9",
        "namePart2": "10 CAPSULES",
        "price": 3.45,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4004,
        "name": "PACK CAPSULES LAVAZZA BLUE", "nameEn": "PACK CAPSULES LAVAZZA BLUE",
        "namePart2": "",
        "price": 5,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4005,
        "name": "LAVAZZA BLUE RICCO", "nameEn": "LAVAZZA BLUE RICCO",
        "namePart2": "X100 CAPSULES",
        "price": 32,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4006,
        "name": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®",
        "namePart2": "LAVAZZA",
        "price": 26.34,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4007,
        "name": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES",
        "namePart2": "",
        "price": 32.77,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4008,
        "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
        "namePart2": "",
        "price": 128.08,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4009,
        "name": "DELTA Q COLOMBIA", "nameEn": "DELTA Q COLOMBIA",
        "namePart2": "10 CAPSULES",
        "price": 4.4,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4010,
        "name": "DELTA Q VIETNAM", "nameEn": "DELTA Q VIETNAM",
        "namePart2": "10 CAPSULES",
        "price": 4.4,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4011,
        "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
        "namePart2": "40 CAPSULES",
        "price": 14.65,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4012,
        "name": "DELTA Q QHARISMA N°12", "nameEn": "DELTA Q QHARISMA N°12",
        "namePart2": "40 CAPSULES",
        "price": 11.3,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4013,
        "name": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES", "nameEn": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES",
        "namePart2": "",
        "price": 9.7,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4014,
        "name": "DELTA Q MENTHE CHOCOLAT", "nameEn": "DELTA Q MENTHE CHOCOLAT",
        "namePart2": "10 CAPSULES",
        "price": 3.65,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4015,
        "name": "DELTA Q", "nameEn": "DELTA Q",
        "namePart2": "PACK DÉCOUVERTE",
        "price": 8.08,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4016,
        "name": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES",
        "namePart2": "",
        "price": 14.78,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4017,
        "name": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES", "nameEn": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES",
        "namePart2": "",
        "price": 5,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4018,
        "name": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES", "nameEn": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES",
        "namePart2": "",
        "price": 5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4019,
        "name": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®",
        "namePart2": "LAVAZZA",
        "price": 27.63,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4020,
        "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
        "namePart2": "10 CAPSULES LUNGO",
        "price": 2.55,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4021,
        "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
        "namePart2": "PACK 10X10 CAPSULES",
        "price": 0,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4022,
        "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
        "namePart2": "",
        "price": 5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4023,
        "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE",
        "namePart2": "18 UNITÉS",
        "price": 8.79,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4024,
        "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA",
        "namePart2": "18 UNITÉS",
        "price": 8.79,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4025,
        "name": "KIMBO COMPATIBLE MODO MIO", "nameEn": "KIMBO COMPATIBLE MODO MIO",
        "namePart2": "CAPRI",
        "price": 16,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4026,
        "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO",
        "namePart2": "18 DOSETTES",
        "price": 8.05,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4027,
        "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA",
        "namePart2": "18 UNITÉS",
        "price": 8.79,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4028,
        "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES",
        "namePart2": "",
        "price": 5,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4029,
        "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ",
        "namePart2": "18 DOSETTES",
        "price": 8.05,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4030,
        "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4031,
        "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
        "namePart2": "10X10 CAPSULES LUNGO",
        "price": 0,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4032,
        "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4033,
        "name": "KIMBO COMPATIBLE NESPRESSO", "nameEn": "KIMBO COMPATIBLE NESPRESSO",
        "namePart2": "NAPOLI",
        "price": 0,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4034,
        "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE",
        "namePart2": "180 DOSETTES",
        "price": 0,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5000,
        "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
        "namePart2": "LAVAZZA BLUE LB900 COMPACT",
        "price": 199,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5001,
        "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
        "namePart2": "",
        "price": 128.08,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5002,
        "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
        "namePart2": "LAVAZZA BLUE LB1050 CLASSY MILK",
        "price": 239,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5003,
        "name": "MACHINE À CAFÉ LAVAZZA A MODO MIO", "nameEn": "MACHINE À CAFÉ LAVAZZA A MODO MIO",
        "namePart2": "JOLIE PLUS SILVER",
        "price": 119,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5004,
        "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5005,
        "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5006,
        "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
        "namePart2": "NOIR",
        "price": 199.5,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5007,
        "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
        "namePart2": "ROUGE",
        "price": 199.5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5008,
        "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
        "namePart2": "INOX",
        "price": 699,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5009,
        "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
        "namePart2": "ROUGE",
        "price": 699,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6000,
        "name": "6KG", "nameEn": "6KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 108.62,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6001,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 57.89,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6002,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAINS GOLD SELECTION",
        "price": 84.38,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6003,
        "name": "3KG LAVAZZA CREMA CLASSICA", "nameEn": "3KG LAVAZZA CREMA CLASSICA",
        "namePart2": "",
        "price": 64,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6004,
        "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
        "namePart2": "",
        "price": 5,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6005,
        "name": "PACK CAFÉ EN GRAIN ORIGINE", "nameEn": "PACK COFFEE BEANS ORIGINE",
        "namePart2": "DELTA CAFÉS",
        "price": 27.9,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6006,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAIN PRONTO CREMA LAVAZZA",
        "price": 57.89,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6007,
        "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
        "namePart2": "6×1 KG",
        "price": 122.55,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6008,
        "name": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6009,
        "name": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 32,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6010,
        "name": "ILLY COMPATIBLES NESPRESSO®", "nameEn": "ILLY COMPATIBLES NESPRESSO®",
        "namePart2": "10×10 CAPSULES CLASSICO LUNGO",
        "price": 44.52,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6011,
        "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7000,
        "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
        "namePart2": "1KG",
        "price": 8.44,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7001,
        "name": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE",
        "namePart2": "RÉGILAIT",
        "price": 7.5,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7002,
        "name": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG", "nameEn": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG",
        "namePart2": "VENDING",
        "price": 8,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7003,
        "name": "LAIT ÉCRÉMÉ EN POUDRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE",
        "namePart2": "PROLAIT",
        "price": 12,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8000,
        "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
        "namePart2": "1KG",
        "price": 8.44,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8001,
        "name": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES", "nameEn": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES",
        "namePart2": "",
        "price": 3.8,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8002,
        "name": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES", "nameEn": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES",
        "namePart2": "",
        "price": 17.5,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8003,
        "name": "CAPPUCINO VANILLE", "nameEn": "CAPPUCINO VANILLE",
        "namePart2": "1KG",
        "price": 8.44,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8004,
        "name": "THÉ AU CITRON INSTANTANÉ RISTORA", "nameEn": "THÉ AU CITRON INSTANTANÉ RISTORA",
        "namePart2": "1KG",
        "price": 5.49,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8005,
        "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
        "namePart2": "10X1KG",
        "price": 93.05,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9000,
        "name": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50",
        "namePart2": "",
        "price": 1.5,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9001,
        "name": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500", "nameEn": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500",
        "namePart2": "",
        "price": 10.9,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9002,
        "name": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)", "nameEn": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)",
        "namePart2": "",
        "price": 6,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9003,
        "name": "SUCRE BÛCHETTE 4GR LAVAZZA X200", "nameEn": "SUCRE BÛCHETTE 4GR LAVAZZA X200",
        "namePart2": "",
        "price": 6.19,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9004,
        "name": "6.5 OZ (20CL) GOBELET CAFEMALIN X50", "nameEn": "6.5 OZ (20CL) GOBELET CAFEMALIN X50",
        "namePart2": "",
        "price": 1.92,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9005,
        "name": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50",
        "namePart2": "",
        "price": 2.04,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9006,
        "name": "SOUS", "nameEn": "SOUS",
        "namePart2": "LOT DE 12 POUR TASSES ESPRESSO 70 ML",
        "price": 30,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9007,
        "name": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST", "nameEn": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST",
        "namePart2": "",
        "price": 72,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9008,
        "name": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST", "nameEn": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST",
        "namePart2": "",
        "price": 162,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 10000,
        "name": "LAVAZZA AMANDE CACAOTÉE", "nameEn": "LAVAZZA AMANDE CACAOTÉE",
        "namePart2": "500 CHOCOLATS",
        "price": 39,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 10001,
        "name": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL", "nameEn": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL",
        "namePart2": "",
        "price": 25.98,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 10002,
        "name": "200 PETITES GALETTES PUR BEURRE", "nameEn": "200 PETITES GALETTES PUR BEURRE",
        "namePart2": "ST MICHEL",
        "price": 21.05,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    }
];
