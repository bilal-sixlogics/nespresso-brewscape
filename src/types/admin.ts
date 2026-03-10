// ─── Shared admin types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'inventory_staff';
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  image_path?: string;
  product_type: 'coffee' | 'machine' | 'accessory' | 'sweet' | 'all';
  sort_order: number;
  is_active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_path?: string;
  website?: string;
  is_active: boolean;
}

export interface Tag {
  id: number;
  name: string;
  name_en?: string;
  slug: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  path: string;
  is_primary: boolean;
  sort_order: number;
}

export interface SaleUnit {
  id: number;
  sku_code: string;
  label: string;
  label_en?: string;
  quantity: number;
  price: number;
  original_price?: number;
  is_default: boolean;
  stock_qty?: number;
}

export interface Product {
  id: number;
  slug: string;
  sku?: string;
  product_type: 'coffee' | 'machine' | 'accessory' | 'sweet';
  name: string;
  name_en?: string;
  tagline?: string;
  tagline_en?: string;
  description?: string;
  description_en?: string;
  price: number;
  original_price?: number;
  weight?: string;
  origin?: string;
  roast_level?: 'light' | 'medium' | 'dark' | 'espresso';
  processing_method?: string;
  intensity?: number;
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  is_new: boolean;
  in_stock: boolean;
  is_active: boolean;
  is_on_sale: boolean;
  sale_discount_percent?: number;
  sale_ends_at?: string;
  tax_rate_override?: number;
  is_tax_exempt: boolean;
  category_id?: number;
  brand_id?: number;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  saleUnits?: SaleUnit[];
  globalTags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_label?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number?: string;
  user_id?: number;
  user?: User;
  billing_name?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  shipping_address?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: string;
  payment_method?: string;
  delivery_type?: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  promo_code?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author_name?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface PromoCode {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  uses_count: number;
  expires_at?: string;
  is_active: boolean;
}
