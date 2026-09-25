import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartLine {
  productId: string;
  title: string;
  price: string;
  cleanImageUrl: string;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) => {
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, quantity: Math.min(l.quantity + 1, l.stockQuantity) }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: 1 }] };
        });
      },
      remove: (productId) => {
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) }));
      },
      setQuantity: (productId, quantity) => {
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId
              ? { ...l, quantity: Math.max(0, Math.min(quantity, l.stockQuantity)) }
              : l
          ),
        }));
      },
      clear: () => set({ lines: [] }),
      total: () =>
        get().lines.reduce((sum, l) => sum + parseFloat(l.price) * l.quantity, 0),
    }),
    {
      name: "sih.cart",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);