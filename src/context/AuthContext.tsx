"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Order, Address } from '@/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    addMockOrder: (order: Order) => void;
    // Address management
    addAddress: (address: Omit<Address, 'id'>) => void;
    updateAddress: (address: Address) => void;
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
    defaultAddress: Address | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo addresses for the mock user
const DEMO_ADDRESSES: Address[] = [
    {
        id: 'addr_default',
        label: 'Home',
        firstName: 'Jane',
        lastName: 'Doe',
        address: '12 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33 6 12 34 56 78',
        isDefault: true,
    },
    {
        id: 'addr_work',
        label: 'Office',
        firstName: 'Jane',
        lastName: 'Doe',
        address: '5 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        phone: '+33 1 23 45 67 89',
        isDefault: false,
    },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('cafrezzo-user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setIsAuthenticated(true);
            }
        } catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to parse user session', e);
            }
        }
    }, []);

    const saveUser = (u: User) => {
        setUser(u);
        setIsAuthenticated(true);
        try {
            localStorage.setItem('cafrezzo-user', JSON.stringify(u));
        } catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to save user session', e);
            }
        }
    };

    const login = (newUser: User) => {
        // If the user has no addresses set, assign demo ones
        const userWithAddresses = {
            ...newUser,
            addresses: newUser.addresses?.length ? newUser.addresses : DEMO_ADDRESSES,
        };
        setIsLoginModalOpen(false);
        saveUser(userWithAddresses);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        try {
            localStorage.removeItem('cafrezzo-user');
        } catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to remove user session', e);
            }
        }
    };

    const addMockOrder = (order: Order) => {
        if (!user) return;
        const updatedUser = { ...user, orders: [...(user.orders || []), order] };
        saveUser(updatedUser);
    };

    // --- Address Management ---
    const addAddress = (addressData: Omit<Address, 'id'>) => {
        if (!user) return;
        const newAddress: Address = { ...addressData, id: `addr_${Date.now()}` };
        const addresses = user.addresses ?? [];
        // If this is the first address, make it default
        if (addresses.length === 0) newAddress.isDefault = true;
        saveUser({ ...user, addresses: [...addresses, newAddress] });
    };

    const updateAddress = (updated: Address) => {
        if (!user) return;
        const addresses = (user.addresses ?? []).map(a => a.id === updated.id ? updated : a);
        saveUser({ ...user, addresses });
    };

    const deleteAddress = (id: string) => {
        if (!user) return;
        let addresses = (user.addresses ?? []).filter(a => a.id !== id);
        // If we deleted the default, make the first one the new default
        if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
            addresses = [{ ...addresses[0], isDefault: true }, ...addresses.slice(1)];
        }
        saveUser({ ...user, addresses });
    };

    const setDefaultAddress = (id: string) => {
        if (!user) return;
        const addresses = (user.addresses ?? []).map(a => ({ ...a, isDefault: a.id === id }));
        saveUser({ ...user, addresses });
    };

    const defaultAddress = user?.addresses?.find(a => a.isDefault) ?? user?.addresses?.[0] ?? null;

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            isLoginModalOpen,
            openLoginModal,
            closeLoginModal,
            addMockOrder,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
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
