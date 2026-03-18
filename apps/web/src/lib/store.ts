import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan?: string;
  currency?: string;
  timezone?: string;
  logoUrl?: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? api.getUser() : null,
  tenant: null,
  isLoading: false,
  isAuthenticated: typeof window !== 'undefined' ? api.isAuthenticated() : false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.login(email, password);
      set({
        user: res.data.user,
        tenant: res.data.tenant,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      const res = await api.register(data);
      set({
        user: res.data.user,
        tenant: res.data.tenant,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({ user: null, tenant: null, isAuthenticated: false });
  },

  loadProfile: async () => {
    try {
      const res = await api.getProfile();
      set({
        user: res.data,
        tenant: res.data.tenant,
        isAuthenticated: true,
      });
    } catch {
      set({ user: null, tenant: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
}));
