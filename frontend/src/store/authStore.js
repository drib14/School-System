import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  school: null,
  isLoading: false,
  isAuthenticated: false,
  
  setUser: (user, school) => set({ user, school, isAuthenticated: !!user }),
  
  login: async (email, password, twoFactorCode) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password, twoFactorCode });
      if (data.requiresTwoFactor) {
        set({ isLoading: false });
        return { requiresTwoFactor: true };
      }
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, school: data.school, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('accessToken');
    set({ user: null, school: null, isAuthenticated: false });
  },

  getMe: async () => {
    if (!localStorage.getItem('accessToken')) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, school: data.user.schoolId, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
      localStorage.removeItem('accessToken');
    }
  },

  updateMe: async (updates) => {
    const { data } = await api.put('/auth/me', updates);
    set({ user: data.user });
    return data.user;
  },

  hasRole: (...roles) => {
    const { user } = get();
    return user ? roles.includes(user.role) : false;
  },
}));

export const useNotifStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/communication/notifications?limit=10');
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } catch (_) {}
  },
  markRead: async (id) => {
    await api.put(`/communication/notifications/${id}/read`);
    set(state => ({
      notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllRead: async () => {
    await api.put('/communication/notifications/read-all');
    set(state => ({ notifications: state.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 }));
  },
}));
