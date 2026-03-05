"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('cafrezzo-theme') as Theme | null;
            if (saved === 'dark' || saved === 'light') {
                setTheme(saved);
                document.documentElement.classList.toggle('dark', saved === 'dark');
            }
        } catch (e) { }
    }, []);

    const toggleTheme = () => {
        const next: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        try { localStorage.setItem('cafrezzo-theme', next); } catch (e) { }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
