'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Bell, X, Sparkles, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  mobile: string;
  totalAmount: number;
  createdAt: string;
  status: string;
}

interface ToastAlert {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  time: string;
}

export default function AdminSoundAlert() {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef(false);

  // Initialize Mute Preference & Audio Instance
  useEffect(() => {
    // Check saved mute preference
    const savedMute = localStorage.getItem('admin_sound_muted');
    if (savedMute === 'true') {
      setIsMuted(true);
    }

    // Initialize HTML5 Audio object
    audioRef.current = new Audio('/sounds/new-order-alert.wav');
    audioRef.current.preload = 'auto';

    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Unlock Audio on First User Interaction
  const unlockAudioContext = useCallback(() => {
    if (!audioRef.current) return;

    // Silent play test to unlock browser autoplay restriction
    audioRef.current.volume = 0.01;
    const promise = audioRef.current.play();

    if (promise !== undefined) {
      promise
        .then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1.0;
          }
          setIsAudioUnlocked(true);
          setShowUnlockBanner(false);
        })
        .catch(() => {
          setShowUnlockBanner(true);
        });
    }
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isAudioUnlocked) {
        unlockAudioContext();
      }
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

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const nextState = !prev;
      localStorage.setItem('admin_sound_muted', nextState ? 'true' : 'false');
      return nextState;
    });
  };

  // Play Sound for EXACTLY 4.0 Seconds
  const playAlertSound = useCallback(() => {
    if (isMuted) return;

    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/new-order-alert.wav');
    }

    const audio = audioRef.current;
    audio.volume = 1.0;
    audio.loop = true; // Loops audio clip continuously during 4.0-second alert window

    // Clear any existing stop timer if a previous order alert was running
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    audio.currentTime = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsAudioUnlocked(true);
          setShowUnlockBanner(false);

          // PROGRAMMATIC 4-SECOND CUTOFF
          stopTimerRef.current = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            stopTimerRef.current = null;
          }, 4000);
        })
        .catch(err => {
          console.warn('[Admin Sound Alert] Autoplay blocked until user interaction', err);
          setShowUnlockBanner(true);
        });
    }
  }, [isMuted]);

  // Handle New Order Trigger
  const triggerNewOrderNotification = useCallback((order: OrderItem) => {
    // 1. Play 4-second audio alert
    playAlertSound();

    // 2. Add visual toast notification
    const toast: ToastAlert = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveToasts(prev => [toast, ...prev.slice(0, 3)]);

    // Auto-remove toast after 7 seconds
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== order.id));
    }, 7000);

    // 3. Dispatch global window event for live Order page updates
    window.dispatchEvent(new CustomEvent('new-order-received', { detail: order }));
  }, [playAlertSound]);

  // Polling Engine (Checks every 5 seconds)
  useEffect(() => {
    const checkForNewOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) return;

        const data = await res.json();
        if (!data || !Array.isArray(data.orders)) return;

        const fetchedOrders: OrderItem[] = data.orders;

        // INITIAL LOAD: Populate known order IDs without playing sound
        if (!initialFetchDoneRef.current) {
          fetchedOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
          initialFetchDoneRef.current = true;
          return;
        }

        // SUBSEQUENT POLLS: Find new orders that arrived after session start
        const newlyArrivedOrders = fetchedOrders.filter(
          o => !knownOrderIdsRef.current.has(o.id)
        );

        if (newlyArrivedOrders.length > 0) {
          newlyArrivedOrders.forEach(order => {
            knownOrderIdsRef.current.add(order.id);
            triggerNewOrderNotification(order);
          });
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    };

    // Initial check
    checkForNewOrders();

    // Poll every 5000ms (5s)
    const interval = setInterval(checkForNewOrders, 5000);

    return () => clearInterval(interval);
  }, [triggerNewOrderNotification]);

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {/* Mute/Unmute Header Toggle Button */}
      <button
        type="button"
        onClick={toggleMute}
        title={isMuted ? 'Sound alerts are MUTED. Click to unmute.' : 'Sound alerts are ON (4s chime active). Click to mute.'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-tight transition-all cursor-pointer shrink-0 border whitespace-nowrap ${
          isMuted
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
        }`}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="whitespace-nowrap">Muted</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="whitespace-nowrap">Sound ON</span>
          </>
        )}
      </button>


      {/* Autoplay Unlock Banner */}
      {showUnlockBanner && !isAudioUnlocked && (
        <div
          onClick={unlockAudioContext}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-amber-500 transition-all border border-amber-400 animate-bounce"
        >
          <Bell className="w-4 h-4 text-amber-200" />
          <span>Click anywhere to enable 4-second order sound alerts!</span>
          <X className="w-3.5 h-3.5 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); setShowUnlockBanner(false); }} />
        </div>
      )}

      {/* Floating Toast Alerts (Top Right) */}
      <div className="fixed top-16 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {activeToasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-gradient-to-r from-amber-950 via-[#2C1A14] to-black text-white p-4 rounded-2xl border-2 border-amber-500 shadow-2xl flex items-start justify-between gap-3 animate-slideInRight"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShoppingBag className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full">
                    NEW ORDER RECEIVED
                  </span>
                  <span className="text-[10px] text-gray-400">{toast.time}</span>
                </div>
                <h4 className="font-serif text-sm font-bold text-amber-100">
                  {toast.orderNumber} — {toast.customerName}
                </h4>
                <p className="text-xs text-amber-300/90 font-bold">
                  Total Amount: ₹{toast.totalAmount}
                </p>
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
