import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Brand, UnitType, DiscountRule, SectionTemplate } from '@/types/catalogue';

const NOW = new Date().toISOString();

// ── Seed Categories ───────────────────────────────────────────────────────────
const SEED_CATEGORIES: Category[] = [
    { id: 'cat-coffee-beans', name: 'Coffee Beans',  slug: 'coffee-beans',  icon: '☕', description: 'Whole bean and ground coffee blends.',                     createdAt: NOW },
    { id: 'cat-machines',     name: 'Machines',      slug: 'machines',      icon: '⚙️', description: 'Espresso machines, super-automatics, and grinders.',       createdAt: NOW },
    { id: 'cat-accessories',  name: 'Accessories',   slug: 'accessories',   icon: '🧰', description: 'Cups, filters, tampers, cleaning products.',                createdAt: NOW },
    { id: 'cat-sweets',       name: 'Sweets',        slug: 'sweets',        icon: '🍪', description: 'Biscuits, chocolates and confections for coffee pairing.',  createdAt: NOW },
    { id: 'cat-capsules',     name: 'Capsules',      slug: 'capsules',      icon: '💊', description: 'Compatible capsules for Nespresso and Dolce Gusto.',        createdAt: NOW },
    { id: 'cat-grinders',     name: 'Grinders',      slug: 'grinders',      icon: '🔄', description: 'Burr and blade grinders for fresh ground coffee.',         createdAt: NOW, parentId: 'cat-machines' },
    { id: 'cat-gifts',        name: 'Gift Sets',     slug: 'gift-sets',     icon: '🎁', description: 'Curated coffee gift boxes and bundles.',                    createdAt: NOW },
];

// ── Seed Brands ───────────────────────────────────────────────────────────────
const SEED_BRANDS: Brand[] = [
    { id: 'brand-lavazza',   name: 'Lavazza',    slug: 'lavazza',   description: 'Italian coffee roaster founded in 1895. Premium espresso heritage.',        createdAt: NOW },
    { id: 'brand-delonghi',  name: "De'Longhi",  slug: 'delonghi',  description: 'Italian small appliance manufacturer. Leader in espresso machines.',         createdAt: NOW },
    { id: 'brand-illy',      name: 'illy',       slug: 'illy',      description: 'Single-blend arabica specialist from Trieste, Italy.',                       createdAt: NOW },
    { id: 'brand-nespresso', name: 'Nespresso',  slug: 'nespresso', description: "Nestlé's premium capsule system. Known worldwide.",                          createdAt: NOW },
    { id: 'brand-cafemalin', name: 'Cafémalin',  slug: 'cafemalin', description: 'House brand for professional hospitality accessories.',                       createdAt: NOW },
    { id: 'brand-lotus',     name: 'Lotus',      slug: 'lotus',     description: 'Belgian biscuit brand. Makers of the iconic Speculoos.',                     createdAt: NOW },
];

// ── Seed Unit Types ───────────────────────────────────────────────────────────
const SEED_UNIT_TYPES: UnitType[] = [
    { id: 'unit-kg',    label: 'Kilogram',   abbreviation: 'kg',   unitCategory: 'weight' },
    { id: 'unit-g',     label: 'Gram',       abbreviation: 'g',    unitCategory: 'weight' },
    { id: 'unit-ml',    label: 'Milliliter', abbreviation: 'ml',   unitCategory: 'volume' },
    { id: 'unit-l',     label: 'Litre',      abbreviation: 'L',    unitCategory: 'volume' },
    { id: 'unit-piece', label: 'Piece',      abbreviation: 'pc',   unitCategory: 'count'  },
    { id: 'unit-pair',  label: 'Pair',       abbreviation: 'pair', unitCategory: 'set'    },
    { id: 'unit-pack',  label: 'Pack',       abbreviation: 'pack', unitCategory: 'set'    },
    { id: 'unit-set',   label: 'Set',        abbreviation: 'set',  unitCategory: 'set'    },
    { id: 'unit-box',   label: 'Box',        abbreviation: 'box',  unitCategory: 'set'    },
    { id: 'unit-cup',   label: 'Cup',        abbreviation: 'cup',  unitCategory: 'count'  },
];

