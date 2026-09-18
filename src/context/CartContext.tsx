import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useNotification } from './NotificationContext';

interface CartContextType {
  cart: CartItem[];
  savedForLater: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariations?: Record<string, string>) => void;
  removeFromCart: (productId: string, variations?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variations?: Record<string, string>) => void;
  saveItemForLater: (productId: string, variations?: Record<string, string>) => void;
  moveToCartFromSaved: (productId: string, variations?: Record<string, string>) => void;
  removeFromSaved: (productId: string, variations?: Record<string, string>) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  voucherCode: string;
  applyVoucher: (code: string) => boolean;
  removeVoucher: () => void;
  voucherDiscountAmount: number;
  estimatedDeliveryFee: number;
  finalTotal: number;
}

const STORAGE_KEY_CART = 'sokodirect_cart';
const STORAGE_KEY_SAVED = 'sokodirect_saved_later';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    // Initial sample item for instant discovery if user opens cart
    return [];
  });

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved items', e);
    }
    return [];
  });

  const [voucherCode, setVoucherCode] = useState<string>('');
  const [voucherDiscountRate, setVoucherDiscountRate] = useState<number>(0);
  const { showToast } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedForLater));
    } catch (e) {
      console.error('Failed to save saved items', e);
    }
  }, [savedForLater]);

  const areVariationsEqual = (v1: Record<string, string> = {}, v2: Record<string, string> = {}) => {
    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every((k) => v1[k] === v2[k]);
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedVariations: Record<string, string> = {}
  ) => {
    // calculate unit price with variation adjustments
    let unitPrice = product.price;
    if (product.variations && selectedVariations) {
      product.variations.forEach((v) => {
        const selectedVal = selectedVariations[v.title] || selectedVariations[v.type];
        if (selectedVal) {
          const opt = v.options.find((o) => o.value === selectedVal || o.name === selectedVal);
          if (opt?.priceModifier) {
            unitPrice += opt.priceModifier;
          }
        }
      });
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          areVariationsEqual(item.selectedVariations, selectedVariations)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          product,
          quantity,
          selectedVariations,
          unitPrice,
          totalPrice: quantity * unitPrice,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added "${product.name.slice(0, 24)}..." to cart!`, 'success');
  };

  const removeFromCart = (productId: string, variations: Record<string, string> = {}) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && areVariationsEqual(item.selectedVariations, variations))
      )
    );
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variations: Record<string, string> = {}
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, variations);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          areVariationsEqual(item.selectedVariations, variations)
        ) {
          const maxStock = item.product.stock || 99;
          const safeQty = Math.min(quantity, maxStock);
          return {
            ...item,
            quantity: safeQty,
            totalPrice: safeQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const saveItemForLater = (productId: string, variations: Record<string, string> = {}) => {
    const itemToSave = cart.find(
      (item) =>
        item.productId === productId &&
        areVariationsEqual(item.selectedVariations, variations)
    );

    if (itemToSave) {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.productId === productId &&
              areVariationsEqual(item.selectedVariations, variations)
            )
        )
      );
      setSavedForLater((prev) => [...prev, { ...itemToSave, savedForLater: true }]);
      showToast('Item moved to Save for Later', 'info');
    }
  };

  const moveToCartFromSaved = (productId: string, variations: Record<string, string> = {}) => {
    const itemToMove = savedForLater.find(
      (item) =>
        item.productId === productId &&
        areVariationsEqual(item.selectedVariations, variations)
    );

    if (itemToMove) {
      setSavedForLater((prev) =>
        prev.filter(
          (item) =>
            !(
              item.productId === productId &&
              areVariationsEqual(item.selectedVariations, variations)
            )
        )
      );
      addToCart(itemToMove.product, itemToMove.quantity, itemToMove.selectedVariations);
    }
  };

  const removeFromSaved = (productId: string, variations: Record<string, string> = {}) => {
    setSavedForLater((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && areVariationsEqual(item.selectedVariations, variations))
      )
    );
    showToast('Item removed from saved list', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyVoucher = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'KARIBU10' || cleanCode === 'SOKO10') {
      setVoucherCode(cleanCode);
      setVoucherDiscountRate(0.10); // 10%
      showToast('Voucher KARIBU10 applied! 10% discount added.', 'success');
      return true;
    } else if (cleanCode === 'FREESHIP') {
      setVoucherCode(cleanCode);
      setVoucherDiscountRate(0.05); // 5% mock + free shipping flag
      showToast('Voucher FREESHIP applied!', 'success');
      return true;
    } else if (cleanCode === 'RAMADHAN20' || cleanCode === 'EID20') {
      setVoucherCode(cleanCode);
      setVoucherDiscountRate(0.20); // 20%
      showToast('Promotional voucher applied: 20% OFF!', 'success');
      return true;
    } else {
      showToast('Invalid or expired coupon code. Try KARIBU10', 'error');
      return false;
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setVoucherDiscountRate(0);
    showToast('Voucher removed', 'info');
  };

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const voucherDiscountAmount = useMemo(() => {
    return subtotal * voucherDiscountRate;
  }, [subtotal, voucherDiscountRate]);

  // If items qualify for free delivery or over 150,000 TZS standard
  const estimatedDeliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (voucherCode === 'FREESHIP') return 0;
    const allFree = cart.every((item) => item.product.freeDeliveryEligible);
    if (allFree || subtotal > 200000) return 0;
    return 3500; // standard Dar base
  }, [cart, subtotal, voucherCode]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - voucherDiscountAmount + estimatedDeliveryFee);
  }, [subtotal, voucherDiscountAmount, estimatedDeliveryFee]);

  return (
    <CartContext.Provider
      value={{
        cart,
        savedForLater,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveItemForLater,
        moveToCartFromSaved,
        removeFromSaved,
        clearCart,
        cartCount,
        subtotal,
        discount: voucherDiscountAmount,
        voucherCode,
        applyVoucher,
        removeVoucher,
        voucherDiscountAmount,
        estimatedDeliveryFee,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
