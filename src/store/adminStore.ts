import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'inventory_staff';
  locale: string;
}

interface AdminState {
  user: AdminUser | null;
  token: string | null;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  darkMode: boolean;

  // Actions
  setUser: (user: AdminUser, token: string) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarCollapsed: false,
      isLoading: false,
      darkMode: false,

      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setLoading: (v) => set({ isLoading: v }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: 'cafrezzo-admin',
      partialize: (s) => ({ user: s.user, token: s.token, sidebarCollapsed: s.sidebarCollapsed, darkMode: s.darkMode }),
    }
  )
);