// ── Seed Discount Rules ───────────────────────────────────────────────────────
const SEED_DISCOUNT_RULES: DiscountRule[] = [
    {
        id: 'disc-sitewide-10',
        label: 'Sitewide 10% — Always On',
        scope: 'sitewide', type: 'percentage', value: 10,
        targetIds: [], active: true,
        createdAt: NOW,
    },
    {
        id: 'disc-machines-15',
        label: 'Machines Launch Promo',
        scope: 'category', type: 'percentage', value: 15,
        targetIds: ['cat-machines'], active: false,
        startDate: '2026-04-01T00:00:00.000Z',
        endDate:   '2026-04-30T23:59:59.000Z',
        createdAt: NOW,
    },
    {
        id: 'disc-lavazza-5',
        label: 'Lavazza Brand Loyalty (-€5)',
        scope: 'brand', type: 'fixed', value: 5,
        targetIds: ['brand-lavazza'], active: true,
        createdAt: NOW,
    },
    {
        id: 'disc-speculoos-bundle',
        label: 'Speculoos Bulk Deal',
        scope: 'product', type: 'percentage', value: 12,
        targetIds: ['dp-003'], active: true,
        createdAt: NOW,
    },
    {
        id: 'disc-accessories-flash',
        label: 'Accessories Flash Sale',
        scope: 'category', type: 'percentage', value: 20,
        targetIds: ['cat-accessories'], active: false,
        createdAt: NOW,
    },
];

// ── Seed Section Templates ────────────────────────────────────────────────────
const SEED_SECTION_TEMPLATES: SectionTemplate[] = [
    {
        id: 'tpl-coffee-profile',
        name: 'Coffee Profile',
        icon: '☕',
        description: 'Intensity bar + aromatic notes + taste profile. Use for any coffee product.',
        sections: [
            { type: 'intensity',      value: 8, max: 13 },
            { type: 'aromatic_notes', notes: [] },
            { type: 'taste_profile',  bitterness: 3, acidity: 2, roastiness: 3, body: 4, sweetness: 2 },
        ],
        createdAt: NOW,
    },
    {
        id: 'tpl-machine-specs',
        name: 'Machine Specs + Warranty',
        icon: '⚙️',
        description: 'Available drinks list + technical specs table + warranty custom section.',
        sections: [
            { type: 'feature_list', title: 'Available Drinks', items: [] },
            { type: 'specs_table',  title: 'Technical Specs', rows: [] },
            { type: 'custom', title: 'Warranty & Support', icon: '🛡️', fields: [
                { id: 'w1', label: 'Warranty',              fieldType: 'text',    value: '' },
                { id: 'w2', label: 'Support',               fieldType: 'text',    value: '' },
                { id: 'w3', label: 'Spare Parts Available', fieldType: 'boolean', value: false },
            ]},
        ],
        createdAt: NOW,
    },
    {
        id: 'tpl-food-full',
        name: 'Food — Full Profile',
        icon: '🍪',
        description: 'Ingredients + allergens + pairing suggestions. Use for biscuits, sweets, etc.',
        sections: [
            { type: 'ingredients', title: 'Ingredients', items: [] },
            { type: 'allergens',   items: [] },
            { type: 'pairing',     title: 'Perfect With', items: [] },
        ],
        createdAt: NOW,
    },
    {
        id: 'tpl-accessory-basic',
        name: 'Accessory Basics',
        icon: '🧰',
        description: 'Key features bullet list + inline specs table.',
        sections: [
            { type: 'feature_list', title: 'Key Features',   items: [] },
            { type: 'specs_table',  title: 'Specifications', rows: [] },
        ],
        createdAt: NOW,
    },
    {
        id: 'tpl-gift-set',
        name: 'Gift Set Contents',
        icon: '🎁',
        description: "What's inside + rich text story + pairing / perfect for list.",
        sections: [
            { type: 'feature_list', title: "What's Inside", items: [] },
            { type: 'rich_text',    content: '' },
            { type: 'pairing',      title: 'Perfect For', items: [] },
        ],
        createdAt: NOW,
    },
];

// ── Store interface ───────────────────────────────────────────────────────────
interface CatalogueStore {
    categories:       Category[];
    brands:           Brand[];
    unitTypes:        UnitType[];
    discountRules:    DiscountRule[];
    sectionTemplates: SectionTemplate[];

    // Categories
    addCategory:    (c: Category) => void;
    updateCategory: (id: string, u: Partial<Omit<Category, 'id' | 'createdAt'>>) => void;
    deleteCategory: (id: string) => void;
    getCategoryById:   (id: string) => Category | undefined;

    // Brands
    addBrand:    (b: Brand) => void;
    updateBrand: (id: string, u: Partial<Omit<Brand, 'id' | 'createdAt'>>) => void;
    deleteBrand: (id: string) => void;
    getBrandById: (id: string) => Brand | undefined;

    // Unit Types
    addUnitType:    (u: UnitType) => void;
    deleteUnitType: (id: string) => void;
    getUnitTypeById: (id: string) => UnitType | undefined;

    // Discount Rules
    addDiscountRule:    (r: DiscountRule) => void;
    updateDiscountRule: (id: string, u: Partial<Omit<DiscountRule, 'id' | 'createdAt'>>) => void;
    deleteDiscountRule: (id: string) => void;
    toggleDiscountRule: (id: string) => void;
    getActiveRulesForProduct: (productId: string, categoryId?: string, brandId?: string) => DiscountRule[];

