import { create } from "zustand";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface ToastStore {
  messages: ToastMessage[];
  add: (message: Omit<ToastMessage, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  messages: [],

  add: (message) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = message.duration || 3000;

    set((state) => ({
      messages: [...state.messages, { ...message, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        }));
      }, duration);
    }
  },

  remove: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  clear: () => set({ messages: [] }),
}));

export function useToast() {
  const { add } = useToastStore();

  return {
    success: (message: string) => add({ type: "success", message }),
    error: (message: string) => add({ type: "error", message, duration: 5000 }),
    info: (message: string) => add({ type: "info", message }),
    warning: (message: string) => add({ type: "warning", message }),
  };
}
