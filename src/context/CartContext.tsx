'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2, ShoppingBag, X, AlertCircle, LogOut } from 'lucide-react';
import { calculateWeightPrice, formatINR, getVariantPrice, getDiscountedPrice } from '@/lib/pricing';

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  basePrice: number;
  baseWeightG: number;
  weightG: number;
  calculatedPrice: number;
  qty: number;
  cakeMessage?: string;
  specialNotes?: string;
}

export interface ToastMessage {
  id: number;
  type: 'cart' | 'success' | 'error' | 'info';
  title?: string;
  message?: string;
  name?: string;
  weightG?: number;
  price?: number;
  imageUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (
    product: { id: string; name: string; imageUrl: string; basePrice: number; baseWeightG: number },
    weightG?: number,
    qty?: number,
    cakeMessage?: string,
    specialNotes?: string
  ) => void;
  removeFromCart: (productId: string, weightG: number) => void;
  removeCartItemByIndex: (index: number) => void;
  updateQty: (productId: string, weightG: number, qty: number) => void;
  updateCartItemByIndex: (
    index: number,
    updates: { weightG?: number; qty?: number; cakeMessage?: string; specialNotes?: string }
  ) => void;
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
  toast: ToastMessage | null;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedModalProduct, setSelectedModalProduct] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

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

  const showToast = useCallback((toastData: Omit<ToastMessage, 'id'>) => {
    setToast({
      id: Date.now(),
      ...toastData,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Toast timer auto-dismiss (~3.2 seconds)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (
    product: any,
    weightG?: number,
    qty: number = 1,
    cakeMessage?: string,
    specialNotes?: string
  ) => {
    const selectedWeight = weightG || product.baseWeightG || 500;
    const rawPrice = getVariantPrice(product, selectedWeight);
    const discPct = (product.discountPercentage !== undefined && product.discountPercentage !== null)
      ? Number(product.discountPercentage)
      : 0;
    const itemPrice = getDiscountedPrice(rawPrice, discPct);
    const msg = cakeMessage ? cakeMessage.trim() : '';
    const notes = specialNotes ? specialNotes.trim() : '';

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.productId === product.id &&
          item.weightG === selectedWeight &&
          (item.cakeMessage || '') === msg &&
          (item.specialNotes || '') === notes
      );
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
          cakeMessage: msg,
          specialNotes: notes,
        }
      ];
    });

    // Trigger cart toast notification
    showToast({
      type: 'cart',
      name: product.name,
      weightG: selectedWeight,
      price: itemPrice * qty,
      imageUrl: product.imageUrl || '/cake-placeholder.svg',
    });
  };

  const removeFromCart = (productId: string, weightG: number) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.weightG === weightG)));
  };

  const removeCartItemByIndex = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
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

  const updateCartItemByIndex = (
    index: number,
    updates: { weightG?: number; qty?: number; cakeMessage?: string; specialNotes?: string }
  ) => {
    setCart(prev => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      const item = { ...updated[index] };

      if (updates.qty !== undefined) {
        if (updates.qty <= 0) {
          return prev.filter((_, i) => i !== index);
        }
        item.qty = updates.qty;
      }

      if (updates.weightG !== undefined && updates.weightG > 0) {
        item.weightG = updates.weightG;
        item.calculatedPrice = calculateWeightPrice(item.basePrice, item.baseWeightG, updates.weightG);
      }

      if (updates.cakeMessage !== undefined) {
        item.cakeMessage = updates.cakeMessage;
      }

      if (updates.specialNotes !== undefined) {
        item.specialNotes = updates.specialNotes;
      }

      updated[index] = item;
      return updated;
    });
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
        removeCartItemByIndex,
        updateQty,
        updateCartItemByIndex,
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
        toast,
        showToast,
        dismissToast,
      }}
    >
      {children}

      {/* Global Unified Toast Notification System */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm bg-bakery-chocolate text-white p-3.5 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center justify-between gap-3 animate-fadeIn transition-all duration-300 cursor-pointer"
          onClick={dismissToast}
        >
          {toast.type === 'cart' ? (
            <>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {toast.imageUrl && (
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20">
                    <Image src={toast.imageUrl} alt={toast.name || 'Product'} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Added to Cart</span>
                  </div>
                  {toast.name && <h4 className="text-xs font-bold text-white truncate">{toast.name}</h4>}
                  {toast.weightG !== undefined && toast.price !== undefined && (
                    <p className="text-[10px] text-bakery-200 truncate">
                      {toast.weightG >= 1000 ? `${toast.weightG / 1000}kg` : `${toast.weightG}g`} •{' '}
                      <span className="font-price font-medium text-amber-300">{formatINR(toast.price)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    dismissToast();
                    setIsCartOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 active:scale-95 min-h-[38px] cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>View Cart</span>
                </button>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="p-2 rounded-lg text-bakery-300 hover:text-white hover:bg-white/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="mt-0.5 shrink-0">
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                  {toast.type === 'info' && <LogOut className="w-5 h-5 text-amber-400" />}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  {toast.title && <h4 className="text-xs font-bold text-white leading-tight truncate">{toast.title}</h4>}
                  {toast.message && <p className="text-[11px] text-bakery-200 leading-snug break-words">{toast.message}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast();
                }}
                className="p-1.5 rounded-lg text-bakery-300 hover:text-white hover:bg-white/10 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 cursor-pointer self-start"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
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
