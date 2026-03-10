/**
 * Admin API client — wraps fetch with auth token + base URL.
 * All methods return typed data or throw an Error with message.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cafrezzo-admin');
    return raw ? JSON.parse(raw)?.state?.token ?? null : null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'API error');
  }

  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: unknown; token: string }>('/v1/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request('/v1/admin/logout', { method: 'POST' }),
    me: () => request('/v1/admin/me'),
  },

  // ── Products ────────────────────────────────────────────────────────────
  products: {
    list: (params?: Record<string, string | number>) =>
      request(`/v1/admin/products?${new URLSearchParams(params as Record<string, string>)}`),
    byType: (type: string, page = 1, search = '') =>
      request(`/v1/admin/products?product_type=${type}&page=${page}&search=${encodeURIComponent(search)}`),
    get: (id: number) => request(`/v1/admin/products/${id}`),
    create: (data: unknown) =>
      request('/v1/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/products/${id}`, { method: 'DELETE' }),
  },

  // ── Orders ───────────────────────────────────────────────────────────────
  orders: {
    list: (page = 1, status = '') =>
      request(`/v1/admin/orders?page=${page}${status ? `&status=${status}` : ''}`),
    get: (id: number) => request(`/v1/admin/orders/${id}`),
    updateStatus: (id: number, status: string) =>
      request(`/v1/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // ── Catalog Setup ────────────────────────────────────────────────────────
  categories: {
    list: () => request('/v1/admin/categories'),
    create: (data: unknown) =>
      request('/v1/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/categories/${id}`, { method: 'DELETE' }),
  },
  brands: {
    list: () => request('/v1/admin/brands'),
    create: (data: unknown) =>
      request('/v1/admin/brands', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/brands/${id}`, { method: 'DELETE' }),
  },
  tags: {
    list: () => request('/v1/admin/tags'),
    create: (data: unknown) =>
      request('/v1/admin/tags', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/tags/${id}`, { method: 'DELETE' }),
  },

  // ── Dashboard ────────────────────────────────────────────────────────────
  dashboard: {
    stats: () => request('/v1/admin/dashboard/stats'),
    salesTrend: (days = 30) => request(`/v1/admin/dashboard/sales-trend?days=${days}`),
  },

  // ── Users ────────────────────────────────────────────────────────────────
  users: {
    list: (page = 1) => request(`/v1/admin/users?page=${page}`),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/users/${id}`, { method: 'DELETE' }),
  },

  // ── Inventory ─────────────────────────────────────────────────────────────
  inventory: {
    list: () => request('/v1/admin/inventory'),
    adjust: (id: number, data: unknown) =>
      request(`/v1/admin/inventory/${id}/adjust`, { method: 'POST', body: JSON.stringify(data) }),
    transactions: (id: number) => request(`/v1/admin/inventory/${id}/transactions`),
  },

  // ── Blog Posts ────────────────────────────────────────────────────────────
  blog: {
    list: (page = 1) => request(`/v1/admin/blog-posts?page=${page}`),
    get: (id: number) => request(`/v1/admin/blog-posts/${id}`),
    create: (data: unknown) =>
      request('/v1/admin/blog-posts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/blog-posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/blog-posts/${id}`, { method: 'DELETE' }),
  },

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonials: {
    list: () => request('/v1/admin/testimonials'),
    create: (data: unknown) =>
      request('/v1/admin/testimonials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/testimonials/${id}`, { method: 'DELETE' }),
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  banners: {
    list: () => request('/v1/admin/banners'),
    create: (data: unknown) =>
      request('/v1/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/banners/${id}`, { method: 'DELETE' }),
  },

  // ── Promo Codes ───────────────────────────────────────────────────────────
  promos: {
    list: () => request('/v1/admin/promo-codes'),
    create: (data: unknown) =>
      request('/v1/admin/promo-codes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/promo-codes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/promo-codes/${id}`, { method: 'DELETE' }),
  },

  // ── Delivery Types ────────────────────────────────────────────────────────
  delivery: {
    list: () => request('/v1/admin/delivery-types'),
    create: (data: unknown) =>
      request('/v1/admin/delivery-types', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/delivery-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/delivery-types/${id}`, { method: 'DELETE' }),
  },

  // ── Payment Methods ───────────────────────────────────────────────────────
  payments: {
    list: () => request('/v1/admin/payment-methods'),
    create: (data: unknown) =>
      request('/v1/admin/payment-methods', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) =>
      request(`/v1/admin/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/v1/admin/payment-methods/${id}`, { method: 'DELETE' }),
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    get: () => request('/v1/admin/settings'),
    update: (data: unknown) =>
      request('/v1/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
};
