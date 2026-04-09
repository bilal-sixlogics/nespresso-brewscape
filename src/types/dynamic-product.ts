// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC PRODUCT SYSTEM — Section-based, fully admin-driven
//
// A product carries its own sections[].
// Pre-built section types render with purpose-built UI.
// Custom sections are defined by the admin at runtime — no developer needed.
// ─────────────────────────────────────────────────────────────────────────────

// ── Pre-built section types ───────────────────────────────────────────────────

export interface IntensitySection {
    type: 'intensity';
    value: number;   // 1–13
    max?: number;
}

export interface TasteProfileSection {
    type: 'taste_profile';
    bitterness?: number;   // 1–5
    acidity?: number;
    roastiness?: number;
    body?: number;
    sweetness?: number;
}

export interface AromaticNotesSection {
    type: 'aromatic_notes';
    notes: string[];
}

export interface FeatureListSection {
    type: 'feature_list';
    title: string;
    items: string[];
}

export interface SpecsTableSection {
    type: 'specs_table';
    title: string;
    rows: { label: string; value: string }[];
}

export interface IngredientsSection {
    type: 'ingredients';
    title: string;
    items: string[];
}

export interface AllergensSection {
    type: 'allergens';
    items: string[];
}

export interface PairingSection {
    type: 'pairing';
    title: string;
    items: { emoji: string; label: string }[];
}

export interface RichTextSection {
    type: 'rich_text';
    title?: string;
    content: string;  // HTML string from rich text editor
}

// ── Custom section — admin defines their own field structure ─────────────────
export interface CustomSectionField {
    id: string;
    label: string;
    fieldType: 'text' | 'number' | 'list' | 'boolean';
    value: string | number | string[] | boolean;
}

export interface CustomSection {
    type: 'custom';
    title: string;
    icon?: string;       // emoji the admin picks
    fields: CustomSectionField[];
}

// ── Union of all section types ────────────────────────────────────────────────
export type ProductSection =
    | IntensitySection
    | TasteProfileSection
    | AromaticNotesSection
    | FeatureListSection
    | SpecsTableSection
    | IngredientsSection
    | AllergensSection
    | PairingSection
    | RichTextSection
    | CustomSection;

// ── Specs tab — separate from sections, shown as its own tab on detail page ──
export interface SpecTab {
    label: string;
    value: string;
}

// ── Sale unit ─────────────────────────────────────────────────────────────────
export interface DynamicSaleUnit {
    id: string;
    label: string;
    price: number;
    originalPrice?: number;
    quantity: number;
}

// ── The Product ───────────────────────────────────────────────────────────────
export interface DynamicProduct {
    id: string;
    slug: string;
    name: string;
    tagline?: string;
    category: string;       // display name — kept for backwards compat
    categoryId?: string;    // ref to Category.id
    brandId?: string;       // ref to Brand.id
    unitTypeId?: string;    // ref to UnitType.id — the base unit
    price: number;
    originalPrice?: number;
    discountPercent?: number; // admin-set explicit discount %
    image: string;
    images?: string[];
    inStock: boolean;
    isNew?: boolean;
    tags?: string[];          // references tag ids from tag store

    saleUnits?: DynamicSaleUnit[];

    // Inventory
    stockQty?: number;         // total units in stock
    lowStockThreshold?: number; // warn when stockQty <= this (default 10)
    sku?: string;

    // Optional rich text description (shown above sections)
    description?: string;   // markdown or HTML

    // Optional specs tab — if empty, tab is hidden
    specsTab?: SpecTab[];

    // The main body — product carries its own layout
    sections: ProductSection[];

    createdAt: string;
    updatedAt?: string;
}

// ── Admin tag ─────────────────────────────────────────────────────────────────
export interface AdminTag {
    id: string;
    label: string;
    color?: string;  // tailwind bg class e.g. 'bg-amber-400'
}
