import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorkSchedule } from '../types';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  workSchedule: WorkSchedule;
  browserNotificationsEnabled: boolean;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  updateWorkSchedule: (schedule: Partial<WorkSchedule>) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      sidebarOpen: true,
      browserNotificationsEnabled: false,
      workSchedule: {
        workStart: '09:00',
        workEnd: '18:00',
        lunchStart: '13:00',
        lunchEnd: '14:00',
        workDays: [1, 2, 3, 4, 5],
      },

      setBrowserNotificationsEnabled: (enabled) => set({ browserNotificationsEnabled: enabled }),

      toggleTheme: () => set((state) => {
        const next = state.themeMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme_mode', next);
        return { themeMode: next };
      }),

      setThemeMode: (mode) => {
        localStorage.setItem('theme_mode', mode);
        set({ themeMode: mode });
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      updateWorkSchedule: (schedule) => set((state) => ({
        workSchedule: { ...state.workSchedule, ...schedule }
      })),
    }),
    {
      name: 'office-control-ui-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
