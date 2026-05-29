import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  serverAddress: string;
  isLoading: boolean;
  login: (loginVal: string, passwordVal: string, serverAddrIn: string) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (id: string, role: 'Admin' | 'Operator' | 'Viewer') => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial authentication state from localStorage to preserve session across reloads
  const cachedAuth = localStorage.getItem('office_auth');
  const cachedUser = localStorage.getItem('office_user');
  const cachedServer = localStorage.getItem('office_server');

  let initialUser: User | null = null;
  if (cachedUser) {
    try {
      initialUser = JSON.parse(cachedUser);
      if (initialUser && initialUser.role === 'Admin') {
        initialUser.name = 'Hangeldi Jorayew';
        initialUser.email = 'hangeldi@officecontrol.tm';
      }
    } catch (e) {}
  }

  return {
    isAuthenticated: cachedAuth === 'true',
    user: initialUser,
    serverAddress: cachedServer || '192.168.1.100:8080',
    isLoading: false,

    login: async (loginVal: string, passwordVal: string, serverAddrIn: string) => {
      set({ isLoading: true });
      // Simulate 1.5s loading
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Quick validation for simulation - anyone can log in, but if they login as "director" or "novikov" they get admin, etc.
      let role: 'Admin' | 'Operator' | 'Viewer' = 'Viewer';
      let name = 'Hangeldi Jorayew';
      let email = 'hangeldi@officecontrol.tm';

      const lowerLogin = loginVal.toLowerCase();
      if (lowerLogin.includes('admin') || lowerLogin.includes('director') || lowerLogin === 'сергей' || lowerLogin.includes('hangeldi')) {
        role = 'Admin';
        name = 'Hangeldi Jorayew';
        email = 'hangeldi@officecontrol.tm';
      } else if (lowerLogin.includes('operator') || lowerLogin.includes('security') || lowerLogin === 'павел') {
        role = 'Operator';
        name = 'Batyr Rejepow';
        email = 'smirnov.security@officecontrol.ru';
      } else {
        role = 'Viewer';
        name = 'Gülnara Sähedowa';
        email = 'kuznetsova.hr@officecontrol.ru';
      }

      const userObj: User = {
        id: role === 'Admin' ? 'user1' : role === 'Operator' ? 'user2' : 'user3',
        name,
        email,
        role,
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      localStorage.setItem('office_auth', 'true');
      localStorage.setItem('office_user', JSON.stringify(userObj));
      localStorage.setItem('office_server', serverAddrIn);

      set({
        isAuthenticated: true,
        user: userObj,
        serverAddress: serverAddrIn,
        isLoading: false,
      });

      return true;
    },

    logout: () => {
      localStorage.removeItem('office_auth');
      localStorage.removeItem('office_user');
      localStorage.removeItem('office_server');
      set({
        isAuthenticated: false,
        user: null,
      });
    },

    updateUserRole: (id: string, role: 'Admin' | 'Operator' | 'Viewer') => {
      set((state) => {
        if (state.user && state.user.id === id) {
          const updated = { ...state.user, role };
          localStorage.setItem('office_user', JSON.stringify(updated));
          return { user: updated };
        }
        return {};
      });
    },

    updateUser: (data: Partial<User>) => {
      set((state) => {
        if (state.user) {
          const updated = { ...state.user, ...data };
          localStorage.setItem('office_user', JSON.stringify(updated));
          return { user: updated };
        }
        return {};
      });
    },
  };
});
