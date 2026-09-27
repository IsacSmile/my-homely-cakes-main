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
  testAlarmSound: () => void;
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

// Web Audio API: Multi-tone harmonic chime (used as instant synthesized sound or fallback)
function createWebAudioChime(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;
    // Harmonic bell sequence: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1568Hz) -> C7 (2093Hz)
    const notes = [
      { freq: 1046.5, start: 0, duration: 0.25, gain: 0.5 },
      { freq: 1318.5, start: 0.1, duration: 0.35, gain: 0.6 },
      { freq: 1568.0, start: 0.22, duration: 0.5, gain: 0.7 },
      { freq: 2093.0, start: 0.35, duration: 0.8, gain: 0.8 },
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0.0001, now + note.start);
      gain.gain.linearRampToValueAtTime(note.gain, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    });
  } catch (err) {
    console.warn('[Admin Sound] Web Audio chime generation warning:', err);
  }
}

// Play decoded AudioBuffer through AudioContext
function playAudioBuffer(ctx: AudioContext, buffer: AudioBuffer) {
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  } catch (err) {
    console.warn('[Admin Sound] Buffer playback fallback to synthesizer:', err);
    createWebAudioChime(ctx);
  }
}

export function AdminOrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [globalUnacknowledgedCount, setGlobalUnacknowledgedCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState<boolean>(false);
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef<boolean>(false);
  const activeFiltersRef = useRef<{ from?: string; to?: string; status?: string }>({});

  // Lazily get or create persistent Web Audio AudioContext
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    return audioContextRef.current;
  }, []);

  // Pre-load and decode /sounds/new-order-alert.wav into AudioBuffer
  const loadAudioBuffer = useCallback(async () => {
    if (audioBufferRef.current || typeof window === 'undefined') return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const res = await fetch('/sounds/new-order-alert.wav');
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        audioBufferRef.current = decoded;
      }
    } catch (e) {
      console.warn('[Admin Sound] WAV file pre-decoding notice (will use synthesized chime fallback):', e);
    }
  }, [getAudioContext]);

  // Initialize Sound System & Mute preference on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMute = localStorage.getItem('admin_sound_muted');
    if (savedMute === 'true') {
      setIsMuted(true);
      isMutedRef.current = true;
    }

    // Secondary HTML5 Audio fallback element
    try {
      const audio = new Audio('/sounds/new-order-alert.wav');
      audio.preload = 'auto';
      htmlAudioRef.current = audio;
    } catch (_) {}

    // Preload buffer
    loadAudioBuffer();

    return () => {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        htmlAudioRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
    };
  }, [loadAudioBuffer]);

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

  // Unacknowledged count takes the maximum of local order state and global DB count
  const newOrdersCount = Math.max(statusCounts.new || 0, globalUnacknowledgedCount);

  // Play a single instance of the alarm chime/sound
  const playAlarmOnce = useCallback(() => {
    if (isMutedRef.current) return;

    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setIsAudioUnlocked(true);
          setShowUnlockBanner(false);
          if (audioBufferRef.current) {
            playAudioBuffer(ctx, audioBufferRef.current);
          } else {
            createWebAudioChime(ctx);
          }
        }).catch(err => {
          console.warn('[Admin Sound] AudioContext autoplay blocked:', err);
          setShowUnlockBanner(true);
        });
        return;
      }

      if (ctx.state === 'running') {
        setIsAudioUnlocked(true);
        setShowUnlockBanner(false);
        if (audioBufferRef.current) {
          playAudioBuffer(ctx, audioBufferRef.current);
        } else {
          createWebAudioChime(ctx);
        }
        return;
      }
    }

    // Fallback: HTML5 Audio
    if (htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = 0;
      htmlAudioRef.current.play().then(() => {
        setIsAudioUnlocked(true);
        setShowUnlockBanner(false);
      }).catch(err => {
        console.warn('[Admin Sound] HTML5 Audio autoplay restricted:', err);
        setShowUnlockBanner(true);
      });
    }
  }, [getAudioContext]);

  // Continuous alarm loop when unacknowledged new orders are active
  useEffect(() => {
    if (isMuted || newOrdersCount === 0) {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      return;
    }

    // Play immediately on detecting new orders
    playAlarmOnce();

    // Repeat alarm chime every 3.8 seconds until acknowledged or muted
    if (!loopTimerRef.current) {
      loopTimerRef.current = setInterval(() => {
        playAlarmOnce();
      }, 3800);
    }

    return () => {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    };
  }, [newOrdersCount, isMuted, playAlarmOnce]);

  // Unlock audio context on user interaction
  const unlockAudioContext = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        setIsAudioUnlocked(true);
        setShowUnlockBanner(false);
      }).catch(() => {});
    } else {
      setIsAudioUnlocked(true);
      setShowUnlockBanner(false);
    }

    loadAudioBuffer();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [getAudioContext, loadAudioBuffer]);

  // Test alarm sound trigger (for verifying speakers & volume)
  const testAlarmSound = useCallback(() => {
    if (isMutedRef.current) {
      setIsMuted(false);
      isMutedRef.current = false;
      localStorage.setItem('admin_sound_muted', 'false');
    }

    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        setIsAudioUnlocked(true);
        setShowUnlockBanner(false);
        if (audioBufferRef.current) {
          playAudioBuffer(ctx, audioBufferRef.current);
        } else {
          createWebAudioChime(ctx);
        }
      }).catch(() => {
        setShowUnlockBanner(true);
      });
    } else if (ctx && ctx.state === 'running') {
      setIsAudioUnlocked(true);
      setShowUnlockBanner(false);
      if (audioBufferRef.current) {
        playAudioBuffer(ctx, audioBufferRef.current);
      } else {
        createWebAudioChime(ctx);
      }
    } else if (htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = 0;
      htmlAudioRef.current.play().catch(() => {});
    }
  }, [getAudioContext]);

  // Global user interaction listener to proactively resume AudioContext & request notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUserInteraction = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setIsAudioUnlocked(true);
          setShowUnlockBanner(false);
        }).catch(() => {});
      } else if (ctx && ctx.state === 'running') {
        setIsAudioUnlocked(true);
        setShowUnlockBanner(false);
      }

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    };

    window.addEventListener('click', handleUserInteraction, { capture: true });
    window.addEventListener('keydown', handleUserInteraction, { capture: true });
    window.addEventListener('touchstart', handleUserInteraction, { capture: true });
    window.addEventListener('pointerdown', handleUserInteraction, { capture: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction, { capture: true });
      window.removeEventListener('keydown', handleUserInteraction, { capture: true });
      window.removeEventListener('touchstart', handleUserInteraction, { capture: true });
      window.removeEventListener('pointerdown', handleUserInteraction, { capture: true });
    };
  }, [getAudioContext]);

  // Toggle Mute State
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const nextState = !prev;
      isMutedRef.current = nextState;
      localStorage.setItem('admin_sound_muted', nextState ? 'true' : 'false');

      if (nextState && loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
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

  // Trigger notification toast, system push, & instant sound for newly arrived order
  const triggerNewOrderNotification = useCallback((order: OrderItem) => {
    // 1. Immediately sound alarm
    playAlarmOnce();

    // 2. Add floating visual toast
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
    }, 10000);

    setHighlightedOrderId(order.id);
    setTimeout(() => setHighlightedOrderId(null), 8000);

    // 3. Desktop Notification for background tabs
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`🎂 New Order Received! ${order.orderNumber}`, {
          body: `${order.customerName} placed an order for ₹${order.totalAmount}. Click to view.`,
          icon: '/logo.png',
          tag: order.id,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (_) {}
    }

    window.dispatchEvent(new CustomEvent('new-order-received', { detail: order }));
  }, [playAlarmOnce]);

  // Central Order Fetcher & Poller
  const fetchOrders = useCallback(async (
    showSkeleton: boolean = false,
    from?: string,
    to?: string,
    status?: string
  ) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin-manage') {
      if (showSkeleton) setIsLoading(false);
      return;
    }

    if (showSkeleton) setIsLoading(true);

    if (from !== undefined || to !== undefined || status !== undefined) {
      activeFiltersRef.current = { from, to, status };
    }

    const curFrom = from !== undefined ? from : activeFiltersRef.current.from;
    const curTo = to !== undefined ? to : activeFiltersRef.current.to;
    const curStatus = status !== undefined ? status : activeFiltersRef.current.status;

    try {
      const params = new URLSearchParams();
      if (curFrom) params.set('from', curFrom);
      if (curTo) params.set('to', curTo);
      if (curStatus && curStatus !== 'All' && curStatus !== 'all') params.set('status', curStatus);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/orders${queryStr}`);
      if (res.status === 401) {
        if (showSkeleton) setIsLoading(false);
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        const fetchedOrders: OrderItem[] = data.orders;

        if (typeof data.unacknowledgedNewCount === 'number') {
          setGlobalUnacknowledgedCount(data.unacknowledgedNewCount);
        }

        // INITIAL LOAD: Populate known IDs
        if (!initialFetchDoneRef.current) {
          fetchedOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
          initialFetchDoneRef.current = true;
        } else {
          // SUBSEQUENT POLLS: Detect brand new orders
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
      // Silently handle polling errors
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  }, [triggerNewOrderNotification]);

  // Initial Fetch & 5s Polling Engine
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin-manage') {
      setIsLoading(false);
      return;
    }

    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Page visibility change: immediately poll when user returns to tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        fetchOrders(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [getAudioContext, fetchOrders]);

  // Update Internal Order Status (PATCH)
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (newStatus !== 'new') {
          setGlobalUnacknowledgedCount(prev => Math.max(0, prev - 1));
        }
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
        testAlarmSound,
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
    return {
      orders: [],
      newOrdersCount: 0,
      statusCounts: {},
      totalRevenue: 0,
      isLoading: false,
      isMuted: false,
      toggleMute: () => {},
      isAudioUnlocked: false,
      showUnlockBanner: false,
      unlockAudioContext: () => {},
      dismissUnlockBanner: () => {},
      testAlarmSound: () => {},
      activeToasts: [],
      dismissToast: () => {},
      highlightedOrderId: null,
      fetchOrders: async () => {},
      updateOrderStatus: async () => false,
      updateConsumerStatus: async () => false,
      deleteSingleOrder: async () => false,
      deleteBulkOrders: async () => false,
    };
  }
  return context;
}
