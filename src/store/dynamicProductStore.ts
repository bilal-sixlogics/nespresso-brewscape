import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DynamicProduct, AdminTag } from '@/types/dynamic-product';

// ── Seed products ─────────────────────────────────────────────────────────────
const SEED_PRODUCTS: DynamicProduct[] = [
    {
        id: 'dp-001',
        slug: 'lavazza-crema-aroma',
        name: 'LAVAZZA CREMA & AROMA',
        tagline: 'The bold espresso blend for professionals.',
        category: 'Coffee Beans',
        price: 19.90,
        originalPrice: 23.90,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
        ],
        inStock: true,
        tags: ['best-seller'],
        description: '<p>An exceptional blend combining <strong>high-quality Robusta</strong> and carefully selected Arabica. Dark roasted for a bold espresso with thick, lingering crema.</p>',
        specsTab: [
            { label: 'Intensity', value: '11 / 13' },
            { label: 'Roast', value: 'Dark' },
            { label: 'Origin', value: 'Brazil & Uganda' },
            { label: 'Process', value: 'Washed & Natural' },
            { label: 'Grind', value: 'Whole Bean' },
        ],
        saleUnits: [
            { id: 'su-1kg', label: '1 KG', price: 19.90, originalPrice: 23.90, quantity: 1 },
            { id: 'su-3kg', label: '3 KG', price: 57.89, quantity: 3 },
        ],
        sections: [
            { type: 'intensity', value: 11, max: 13 },
            { type: 'aromatic_notes', notes: ['Caramel', 'Dark Chocolate', 'Walnut'] },
            { type: 'taste_profile', bitterness: 4, acidity: 2, roastiness: 4, body: 5, sweetness: 2 },
            { type: 'feature_list', title: 'Key Features', items: ['Intensity 11/13', 'Arabica-Robusta Blend', 'Dark Roast', 'Origin: Brazil & Uganda'] },
            { type: 'feature_list', title: 'Brewing Tips', items: ['Water: 90–96°C', 'Ratio 1:2', 'Extraction: 25–30s', 'Grind: Fine-Medium'] },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'dp-002',
        slug: 'delonghi-magnifica-evo',
        name: 'DELONGHI MAGNIFICA EVO',
        tagline: 'From bean to cup, at a touch.',
        category: 'Machines',
        price: 549.00,
        originalPrice: 649.00,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['best-seller'],
        description: '<p>The <strong>DeLonghi Magnifica Evo</strong> is the super-automatic machine par excellence. Its integrated conical burr grinder grinds fresh beans on demand for an always-fresh espresso.</p>',
        specsTab: [
            { label: 'Type', value: 'Super-Automatic' },
            { label: 'Pump Pressure', value: '15 bar' },
            { label: 'Heating', value: 'Thermoblock' },
            { label: 'Water Tank', value: '1.8 L' },
            { label: 'Bean Hopper', value: '250 g' },
            { label: 'Power', value: '1450 W' },
            { label: 'Dimensions', value: 'W21 × H35 × D43 cm' },
        ],
        sections: [
            { type: 'feature_list', title: 'Available Drinks', items: ['Espresso', 'Long Espresso', 'Cappuccino', 'Latte Macchiato', 'Americano'] },
            { type: 'custom', title: 'Warranty & Support', icon: '🛡️', fields: [
                { id: 'f1', label: 'Warranty', fieldType: 'text', value: '2 Years' },
                { id: 'f2', label: 'Support', fieldType: 'text', value: '24/7 Online + Phone' },
                { id: 'f3', label: 'Spare Parts Available', fieldType: 'boolean', value: true },
            ]},
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'dp-003',
        slug: 'speculoos-biscuits',
        name: 'SPECULOOS BISCUITS',
        tagline: 'The sweet treat that elevates every coffee break.',
        category: 'Sweets',
        price: 18.50,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['eco-friendly'],
        saleUnits: [
            { id: 'lot100', label: 'Pack of 100', price: 10.50, quantity: 100 },
            { id: 'lot200', label: 'Pack of 200', price: 18.50, quantity: 200 },
        ],
        sections: [
            { type: 'pairing', title: 'Perfect With', items: [{ emoji: '☕', label: 'Espresso' }, { emoji: '🍵', label: 'Tea' }, { emoji: '🥛', label: 'Cappuccino' }] },
            { type: 'ingredients', title: 'Ingredients', items: ['Flour', 'Sugar', 'Butter', 'Cinnamon', 'Baking Soda'] },
            { type: 'allergens', items: ['Gluten', 'Milk', 'Eggs'] },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'dp-004',
        slug: 'cafemalin-cups-4oz',
        name: 'CAFÉMALIN CUPS 4 OZ',
        tagline: 'Professional cups for every coffee break.',
        category: 'Accessories',
        price: 4.90,
        originalPrice: 5.90,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['eco-friendly'],
        saleUnits: [
            { id: 'lot50', label: 'Pack of 50', price: 4.90, originalPrice: 5.90, quantity: 50 },
            { id: 'lot250', label: 'Pack of 250', price: 21.00, quantity: 250 },
            { id: 'lot500', label: 'Carton of 500', price: 38.00, quantity: 500 },
        ],
        specsTab: [
            { label: 'Capacity', value: '12 cl (4 oz)' },
            { label: 'Material', value: 'FSC Cardboard' },
            { label: 'Lining', value: 'Leak-proof PE' },
            { label: 'Min. Order', value: '50 units' },
        ],
        sections: [
            { type: 'feature_list', title: 'Sustainability', items: ['FSC certified board', 'Recyclable after use', 'Fair-trade sourced'] },
        ],
        createdAt: new Date().toISOString(),
    },
];

const SEED_TAGS: AdminTag[] = [
    { id: 'tag-best-seller', label: 'best-seller', color: 'bg-amber-400' },
    { id: 'tag-new', label: 'new', color: 'bg-sb-black' },
    { id: 'tag-eco-friendly', label: 'eco-friendly', color: 'bg-emerald-500' },
    { id: 'tag-sale', label: 'sale', color: 'bg-red-500' },
    { id: 'tag-featured', label: 'featured', color: 'bg-sb-green' },
];

// ── Store ─────────────────────────────────────────────────────────────────────
interface DynamicProductStore {
    products: DynamicProduct[];
    tags: AdminTag[];

    // Products
    addProduct: (product: DynamicProduct) => void;
    updateProduct: (id: string, updates: Partial<DynamicProduct>) => void;
    deleteProduct: (id: string) => void;
    getById: (id: string) => DynamicProduct | undefined;
    getBySlug: (slug: string) => DynamicProduct | undefined;

    // Tags
    addTag: (tag: AdminTag) => void;
    deleteTag: (id: string) => void;
}

export const useDynamicProductStore = create<DynamicProductStore>()(
    persist(
        (set, get) => ({
            products: SEED_PRODUCTS,
            tags: SEED_TAGS,

            addProduct: (product) =>
                set((s) => ({ products: [product, ...s.products] })),

            updateProduct: (id, updates) =>
                set((s) => ({
                    products: s.products.map((p) =>
                        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                    ),
                })),

            deleteProduct: (id) =>
                set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

            getById: (id) => get().products.find((p) => p.id === id),
            getBySlug: (slug) => get().products.find((p) => p.slug === slug),

            addTag: (tag) =>
                set((s) => ({ tags: [...s.tags, tag] })),

            deleteTag: (id) =>
                set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),
        }),
        {
            name: 'dynamic-products-v2',
            merge: (persisted: unknown, current) => {
                const p = persisted as Partial<DynamicProductStore> | null;
                if (!p?.products?.length) return current;
                const userProducts = p.products.filter(
                    (up) => !SEED_PRODUCTS.find((s) => s.id === up.id)
                );
                const userTags = (p.tags ?? []).filter(
                    (ut) => !SEED_TAGS.find((s) => s.id === ut.id)
                );
                return {
                    ...current,
                    products: [...userProducts, ...SEED_PRODUCTS],
                    tags: [...userTags, ...SEED_TAGS],
                };
            },
        }
    )
);
