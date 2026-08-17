'use client';

import React from 'react';
import { Volume2, VolumeX, Bell, X, ShoppingBag } from 'lucide-react';
import { useAdminOrders } from '@/context/AdminOrderContext';

export default function AdminSoundAlert() {
  const {
    isMuted,
    toggleMute,
    isAudioUnlocked,
    showUnlockBanner,
    unlockAudioContext,
    dismissUnlockBanner,
    activeToasts,
    dismissToast,
    newOrdersCount,
  } = useAdminOrders();

  return (
    <>
      {/* Mute/Unmute Header Toggle Button */}
      <button
        type="button"
        onClick={toggleMute}
        title={
          isMuted
            ? 'Sound alerts are MUTED. Click to unmute continuous alert.'
            : newOrdersCount > 0
            ? 'Sound alert is LOOPING for new order(s). Click to mute.'
            : 'Sound alert active. Click to mute.'
        }
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-tight transition-all cursor-pointer shrink-0 border whitespace-nowrap ${
          isMuted
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
            : newOrdersCount > 0
            ? 'bg-amber-500 text-white border-amber-400 animate-pulse shadow-md'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
        }`}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="whitespace-nowrap">Muted</span>
          </>
        ) : newOrdersCount > 0 ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
            <span className="whitespace-nowrap">Alert Looping ({newOrdersCount})</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
          <span>Click anywhere to enable continuous order sound alerts!</span>
          <X
            className="w-3.5 h-3.5 text-white/80 hover:text-white"
            onClick={e => {
              e.stopPropagation();
              dismissUnlockBanner();
            }}
          />
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
