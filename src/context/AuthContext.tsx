"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address } from '@/types';
import { apiClient, setToken, clearToken, getToken } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';

// ── Backend user shape ────────────────────────────────────────────────────────
interface BackendUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    locale: string;
    is_blocked: boolean;
    email_verified?: boolean;
    addresses: BackendAddress[];
}

interface BackendAddress {
    id: number;
    label: string;
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    phone?: string;
    is_default: boolean;
}

// Map backend shape → frontend Address type
function mapAddress(a: BackendAddress): Address {
    return {
        id: String(a.id),
        label: a.label || 'Address',
        firstName: a.first_name,
        lastName: a.last_name,
        address: [a.address_1, a.address_2].filter(Boolean).join(', '),
        city: a.city,
        postalCode: a.postcode,
        phone: a.phone,
        isDefault: a.is_default,
    };
}

// Map backend shape → frontend User type
function mapUser(b: BackendUser): User {
    return {
        id: String(b.id),
        name: b.name,
        email: b.email,
        avatar: b.avatar ?? undefined,
        emailVerified: b.email_verified ?? true,
        orders: [],
        addresses: (b.addresses ?? []).map(mapAddress),
    };
}

// ── Context type ──────────────────────────────────────────────────────────────
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isHydrating: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string, phone?: string, verificationToken?: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    // Profile management
    updateUser: (patch: Partial<User>) => void;
    // Address management
    refreshAddresses: () => Promise<void>;
    defaultAddress: Address | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isHydrating, setIsHydrating] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const isAuthenticated = user !== null;

    // ── Hydrate session from /auth/me on mount ────────────────────────────────
    useEffect(() => {
        const token = getToken();
        if (!token) {
            setIsHydrating(false);
            return;
        }

        apiClient.get<{ user: BackendUser }>(Endpoints.me)
            .then(res => setUser(mapUser(res.user)))
            .catch(() => clearToken())
            .finally(() => setIsHydrating(false));
    }, []);

    // ── Listen for auth:expired event dispatched by apiClient on 401 ──────────
    useEffect(() => {
        const handleExpired = () => {
            setUser(null);
            clearToken();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:session-cleared'));
                // Redirect to homepage unless already there
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        };
        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, []);

    // ── Merge guest cart after login/register ─────────────────────────────────
    const mergeGuestCart = useCallback(async () => {
        const sessionId = typeof window !== 'undefined'
            ? localStorage.getItem('guest_session_id')
            : null;
        if (!sessionId) return;
        try {
            await apiClient.post(Endpoints.cartMerge, { session_id: sessionId });
            localStorage.removeItem('guest_session_id');
        } catch {
            // Non-fatal — cart merge best-effort
        }
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email: string, password: string) => {
        const res = await apiClient.post<{ token: string; user: BackendUser }>(Endpoints.login, { email, password });
        setToken(res.token);
        const mapped = mapUser(res.user);
        setUser(mapped);
        setIsLoginModalOpen(false);
        await mergeGuestCart();
    }, [mergeGuestCart]);

    // ── Register ──────────────────────────────────────────────────────────────
    const register = useCallback(async (
        name: string,
        email: string,
        password: string,
        passwordConfirmation: string,
        phone?: string,
        verificationToken?: string,
    ) => {
        const res = await apiClient.post<{ token: string; user: BackendUser }>(Endpoints.register, {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            ...(phone ? { phone } : {}),
            ...(verificationToken ? { verification_token: verificationToken } : {}),
        });
        setToken(res.token);
        const mapped = mapUser(res.user);
        setUser(mapped);
        setIsLoginModalOpen(false);
        await mergeGuestCart();
    }, [mergeGuestCart]);

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await apiClient.post(Endpoints.logout);
        } catch {
            // Ignore errors — clear locally regardless
        } finally {
            clearToken();
            setUser(null);
        }
    }, []);

    // ── Refresh addresses from backend ────────────────────────────────────────
    const refreshAddresses = useCallback(async () => {
        if (!user) return;
        const res = await apiClient.get<{ data: BackendAddress[] }>(Endpoints.addresses);
        setUser(prev => prev ? { ...prev, addresses: res.data.map(mapAddress) } : prev);
    }, [user]);

    const defaultAddress = user?.addresses?.find(a => a.isDefault) ?? user?.addresses?.[0] ?? null;

    const updateUser = useCallback((patch: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...patch } : prev);
    }, []);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isHydrating,
            login,
            register,
            logout,
            isLoginModalOpen,
            openLoginModal,
            closeLoginModal,
            updateUser,
            refreshAddresses,
            defaultAddress,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
