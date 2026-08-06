'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateWeightPrice } from '@/lib/pricing';

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  basePrice: number;
  baseWeightG: number;
  weightG: number;
  calculatedPrice: number;
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: { id: string; name: string; imageUrl: string; basePrice: number; baseWeightG: number }, weightG?: number, qty?: number) => void;
  removeFromCart: (productId: string, weightG: number) => void;
  updateQty: (productId: string, weightG: number, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedModalProduct: any | null;
  openProductModal: (product: any) => void;
  closeProductModal: () => void;
  cartSubtotal: number;
  cartTotalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedModalProduct, setSelectedModalProduct] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('mhc_cart');
      const savedWishlist = localStorage.getItem('mhc_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error('Error loading cart/wishlist from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('mhc_cart', JSON.stringify(cart));
        localStorage.setItem('mhc_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [cart, wishlist, isLoaded]);

  const addToCart = (
    product: { id: string; name: string; imageUrl: string; basePrice: number; baseWeightG: number },
    weightG?: number,
    qty: number = 1
  ) => {
    const selectedWeight = weightG || product.baseWeightG || 500;
    const itemPrice = calculateWeightPrice(product.basePrice, product.baseWeightG || 500, selectedWeight);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id && item.weightG === selectedWeight);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          basePrice: product.basePrice,
          baseWeightG: product.baseWeightG || 500,
          weightG: selectedWeight,
          calculatedPrice: itemPrice,
          qty,
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, weightG: number) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.weightG === weightG)));
  };

  const updateQty = (productId: string, weightG: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, weightG);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId && item.weightG === weightG ? { ...item, qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const openProductModal = (product: any) => setSelectedModalProduct(product);
  const closeProductModal = () => setSelectedModalProduct(null);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.calculatedPrice * item.qty, 0);
  const cartTotalCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        selectedModalProduct,
        openProductModal,
        closeProductModal,
        cartSubtotal,
        cartTotalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
