'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  mobile: string;
  deliveryCity?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  cakeMessage?: string;
  notes?: string;
  totalAmount: number;
  discountAmount?: number;
  pointsRedeemed?: number;
  pointsDiscountAmount?: number;
  pointsEarned?: number;
  pointsCredited?: boolean;
  status: string; // 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'
  consumerStatus?: string; // 'received' | 'processing' | 'baking' | 'packed' | 'dispatched' | 'delivered' | 'cancelled'
  createdAt: string;
  items: any;
}

export interface ToastAlert {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  time: string;
}

interface AdminOrderContextType {
  orders: OrderItem[];
  newOrdersCount: number;
  statusCounts: Record<string, number>;
  totalRevenue: number;
  isLoading: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  isAudioUnlocked: boolean;
  showUnlockBanner: boolean;
  unlockAudioContext: () => void;
  dismissUnlockBanner: () => void;
  activeToasts: ToastAlert[];
  dismissToast: (id: string) => void;
  highlightedOrderId: string | null;
  fetchOrders: (showSkeleton?: boolean, from?: string, to?: string, status?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<boolean>;
  updateConsumerStatus: (orderId: string, newConsumerStatus: string) => Promise<boolean>;
  deleteSingleOrder: (orderId: string) => Promise<boolean>;
  deleteBulkOrders: (orderIds: string[]) => Promise<boolean>;
}

const AdminOrderContext = createContext<AdminOrderContextType | undefined>(undefined);

export function AdminOrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState<boolean>(false);
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef<boolean>(false);

  // Initialize Mute Preference & Audio Object
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMute = localStorage.getItem('admin_sound_muted');
    if (savedMute === 'true') {
      setIsMuted(true);
    }

    // Initialize HTML5 Audio object once
    const audio = new Audio('/sounds/new-order-alert.wav');
    audio.preload = 'auto';
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  // Compute status counts dynamically from orders state
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      new: 0,
      contacted: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach(o => {
      const st = (o.status || 'new').toLowerCase();
      if (counts[st] !== undefined) {
        counts[st] += 1;
      }
    });
    return counts;
  }, [orders]);

  const newOrdersCount = statusCounts.new || 0;

  // Manage Continuous Audio Loop State
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Stop audio immediately if muted or if there are NO new unacknowledged orders
    if (isMuted || newOrdersCount === 0) {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }

    // Play continuously if there are new unacknowledged orders and sound is enabled
    if (newOrdersCount > 0 && !isMuted) {
      audio.loop = true;
      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsAudioUnlocked(true);
              setShowUnlockBanner(false);
            })
            .catch(err => {
              console.warn('[Admin Audio] Autoplay blocked until user interaction', err);
              setShowUnlockBanner(true);
            });
        }
      }
    }
  }, [newOrdersCount, isMuted]);

  // Unlock Audio Context on first user interaction
  const unlockAudioContext = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    audio.volume = 1.0;
    audio.loop = true;

    // If new orders exist, play immediately; otherwise play a tiny silent snippet to unlock
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsAudioUnlocked(true);
          setShowUnlockBanner(false);
          if (newOrdersCount === 0 || isMuted) {
            audio.pause();
            audio.currentTime = 0;
          }
        })
        .catch(() => {
          setShowUnlockBanner(true);
        });
    }
  }, [newOrdersCount, isMuted]);

  useEffect(() => {
    if (isAudioUnlocked) return;

    const handleUserInteraction = () => {
      unlockAudioContext();
    };

    window.addEventListener('click', handleUserInteraction, { capture: true, once: true });
    window.addEventListener('keydown', handleUserInteraction, { capture: true, once: true });
    window.addEventListener('touchstart', handleUserInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction, { capture: true });
      window.removeEventListener('keydown', handleUserInteraction, { capture: true });
      window.removeEventListener('touchstart', handleUserInteraction, { capture: true });
    };
  }, [isAudioUnlocked, unlockAudioContext]);

  // Toggle Mute State
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const nextState = !prev;
      localStorage.setItem('admin_sound_muted', nextState ? 'true' : 'false');

      if (nextState && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return nextState;
    });
  }, []);

  const dismissUnlockBanner = useCallback(() => {
    setShowUnlockBanner(false);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Trigger notification toast & event for newly detected order
  const triggerNewOrderNotification = useCallback((order: OrderItem) => {
    const toast: ToastAlert = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveToasts(prev => [toast, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== order.id));
    }, 8000);

    setHighlightedOrderId(order.id);
    setTimeout(() => setHighlightedOrderId(null), 6000);

    window.dispatchEvent(new CustomEvent('new-order-received', { detail: order }));
  }, []);

  // Central Order Fetcher & Poller
  const fetchOrders = useCallback(async (
    showSkeleton: boolean = false,
    from?: string,
    to?: string,
    status?: string
  ) => {
    if (showSkeleton) setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (status && status !== 'All' && status !== 'all') params.set('status', status);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/orders${queryStr}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        const fetchedOrders: OrderItem[] = data.orders;

        // INITIAL LOAD: Populate known IDs without triggering alerts
        if (!initialFetchDoneRef.current) {
          fetchedOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
          initialFetchDoneRef.current = true;
        } else {
          // SUBSEQUENT POLLS: Check for brand new orders
          const newlyArrivedOrders = fetchedOrders.filter(
            o => !knownOrderIdsRef.current.has(o.id)
          );

          if (newlyArrivedOrders.length > 0) {
            newlyArrivedOrders.forEach(order => {
              knownOrderIdsRef.current.add(order.id);
              triggerNewOrderNotification(order);
            });
          }
        }

        setOrders(fetchedOrders);
        setTotalRevenue(data.totalRevenue || 0);
      }
    } catch (e) {
      // Silently ignore polling errors
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  }, [triggerNewOrderNotification]);

  // Initial Fetch & 5s Polling Engine
  useEffect(() => {
    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Update Internal Order Status (PATCH)
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(prev => {
          const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
          return updated;
        });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  // Update Consumer Facing Order Status (PATCH)
  const updateConsumerStatus = useCallback(async (orderId: string, newConsumerStatus: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consumerStatus: newConsumerStatus }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, consumerStatus: newConsumerStatus } : o));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  // Delete Single Order
  const deleteSingleOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  // Delete Bulk Orders
  const deleteBulkOrders = useCallback(async (orderIds: string[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds }),
      });

      if (res.ok) {
        setOrders(prev => prev.filter(o => !orderIds.includes(o.id)));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  return (
    <AdminOrderContext.Provider
      value={{
        orders,
        newOrdersCount,
        statusCounts,
        totalRevenue,
        isLoading,
        isMuted,
        toggleMute,
        isAudioUnlocked,
        showUnlockBanner,
        unlockAudioContext,
        dismissUnlockBanner,
        activeToasts,
        dismissToast,
        highlightedOrderId,
        fetchOrders,
        updateOrderStatus,
        updateConsumerStatus,
        deleteSingleOrder,
        deleteBulkOrders,
      }}
    >
      {children}
    </AdminOrderContext.Provider>
  );
}

export function useAdminOrders() {
  const context = useContext(AdminOrderContext);
  if (!context) {
    throw new Error('useAdminOrders must be used within an AdminOrderProvider');
  }
  return context;
}
