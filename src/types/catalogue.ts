// ─────────────────────────────────────────────────────────────────────────────
// CATALOGUE TYPES — Categories, Brands, Units, Discounts, Section Templates
// ─────────────────────────────────────────────────────────────────────────────

import { ProductSection } from './dynamic-product';

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;           // emoji
    description?: string;
    parentId?: string;      // undefined = top-level
    createdAt: string;
}

// ── Brand ─────────────────────────────────────────────────────────────────────
export interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    description?: string;
    createdAt: string;
}

// ── Unit Type ─────────────────────────────────────────────────────────────────
export type UnitCategory = 'weight' | 'volume' | 'count' | 'set';

export interface UnitType {
    id: string;
    label: string;          // e.g. "Kilogram"
    abbreviation: string;   // e.g. "kg"
    unitCategory: UnitCategory;
}

// ── Discount Rule ─────────────────────────────────────────────────────────────
export type DiscountScope = 'sitewide' | 'category' | 'brand' | 'product';
export type DiscountType  = 'percentage' | 'fixed';

export interface DiscountRule {
    id: string;
    label: string;
    scope: DiscountScope;
    type: DiscountType;
    value: number;          // % or fixed € amount
    targetIds: string[];    // category/brand/product ids; empty for sitewide
    active: boolean;
    startDate?: string;     // ISO
    endDate?: string;       // ISO
    createdAt: string;
}

// ── Section Template ──────────────────────────────────────────────────────────
export interface SectionTemplate {
    id: string;
    name: string;
    icon: string;
    description?: string;
    sections: ProductSection[];
    createdAt: string;
}
