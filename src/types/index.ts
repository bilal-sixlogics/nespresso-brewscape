// ── Review ───────────────────────────────────────────────────────────────────
export interface ReviewItem {
    id: number;
    user_name: string;
    rating: number; // 1-5
    title?: string;
    comment?: string;
    date: string;
    verified?: boolean;
}

// ── Sale Unit (matches backend ProductSalesUnitResource) ─────────────────────
export interface SaleUnit {
    id: number;
    name: string;           // e.g. "250g", "Pack of 50", "1 KG"
    unit_type: string;      // e.g. "pack", "pc"
    quantity: number;
    selling_price: number;
    pricing_method: 'direct' | 'percentage_off' | 'fixed_off';
    discount_value?: number;
    sku: string;
    stock: number;
    is_default: boolean;
    status: 'active' | 'inactive';
}

// ── Taste Profile (extracted from sections JSON) ─────────────────────────────
export interface TasteProfile {
    bitterness?: number;   // 1-5
    acidity?: number;      // 1-5
    roastiness?: number;   // 1-5
    body?: number;         // 1-5
    sweetness?: number;    // 1-5
}

// ── Product Feature (extracted from sections JSON) ───────────────────────────
export interface ProductFeature {
    title: string;
    titleEn?: string;
    items: string[];
    itemsEn?: string[];
}

// ── Brand / Category (as returned by backend) ────────────────────────────────
export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    status: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    icon_url?: string;
    description?: string;
    parent_id?: number;
    status: string;
    sort_order: number;
    storefront_page?: string;
}

// ── Product Image ────────────────────────────────────────────────────────────
export interface ProductImage {
    id: number;
    path: string;
    url: string;
    sort_order: number;
    is_primary: boolean;
}

// ── Tag ──────────────────────────────────────────────────────────────────────
export interface ProductTag {
    id: number;
    label: string;
    color: string;
}

// ── Section types (raw JSON from backend sections column) ────────────────────
export interface ProductSection {
    type: string;
    [key: string]: unknown;
}

// ── Product (matches backend ProductResource) ────────────────────────────────
export interface Product {
    id: number;
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    brand_id: number;
    category_id: number;
    unit_type_id?: number;
    brand?: Brand;
    category?: Category;
    selling_price: number;
    cost_price?: number;
    status: 'active' | 'inactive' | 'draft';
    weight?: number;
    featured_image?: string;
    sections?: ProductSection[];
    specs_tab?: { label: string; value: string }[];
    intensity?: number;
    stock_qty: number;
    reserved_stock: number;
    low_stock_threshold: number;
    sort_order: number;
    is_featured: boolean;
    featured_sort?: number;
    meta_title?: string;
    meta_description?: string;
    images?: ProductImage[];
    sales_units?: SaleUnit[];
    tags?: ProductTag[];
    reviews?: ReviewItem[];
    reviews_count?: number;
    average_rating?: number;
    created_at: string;
    updated_at: string;
}

// ── Helper: extract typed data from product sections ─────────────────────────

/** Extract taste profile from sections JSON */
export function extractTasteProfile(sections?: ProductSection[]): TasteProfile | null {
    const section = sections?.find(s => s.type === 'taste_profile');
    if (!section?.values) return null;
    const out: TasteProfile = {};
    for (const v of section.values as { parameterId: string; value: number }[]) {
        (out as Record<string, number>)[v.parameterId] = v.value;
    }
    return out;
}

/** Extract aromatic notes from sections JSON */
export function extractNotes(sections?: ProductSection[]): string[] | null {
    const section = sections?.find(s => s.type === 'aromatic_notes');
    return (section?.notes as string[]) ?? null;
}

/** Extract intensity from sections JSON */
export function extractIntensity(sections?: ProductSection[]): { value: number; max: number } | null {
    const section = sections?.find(s => s.type === 'intensity');
    if (!section) return null;
    return { value: section.value as number, max: (section.max as number) || 13 };
}

/** Extract features (feature_list, pairing, ingredients, etc.) from sections */
export function extractFeatures(sections?: ProductSection[]): ProductFeature[] {
    if (!sections) return [];
    const features: ProductFeature[] = [];
    for (const s of sections) {
        if (s.type === 'feature_list') {
            features.push({ title: (s.title as string) || 'Features', items: (s.items as string[]) || [] });
        } else if (s.type === 'pairing') {
            features.push({
                title: (s.title as string) || 'Perfect With',
                items: ((s.items as { emoji?: string; label: string }[]) || []).map(p => `${p.emoji || ''} ${p.label}`.trim()),
            });
        } else if (s.type === 'ingredients') {
            features.push({ title: (s.title as string) || 'Ingredients', items: (s.items as string[]) || [] });
        } else if (s.type === 'allergens') {
            features.push({ title: 'Allergens', items: (s.items as string[]) || [] });
        }
    }
    return features;
}

/** Extract a specific field from specs_table section */
export function extractSpecField(sections: ProductSection[] | undefined, label: string): string | null {
    const section = sections?.find(s => s.type === 'specs_table');
    if (!section?.rows) return null;
    for (const row of section.rows as { label: string; value: string }[]) {
        if (row.label.toLowerCase().includes(label.toLowerCase())) return row.value;
    }
    return null;
}

/** Get primary image URL from product */
export function getProductImage(product: Product): string | null {
    if (product.featured_image) return product.featured_image;
    const primary = product.images?.find(i => i.is_primary);
    if (primary) return primary.url;
    return product.images?.[0]?.url ?? null;
}

/** Get all gallery image URLs from product */
export function getProductImages(product: Product): string[] {
    return product.images?.map(i => i.url).filter(Boolean) ?? [];
}

/** Check if product is in stock */
export function isInStock(product: Product): boolean {
    return (Number(product.stock_qty) - Number(product.reserved_stock)) > 0;
}

/** Check if product is new (created within last 30 days) */
export function isNewProduct(product: Product): boolean {
    if (!product.created_at) return false;
    const created = new Date(product.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
}

/** Get the default sale unit */
export function getDefaultUnit(product: Product): SaleUnit | undefined {
    return product.sales_units?.find(u => u.is_default) ?? product.sales_units?.[0];
}

/** Get display price (from default sale unit, fallback to product selling_price) */
export function getDisplayPrice(product: Product): number {
    const unit = getDefaultUnit(product);
    const raw = unit ? unit.selling_price : product.selling_price;
    return Number(raw) || 0;
}

/** Get tag labels as string array */
export function getTagLabels(product: Product): string[] {
    return product.tags?.map(t => t.label) ?? [];
}

/** Check if product has a specific tag */
export function hasTag(product: Product, label: string): boolean {
    return product.tags?.some(t => t.label === label) ?? false;
}

// ── User & Order Management Types ────────────────────────────────────────────
export interface Address {
    id: string;
    label: string; // e.g. "Home", "Work"
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone?: string;
    isDefault?: boolean;
}

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    saleUnit?: SaleUnit;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    date: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    status: OrderStatus;
    trackingNumber?: string;
    paymentMethod?: string;
    shippingAddress?: Address;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    emailVerified?: boolean;
    orders: Order[];
    addresses?: Address[];
}
