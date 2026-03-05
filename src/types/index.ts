export interface ReviewItem {
    id: string;
    user: string;
    avatar?: string;
    rating: number; // 1-5
    title?: string;
    comment: string;
    date: string;
    verified?: boolean;
}

export interface SaleUnit {
    id: string;
    label: string; // e.g. "Single", "Lot de 50", "Carton de 500"
    labelEn?: string;
    price: number;
    originalPrice?: number; // for showing strikethrough
    quantity: number; // actual unit count in this pack
}

export interface TasteProfile {
    bitterness?: number;   // 1-5
    acidity?: number;      // 1-5
    roastiness?: number;   // 1-5
    body?: number;         // 1-5
    sweetness?: number;    // 1-5
}

export interface ProductFeature {
    title: string;
    titleEn?: string;
    items: string[];
    itemsEn?: string[];
}

export interface Product {
    id: string | number;
    slug?: string;
    category?: string;
    brand?: string;

    // --- Names (Bilingual) ---
    name: string;
    nameEn?: string;
    namePart2?: string;
    namePart2En?: string;

    // --- Pricing ---
    price: number;
    originalPrice?: number; // If set, shows a strikethrough price and a discount badge
    saleUnits?: SaleUnit[]; // Multi-pack support (Pack of 50, etc.)

    // --- Images ---
    image: string; // Primary image (shown on cards)
    images?: string[]; // Gallery images (shown on PDP)

    // --- Coffee Profile ---
    intensity?: number; // Hidden if 0 or undefined
    tasteProfile?: TasteProfile; // Hidden if undefined
    notes?: string[]; // Aromatic notes (e.g. Chocolate, Caramel)
    brewSizes?: string[];

    // --- Content (Bilingual) ---
    tagline?: string; // Short punch line shown in side panel
    taglineEn?: string;
    desc?: string; // Full paragraph description
    descEn?: string;
    features?: ProductFeature[]; // Accordion sections (Characteristics, Why choose us, etc.)

    // --- Reviews ---
    reviews?: ReviewItem[];
    averageRating?: number; // Computed or provided by backend

    // --- Metadata ---
    isFeatured?: boolean;
    isNew?: boolean;
    inStock?: boolean; // If false, shown as out of stock
    tags?: string[]; // e.g. ["eco", "vegan", "best-seller"]

    // --- Physical / Production Info ---
    origin?: string;         // e.g. "Éthiopie, Colombie"
    roastLevel?: string;     // e.g. "Légèrement torréfié"
    processingMethod?: string; // e.g. "Lavé", "Nature"
    weight?: string;         // e.g. "250g", "1kg"
    allergens?: string[];    // e.g. ["Lait", "Gluten"]
}

// --- User & Order Management Types ---
export interface Address {
    id: string;
    label: string; // e.g. "Home", "Work"
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
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
    paymentMethod?: string; // e.g. 'cod', 'stripe', 'card', 'wise' — never stores card details
    shippingAddress?: Address;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    orders: Order[];
    addresses?: Address[];
}

