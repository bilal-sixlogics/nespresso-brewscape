"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'order' | 'promo' | 'system';
    title: string;
    body: string;
    isRead: boolean;
    date: string;
    href?: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    markAllRead: () => void;
    markRead: (id: string) => void;
    addNotification: (n: Omit<Notification, 'id' | 'isRead' | 'date'>) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const DEMO_NOTIFICATIONS: Notification[] = [
    { id: 'n1', type: 'order', title: 'Order Shipped 🚚', body: 'Your order CF-99281A is on its way! Tracking: TRK99281FR', isRead: false, date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), href: '/account' },
    { id: 'n2', type: 'promo', title: 'Weekend Deal ☕', body: 'Get 15% off all Lavazza products this weekend. Use code LAVA15', isRead: false, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), href: '/shop' },
    { id: 'n3', type: 'order', title: 'Order Delivered ✅', body: 'Your order CF-88172B has been delivered. Enjoy your coffee!', isRead: true, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), href: '/account' },
    { id: 'n4', type: 'system', title: 'Welcome to Cafrezzo!', body: 'Your account is ready. Explore our full range of premium coffees.', isRead: true, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), href: '/shop' },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

    const save = (items: Notification[]) => {
        setNotifications(items);
        try { localStorage.setItem('cafrezzo-notifications', JSON.stringify(items)); } catch (e) { }
    };

    const markAllRead = () => save(notifications.map(n => ({ ...n, isRead: true })));
    const markRead = (id: string) => save(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    const addNotification = (n: Omit<Notification, 'id' | 'isRead' | 'date'>) => {
        save([{ ...n, id: `n_${Date.now()}`, isRead: false, date: new Date().toISOString() }, ...notifications]);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, addNotification }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
}
