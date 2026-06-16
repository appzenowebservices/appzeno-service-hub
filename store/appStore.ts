import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { City, Notification } from "../types";

interface AppState {
  selectedCity: City | null;
  availableCities: City[];
  setSelectedCity: (city: City) => void;
  setAvailableCities: (cities: City[]) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (n: Notification[]) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCity: null,
      availableCities: [],
      setSelectedCity: (city) => set({ selectedCity: city }),
      setAvailableCities: (cities) => set({ availableCities: cities }),
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length }),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n), unreadCount: Math.max(0, s.unreadCount - 1) })),
      globalLoading: false,
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: "addies-app",
      partialize: (s) => ({ selectedCity: s.selectedCity, sidebarOpen: s.sidebarOpen }),
    }
  )
);