    // Section Templates
    addSectionTemplate:    (t: SectionTemplate) => void;
    updateSectionTemplate: (id: string, u: Partial<Omit<SectionTemplate, 'id' | 'createdAt'>>) => void;
    deleteSectionTemplate: (id: string) => void;
    getSectionTemplateById: (id: string) => SectionTemplate | undefined;
}

// ── Helper: user-created records (id not in seed list) ───────────────────────
const userOnly = <T extends { id: string }>(arr: T[] | undefined, seeds: T[]): T[] =>
    (arr ?? []).filter(item => !seeds.find(s => s.id === item.id));

// ── Store ─────────────────────────────────────────────────────────────────────
export const useCatalogueStore = create<CatalogueStore>()(
    persist(
        (set, get) => ({
            categories:       SEED_CATEGORIES,
            brands:           SEED_BRANDS,
            unitTypes:        SEED_UNIT_TYPES,
            discountRules:    SEED_DISCOUNT_RULES,
            sectionTemplates: SEED_SECTION_TEMPLATES,

            // ── Categories ──
            addCategory: (c) => set(s => ({ categories: [c, ...s.categories] })),
            updateCategory: (id, u) => set(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...u } : c) })),
            deleteCategory: (id) => set(s => ({ categories: s.categories.filter(c => c.id !== id) })),
            getCategoryById: (id) => get().categories.find(c => c.id === id),

            // ── Brands ──
            addBrand: (b) => set(s => ({ brands: [b, ...s.brands] })),
            updateBrand: (id, u) => set(s => ({ brands: s.brands.map(b => b.id === id ? { ...b, ...u } : b) })),
            deleteBrand: (id) => set(s => ({ brands: s.brands.filter(b => b.id !== id) })),
            getBrandById: (id) => get().brands.find(b => b.id === id),

            // ── Unit Types ──
            addUnitType: (u) => set(s => ({ unitTypes: [...s.unitTypes, u] })),
            deleteUnitType: (id) => set(s => ({ unitTypes: s.unitTypes.filter(u => u.id !== id) })),
            getUnitTypeById: (id) => get().unitTypes.find(u => u.id === id),

            // ── Discount Rules ──
            addDiscountRule: (r) => set(s => ({ discountRules: [r, ...s.discountRules] })),
            updateDiscountRule: (id, u) => set(s => ({ discountRules: s.discountRules.map(r => r.id === id ? { ...r, ...u } : r) })),
            deleteDiscountRule: (id) => set(s => ({ discountRules: s.discountRules.filter(r => r.id !== id) })),
            toggleDiscountRule: (id) => set(s => ({ discountRules: s.discountRules.map(r => r.id === id ? { ...r, active: !r.active } : r) })),
            getActiveRulesForProduct: (productId, categoryId, brandId) => {
                const now = new Date().toISOString();
                return get().discountRules
                    .filter(r => {
                        if (!r.active) return false;
                        if (r.startDate && now < r.startDate) return false;
                        if (r.endDate   && now > r.endDate)   return false;
                        if (r.scope === 'sitewide') return true;
                        if (r.scope === 'category' && categoryId) return r.targetIds.includes(categoryId);
                        if (r.scope === 'brand'    && brandId)    return r.targetIds.includes(brandId);
                        if (r.scope === 'product') return r.targetIds.includes(productId);
                        return false;
                    })
                    .sort((a, b) => {
                        const order = { sitewide: 0, category: 1, brand: 2, product: 3 };
                        return order[a.scope] - order[b.scope];
                    });
            },

            // ── Section Templates ──
            addSectionTemplate: (t) => set(s => ({ sectionTemplates: [t, ...s.sectionTemplates] })),
            updateSectionTemplate: (id, u) => set(s => ({ sectionTemplates: s.sectionTemplates.map(t => t.id === id ? { ...t, ...u } : t) })),
            deleteSectionTemplate: (id) => set(s => ({ sectionTemplates: s.sectionTemplates.filter(t => t.id !== id) })),
            getSectionTemplateById: (id) => get().sectionTemplates.find(t => t.id === id),
        }),
        {
            name: 'cafrezzo-catalogue-v1',
            merge: (persisted: unknown, current) => {
                const p = persisted as Partial<CatalogueStore> | null;
                if (!p) return current;
                return {
                    ...current,
                    categories:       [...userOnly(p.categories, SEED_CATEGORIES),             ...SEED_CATEGORIES],
                    brands:           [...userOnly(p.brands, SEED_BRANDS),                     ...SEED_BRANDS],
                    unitTypes:        SEED_UNIT_TYPES,
                    discountRules:    p.discountRules?.length ? p.discountRules               : SEED_DISCOUNT_RULES,
                    sectionTemplates: [...userOnly(p.sectionTemplates, SEED_SECTION_TEMPLATES), ...SEED_SECTION_TEMPLATES],
                };
            },
        }
    )
);
