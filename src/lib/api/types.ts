/**
 * API Response Types — matching Laravel's default pagination format.
 *
 * Laravel's paginate() returns:
 * {
 *   data: T[],
 *   links: { first, last, prev, next },
 *   meta: { current_page, from, last_page, per_page, to, total }
 * }
 */

// ── Paginated Response ────────────────────────────────────────────────────────
export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    path: string;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

// ── Single Resource Response ───────────────────────────────────────────────────
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

// ── Error Response ────────────────────────────────────────────────────────────
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>; // Laravel validation error format
    status: number;
}

// ── Query Params ─────────────────────────────────────────────────────────────
export interface PaginationParams {
    page?: number;
    per_page?: number;
}

export interface ProductQueryParams extends PaginationParams {
    category?: string;         // category slug
    category_id?: number;
    brand?: string;            // brand slug
    brand_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'name_asc' | 'name_desc';
    tags?: string;             // comma-separated tag labels
    tag?: string;              // single tag label
    intensity_min?: number;
    intensity_max?: number;
    featured?: boolean;
    storefront_page?: string;  // e.g. "/shop", "/machines"
}

export interface BlogQueryParams extends PaginationParams {
    category?: string;
    search?: string;
    sort_by?: 'newest' | 'oldest';
}

export interface OrderQueryParams extends PaginationParams {
    status?: string;
}

// ── Fetch State ───────────────────────────────────────────────────────────────
export interface FetchState<T> {
    data: T | null;
    isLoading: boolean;
    error: ApiError | null;
}

export interface PaginatedFetchState<T> {
    data: T[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: ApiError | null;
    hasMore: boolean;
}
