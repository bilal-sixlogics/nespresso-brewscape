/**
 * API Client — typed fetch wrapper.
 *
 * Design principles:
 * - All requests go through this client (single responsibility)
 * - Auth token injected automatically via getToken()
 * - Errors parsed into typed ApiError objects
 * - Retries on network failure (configurable)
 * - Mock mode: when NEXT_PUBLIC_USE_MOCK=true, returns dummy data
 */

import { ApiError } from './types';

// ── Storage keys ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'cf_auth_token';
const SESSION_KEY = 'guest_session_id';

// Generate or retrieve a persistent guest session ID
function getOrCreateSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// ── Base Fetch ────────────────────────────────────────────────────────────────
interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined | null>;
    retries?: number;
}

async function parseError(res: Response): Promise<ApiError> {
    try {
        const body = await res.json();
        return {
            message: body.message ?? 'An error occurred',
            errors: body.errors,
            status: res.status,
        };
    } catch {
        return { message: res.statusText || 'Network Error', status: res.status };
    }
}

async function apiFetch<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { params, retries = 1, ...init } = options;

    // Append query params
    if (params) {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v != null && v !== '') search.set(k, String(v));
        });
        const qs = search.toString();
        if (qs) url = `${url}?${qs}`;
    }

    const token = getToken();
    const sessionId = getOrCreateSessionId();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (sessionId) headers['X-Session-ID'] = sessionId;

    let lastError: ApiError = { message: 'Unknown error', status: 0 };

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { ...init, headers });

            if (!res.ok) {
                // 401 — token expired, clear and redirect to login
                if (res.status === 401) {
                    clearToken();
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:expired'));
                }
                lastError = await parseError(res);
                // Don't retry on 4xx (client errors)
                if (res.status < 500) throw lastError;
                continue;
            }

            // 204 No Content
            if (res.status === 204) return undefined as T;

            return (await res.json()) as T;
        } catch (err) {
            if ((err as ApiError).status) throw err; // already typed
            lastError = { message: (err as Error).message, status: 0 };
            if (attempt < retries) await delay(300 * (attempt + 1));
        }
    }

    throw lastError;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── HTTP Methods ──────────────────────────────────────────────────────────────
export const apiClient = {
    get: <T>(url: string, options?: RequestOptions) =>
        apiFetch<T>(url, { ...options, method: 'GET' }),

    post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
        apiFetch<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
        apiFetch<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
        apiFetch<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T>(url: string, options?: RequestOptions) =>
        apiFetch<T>(url, { ...options, method: 'DELETE' }),
};
