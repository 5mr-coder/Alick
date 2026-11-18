'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { isUuid } from '@/lib/utils';

export type SalesMode = 'consumer' | 'retail';

export interface CartItem {
  id: string;
  name: string;
  price: number; // Effective unit price in minor-unit kobo
  consumerPrice?: number;
  retailPrice?: number | null;
  quantity: number;
  stock: number;
  image: string;
  salesMode: SalesMode;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, mode: SalesMode) => void;
  updateQuantity: (id: string, mode: SalesMode, quantity: number) => void;
  switchItemToRetail: (id: string) => void;
  switchItemToConsumer: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoaded: boolean;
  salesMode: SalesMode | null;
  setSalesMode: (mode: SalesMode) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [salesMode, setSalesMode] = useState<SalesMode | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const saved =
        localStorage.getItem('alick-cart') ||
        localStorage.getItem('allick-cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Array<
            Omit<CartItem, 'salesMode'> & { salesMode?: SalesMode }
          >;
          if (Array.isArray(parsed)) {
            setItems(
              parsed
                // Purge legacy non-UUID items so checkout RPC always receives valid UUIDs
                .filter(
                  (item) => item && isUuid(item.id) && Number.isFinite(item.price)
                )
                .map((item) => {
                  const mode: SalesMode =
                    item.salesMode === 'retail' ? 'retail' : 'consumer';
                  const maximum =
                    mode === 'consumer' ? Math.min(item.stock, 9) : item.stock;
                  const quantity =
                    mode === 'retail'
                      ? maximum >= 10
                        ? Math.min(maximum, Math.max(10, item.quantity))
                        : 0
                      : Math.min(maximum, Math.max(0, item.quantity));
                  return { ...item, salesMode: mode, quantity };
                })
                .filter((item) => item.quantity > 0)
            );
          }
        } catch (e) {
          console.error('Could not load the saved cart', e);
        }
      }
      const savedMode = localStorage.getItem('alick-sales-mode');
      setSalesMode(savedMode === 'retail' ? 'retail' : 'consumer');
      setIsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('alick-cart', JSON.stringify(items));
      localStorage.removeItem('allick-cart');
      if (salesMode) localStorage.setItem('alick-sales-mode', salesMode);
    }
  }, [items, isLoaded, salesMode]);

  const addToCart = (newItem: CartItem) => {
    if (!isUuid(newItem.id)) return;
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === newItem.id && item.salesMode === newItem.salesMode
      );
      const minimum = newItem.salesMode === 'retail' ? 10 : 1;
      const maximum =
        newItem.salesMode === 'consumer'
          ? Math.min(newItem.stock, 9)
          : newItem.stock;
      if (maximum < minimum) return currentItems;
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id && item.salesMode === newItem.salesMode
            ? {
                ...item,
                price: newItem.price,
                stock: newItem.stock,
                quantity: Math.min(
                  maximum,
                  Math.max(minimum, item.quantity + newItem.quantity)
                ),
              }
            : item
        );
      }
      return [
        ...currentItems,
        {
          ...newItem,
          quantity: Math.min(maximum, Math.max(minimum, newItem.quantity)),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, mode: SalesMode) => {
    setItems((current) =>
      current.filter((item) => item.id !== id || item.salesMode !== mode)
    );
  };

  const updateQuantity = (id: string, mode: SalesMode, quantity: number) => {
    if (quantity <= 0) {
      if (mode === 'consumer') removeFromCart(id, mode);
      return;
    }
    setItems((current) =>
      current.map((item) => {
        if (item.id === id && item.salesMode === mode) {
          const minimum = mode === 'retail' ? 10 : 1;
          const maximum =
            mode === 'consumer' ? Math.min(item.stock, 9) : item.stock;
          if (maximum < minimum) return item;
          return {
            ...item,
            quantity: Math.min(maximum, Math.max(minimum, quantity)),
          };
        }
        return item;
      })
    );
  };

  const switchItemToRetail = (id: string) => {
    setItems((current) => {
      const consumerItem = current.find(
        (item) => item.id === id && item.salesMode === 'consumer'
      );
      if (!consumerItem || consumerItem.stock < 10) return current;

      const nextPrice =
        consumerItem.retailPrice && consumerItem.retailPrice < consumerItem.price
          ? consumerItem.retailPrice
          : consumerItem.price;

      const retailItem = current.find(
        (item) => item.id === id && item.salesMode === 'retail'
      );
      if (retailItem) {
        const quantity = Math.min(
          retailItem.stock,
          Math.max(10, retailItem.quantity + consumerItem.quantity)
        );
        return current
          .filter((item) => item !== consumerItem && item !== retailItem)
          .concat({ ...retailItem, price: nextPrice, quantity });
      }

      return current.map((item) =>
        item === consumerItem
          ? {
              ...item,
              salesMode: 'retail',
              price: nextPrice,
              quantity: Math.max(10, item.quantity),
            }
          : item
      );
    });
    setSalesMode('retail');
  };

  const switchItemToConsumer = (id: string) => {
    setItems((current) => {
      const retailItem = current.find(
        (item) => item.id === id && item.salesMode === 'retail'
      );
      if (!retailItem) return current;

      const nextPrice = retailItem.consumerPrice ?? retailItem.price;
      const maximum = Math.min(retailItem.stock, 9);
      const quantity = Math.min(maximum, Math.max(1, retailItem.quantity));
      const consumerItem = current.find(
        (item) => item.id === id && item.salesMode === 'consumer'
      );

      if (consumerItem) {
        return current
          .filter((item) => item !== retailItem && item !== consumerItem)
          .concat({
            ...consumerItem,
            price: nextPrice,
            quantity: Math.min(
              maximum,
              Math.max(1, consumerItem.quantity + quantity)
            ),
          });
      }

      return current.map((item) =>
        item === retailItem
          ? {
              ...item,
              salesMode: 'consumer' as SalesMode,
              price: nextPrice,
              quantity,
            }
          : item
      );
    });
    setSalesMode('consumer');
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        switchItemToRetail,
        switchItemToConsumer,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isLoaded,
        salesMode,
        setSalesMode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
