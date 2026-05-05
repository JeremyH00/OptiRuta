import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  sidebarOpen: boolean;
  toasts: Toast[];

  setSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>(set => ({
  sidebarOpen: true,
  toasts: [],

  setSidebarOpen(open) {
    set({ sidebarOpen: open });
  },

  addToast(message, type) {
    const id = `toast-${++toastCounter}`;
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast(id) {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));
