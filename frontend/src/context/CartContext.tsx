import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  sku?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'cart.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextValue['addItem'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId ? { ...p, quantity: Math.min(999, p.quantity + quantity) } : p
        );
      }
      return [...prev, { ...item, quantity: Math.max(1, Math.min(999, quantity)) }];
    });
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (productId, quantity) => {
    setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, quantity: Math.max(1, Math.min(999, quantity)) } : p)));
  };

  const removeItem: CartContextValue['removeItem'] = (productId) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  };

  const clear: CartContextValue['clear'] = () => setItems([]);

  const totalQuantity = useMemo(() => items.reduce((acc, it) => acc + it.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.price * it.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    totalQuantity,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


