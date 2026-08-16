'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X, ShoppingBag, Zap, CheckCircle2, Scale, Sparkles,
  ChevronLeft, ChevronRight, Minus, Plus, MapPin,
  Calendar, Clock, MessageSquare, User, Phone, MapPinned,
  ChevronDown, AlertCircle, Lock, Package, CreditCard, PhoneCall, ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { parseProductVariants, getDefaultVariant, getVariantPrice, formatINR, WeightVariant } from '@/lib/pricing';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSession } from 'next-auth/react';
import { handleGoogleSignIn } from '@/lib/auth-toast';
import { useScrollLock } from '@/hooks/useScrollLock';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker, formatDisplay12 } from '@/components/ui/TimePicker';

// ---------- IST Helpers ----------
function getNowIST(): Date {
  // Returns a Date object representing current IST (UTC+5:30)
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000);
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTimeHHMM(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function formatDisplayDate(dateStr: string): string {
  const today = formatDateISO(getNowIST());
  const tomorrow = formatDateISO(addMinutes(getNowIST(), 1440));
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDisplayTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ---------- Validation ----------
function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+]/g, '');
  const digits = clean.replace(/^91/, '');
  return /^\d{10}$/.test(digits);
}

// ---------- Section Divider ----------
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="text-amber-700">{icon}</div>
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-bakery-600">{label}</span>
      <div className="flex-1 h-px bg-bakery-100" />
    </div>
  );
}

export default function ProductDetailModal() {
  const { selectedModalProduct, closeProductModal, addToCart } = useCart();
  const { data: session, status } = useSession();

  // Product state
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [qty, setQty] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Mobile swipe gesture state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 35;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (photosCount: number) => {
    if (!touchStartX || !touchEndX || photosCount <= 1) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveImageIndex((prev) => (prev === photosCount - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setActiveImageIndex((prev) => (prev === 0 ? photosCount - 1 : prev - 1));
    }
  };

  // Delivery state
  const [cities, setCities] = useState<{ id: string; name: string }[]>([
    { id: 'city_trivandrum', name: 'Trivandrum' }
  ]);
  const [selectedCity, setSelectedCity] = useState<string>('Trivandrum');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('');

  // Cake details
  const [cakeMessage, setCakeMessage] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Contact
  const [customerName, setCustomerName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  // UX State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);

  // Loyalty Points State
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);

  // Fetch user points when logged in
  useEffect(() => {
    if (session?.user) {
      fetch('/api/customer/points')
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.pointsBalance === 'number') {
            setUserPoints(data.pointsBalance);
          }
        })
        .catch(() => {});
    } else {
      setUserPoints(0);
      setRedeemPoints(false);
    }
  }, [session]);

  // Set defaults when modal opens
  useEffect(() => {
    if (!selectedModalProduct) return;

    const defVariant = getDefaultVariant(selectedModalProduct);
    setSelectedWeight(defVariant.weightG);
    setQty(1);
    setActiveImageIndex(0);
    setIsImageLoading(true);
    setOrderSuccess(null);
    setErrors({});
    setShowSummary(false);
    setCakeMessage('');
    setSpecialNotes('');
    setCustomerName(session?.user?.name || '');
    setMobile('');
    setRedeemPoints(false);

    // Default delivery = now IST + 30 min
    const nowIST = getNowIST();
    const defaultDelivery = addMinutes(nowIST, 30);
    setDeliveryDate(formatDateISO(defaultDelivery));
    setDeliveryTime(formatTimeHHMM(defaultDelivery));
  }, [selectedModalProduct, session?.user?.name]);

  // Reset image loading spinner when active photo changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [activeImageIndex]);

  // Load additional cities in background without blocking mount
  useEffect(() => {
    if (!selectedModalProduct) return;
    fetch('/api/cities')
      .then(r => r.json())
      .then(data => {
        if (data.cities && data.cities.length > 0) {
          setCities(data.cities);
        }
      })
      .catch(() => {});
  }, [selectedModalProduct]);

  // Gallery photos list setup
  let galleryPhotos: string[] = [selectedModalProduct?.imageUrl];
  try {
    if (selectedModalProduct?.images) {
      const parsed = typeof selectedModalProduct.images === 'string'
        ? JSON.parse(selectedModalProduct.images)
        : selectedModalProduct.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        galleryPhotos = parsed.filter((url: string) => typeof url === 'string' && url.trim().length > 0);
      }
    }
  } catch {
    galleryPhotos = [selectedModalProduct?.imageUrl];
  }
  if (!galleryPhotos || galleryPhotos.length === 0) {
    galleryPhotos = [selectedModalProduct?.imageUrl || '/cake-placeholder.svg'];
  }

  // Keyboard Navigation: Escape to close modal, Left/Right arrows to switch photos
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeProductModal();
    } else if (e.key === 'ArrowLeft') {
      setActiveImageIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveImageIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1));
    }
  }, [closeProductModal, galleryPhotos.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll & touch-drag when modal open
  useScrollLock(!!selectedModalProduct);

  if (!selectedModalProduct) return null;

  const variantsList: WeightVariant[] = parseProductVariants(selectedModalProduct);
  const unitPrice = getVariantPrice(selectedModalProduct, selectedWeight);
  const totalPrice = unitPrice * qty;
  
  // Points Redemption Calculation
  const maxRedeemablePoints = Math.floor(userPoints / 100) * 100;
  const potentialPointsDiscount = Math.floor(maxRedeemablePoints / 100) * 50;
  const pointsDiscountAmount = (redeemPoints && maxRedeemablePoints >= 100)
    ? Math.min(potentialPointsDiscount, Math.floor(totalPrice / 50) * 50)
    : 0;
  const finalPayablePrice = Math.max(0, totalPrice - pointsDiscountAmount);

  const activePhotoUrl = galleryPhotos[activeImageIndex] || galleryPhotos[0];
  const todayStr = formatDateISO(getNowIST());

  // Validate delivery time not in past when date is today
  const minTime = deliveryDate === todayStr ? formatTimeHHMM(addMinutes(getNowIST(), 10)) : undefined;

  // Front-end validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedCity) newErrors.city = 'Please select a delivery city.';
    if (!deliveryDate) newErrors.deliveryDate = 'Please select a delivery date.';
    if (!deliveryTime) newErrors.deliveryTime = 'Please select a delivery time.';
    if (deliveryDate === todayStr && minTime && deliveryTime < minTime) {
      newErrors.deliveryTime = 'Delivery time must be at least 10 minutes from now.';
    }
    if (!customerName.trim()) newErrors.customerName = 'Please enter your name.';
    if (!mobile.trim()) {
      newErrors.mobile = 'Please enter your mobile number.';
    } else if (!validatePhone(mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit Indian mobile number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobile: mobile.trim(),
          deliveryCity: selectedCity,
          deliveryDate,
          deliveryTime,
          cakeMessage: cakeMessage.trim() || null,
          notes: specialNotes.trim() || null,
          pointsToRedeem: redeemPoints ? maxRedeemablePoints : 0,
          items: [{
            productId: selectedModalProduct.id,
            name: selectedModalProduct.name,
            weightG: selectedWeight,
            qty,
            calculatedPrice: unitPrice,
          }],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data);
      } else {
        const msg = data.error || 'Failed to place order. Please try again.';
        alert(msg);
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedModalProduct, selectedWeight, qty, cakeMessage, specialNotes);
    closeProductModal();
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c; });
  };

  const inputCls = (field: string) =>
    `w-full bg-bakery-50 border rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none transition-colors ${
      errors[field]
        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
        : 'border-bakery-200 focus:border-amber-600'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn max-w-full overflow-x-hidden p-0 sm:p-4 touch-none"
      onClick={(e) => { if (e.target === e.currentTarget) closeProductModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${selectedModalProduct.name}`}
    >
      <div className={`bg-white w-full ${orderSuccess ? 'max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-8 rounded-3xl border border-bakery-200/60' : 'max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] md:h-[640px] lg:h-[680px] rounded-none sm:rounded-3xl overflow-hidden'} shadow-2xl flex flex-col ${orderSuccess ? '' : 'md:flex-row'} relative animate-scaleIn touch-auto`}>

        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className={`absolute top-3.5 right-3.5 z-40 p-2 rounded-full transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
            orderSuccess 
              ? 'bg-bakery-100/80 hover:bg-bakery-200 text-bakery-chocolate border border-bakery-200/60 shadow-2xs'
              : 'bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-md'
          }`}
          aria-label="Close order modal"
        >
          <X className="w-4 h-4" />
        </button>

        {orderSuccess ? (
          /* ─── ORDER CONFIRMED SUCCESS MODAL ─── */
          <div className="w-full flex flex-col items-center text-center space-y-5 py-1">
            {/* Refined Checkmark Badge */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100/70 text-amber-800 flex items-center justify-center border border-amber-300/60 shadow-2xs mx-auto shrink-0 mt-1">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-amber-700 stroke-[1.75]" />
            </div>

            {/* Typography */}
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-bakery-chocolate tracking-tight">Order Confirmed!</h2>
              <p className="text-xs sm:text-sm text-bakery-600 font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                Your homemade cake is being prepared with care and love.
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-bakery-50/70 border border-bakery-200/80 rounded-2xl p-4 sm:p-5 w-full text-left space-y-3 shadow-2xs">
              <div className="flex justify-between items-center border-b border-bakery-200/60 pb-2.5">
                <span className="text-[11px] font-bold text-bakery-600 uppercase tracking-wider">Order Reference</span>
                <span className="font-mono font-bold text-amber-900 text-xs sm:text-sm bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200/90">
                  #{orderSuccess.orderNumber}
                </span>
              </div>
              <div className="text-xs space-y-2 text-bakery-800">
                <div className="flex justify-between items-center"><span className="text-bakery-500 font-medium">Cake</span><span className="font-semibold text-bakery-chocolate text-right truncate max-w-[60%]">{selectedModalProduct.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-bakery-500 font-medium">Weight</span><span className="font-semibold text-bakery-chocolate">{selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}</span></div>
                <div className="flex justify-between items-center"><span className="text-bakery-500 font-medium">Quantity</span><span className="font-semibold text-bakery-chocolate">{qty}</span></div>
                <div className="flex justify-between items-center"><span className="text-bakery-500 font-medium">City</span><span className="font-semibold text-bakery-chocolate">{orderSuccess.deliveryCity || selectedCity}</span></div>
                {orderSuccess.deliveryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-bakery-500 font-medium">Delivery</span>
                    <span className="font-semibold text-bakery-chocolate text-right">{formatDisplayDate(orderSuccess.deliveryDate)} • {formatDisplayTime(orderSuccess.deliveryTime)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-bakery-200/80 pt-2.5 mt-1">
                  <span className="font-bold text-bakery-chocolate text-xs">Total Amount</span>
                  <span className="font-price font-bold text-amber-800 text-base sm:text-lg">{formatINR(orderSuccess.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Loyalty Points Earned Card */}
            {typeof orderSuccess.estimatedPointsEarned === 'number' && orderSuccess.estimatedPointsEarned > 0 && (
              <div className="bg-gradient-to-r from-amber-900 via-amber-900 to-amber-950 text-white p-3.5 sm:p-4 rounded-2xl border border-amber-700/60 text-left w-full space-y-1.5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>+{orderSuccess.estimatedPointsEarned} Points Pending Delivery</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  You will earn <strong>{orderSuccess.estimatedPointsEarned} points</strong> on this order. Points will be automatically credited to your balance when marked <strong>Delivered</strong>.
                </p>
              </div>
            )}

            {/* What Happens Next Box (Minimal Line Icons) */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 text-left w-full space-y-2.5">
              <h4 className="font-bold text-bakery-chocolate text-xs uppercase tracking-wider">What happens next?</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-[11px] sm:text-xs text-bakery-800">
                  <PhoneCall className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Our Trivandrum baker will call <strong className="text-bakery-900">{mobile || 'you'}</strong> within 15–30 mins to confirm details.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[11px] sm:text-xs text-bakery-800">
                  <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>No prepayment required. Pay via UPI (GPay/PhonePe) or Cash upon delivery.</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
              <a
                href="/orders"
                onClick={closeProductModal}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-soft transition-all min-h-[44px] flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Track Order & Points</span>
              </a>
              <button
                type="button"
                onClick={closeProductModal}
                className="flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold text-xs py-3 px-4 rounded-xl transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue Browsing</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ─── DESKTOP IMAGE GALLERY (Full-Bleed Edge-to-Edge) ─── */}
            <div
              className="hidden md:block w-full md:w-5/12 lg:w-1/2 relative shrink-0 bg-bakery-100 overflow-hidden self-stretch group"
              role="region"
              aria-roledescription="carousel"
              aria-label={`${selectedModalProduct.name} image gallery`}
            >
              {/* Skeleton Loading Placeholder */}
              {isImageLoading && (
                <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />
              )}

              {/* Main Full-Bleed Desktop Image */}
              <Image
                key={activeImageIndex}
                src={activePhotoUrl}
                alt={`${selectedModalProduct.name} - View ${activeImageIndex + 1} of ${galleryPhotos.length}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoadingComplete={() => setIsImageLoading(false)}
                priority
              />

              {/* Scrim Gradient Overlays for Contrast */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-10" />

              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="bg-black/50 text-amber-300 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  {selectedModalProduct.category}
                </span>
              </div>

              {/* Left/Right Glass Arrow Buttons */}
              {galleryPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(p => p === 0 ? galleryPhotos.length - 1 : p - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all active:scale-95 opacity-80 group-hover:opacity-100 z-20 cursor-pointer shadow-md border border-white/20"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(p => p === galleryPhotos.length - 1 ? 0 : p + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all active:scale-95 opacity-80 group-hover:opacity-100 z-20 cursor-pointer shadow-md border border-white/20"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Floating Glassmorphism Thumbnail Strip & Dots (Overlayed over full-bleed image) */}
              {galleryPhotos.length > 1 ? (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg max-w-[90%] overflow-x-auto">
                  {galleryPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md opacity-100'
                          : 'border-white/30 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <Image src={photo} alt={`${selectedModalProduct.name} thumbnail ${idx + 1}`} fill sizes="40px" className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* ─── RIGHT: ORDER FORM ─── */}
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Mobile / Small device swipeable image slider banner */}
              <div
                className="md:hidden relative h-64 sm:h-72 bg-neutral-900 shrink-0 overflow-hidden select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => onTouchEnd(galleryPhotos.length)}
                role="region"
                aria-roledescription="carousel"
                aria-label={`${selectedModalProduct.name} mobile image slider`}
              >
                {/* Skeleton Loading Placeholder */}
                {isImageLoading && (
                  <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />
                )}

                {/* Mobile Slide Image */}
                <Image
                  key={activeImageIndex}
                  src={activePhotoUrl}
                  alt={`${selectedModalProduct.name} - View ${activeImageIndex + 1} of ${galleryPhotos.length}`}
                  fill
                  sizes="100vw"
                  className={`object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoadingComplete={() => setIsImageLoading(false)}
                  priority
                />

                {/* Top & Bottom Gradient Scrim Overlays for High Contrast */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none z-10" />

                {/* Top Overlay: Category Badge */}
                <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 px-3 py-1.5 rounded-full border border-white/20 shadow-xs">
                    {selectedModalProduct.category}
                  </span>
                </div>

                {/* Mobile Navigation Arrows (Subtle & Accessible) */}
                {galleryPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Product Title Banner at Bottom Left */}
                <div className="absolute bottom-4 left-4 right-24 z-20 pointer-events-none">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md truncate">
                    {selectedModalProduct.name}
                  </h2>
                </div>

                {/* Centered Pagination Dots at Bottom */}
                {galleryPhotos.length > 1 && (
                  <div className="absolute bottom-3.5 right-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xs">
                    {galleryPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeImageIndex === idx ? 'w-5 bg-amber-400 shadow-xs' : 'w-2 bg-white/70 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Tappable Thumbnail Carousel Strip */}
              {galleryPhotos.length > 1 && (
                <div className="md:hidden bg-amber-950 p-2.5 flex items-center justify-center gap-3 overflow-x-auto border-b border-amber-900/40 shrink-0">
                  {galleryPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950 scale-105 shadow-md opacity-100'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Thumbnail photo ${idx + 1}`}
                    >
                      <Image src={photo} alt={`${selectedModalProduct.name} mobile thumbnail ${idx + 1}`} fill sizes="48px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Scrollable form area */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto overscroll-contain"
                noValidate
              >
                <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 pb-24 sm:pb-5">

                  {/* Heading — desktop only */}
                  <div className="hidden md:block">
                    <h2 className="font-serif text-xl font-bold text-bakery-chocolate leading-tight">{selectedModalProduct.name}</h2>
                    <p className="text-xs text-bakery-800/70 mt-1 line-clamp-2">{selectedModalProduct.description}</p>
                  </div>

                  {/* ── SECTION: Cake Details ── */}
                  <div className="space-y-3">
                    <SectionLabel icon={<Scale className="w-3.5 h-3.5" />} label="Cake Details" />

                    {/* Weight selector */}
                    <div>
                      <label className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                        Weight <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {variantsList.map((v: WeightVariant) => {
                          const label = v.weightG >= 1000 ? `${v.weightG / 1000} kg` : `${v.weightG} g`;
                          const isSelected = selectedWeight === v.weightG;
                          return (
                            <button
                              key={v.weightG}
                              type="button"
                              onClick={() => setSelectedWeight(v.weightG)}
                              className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 min-h-[44px] ${isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-soft scale-[1.02]'
                                : 'bg-bakery-50 text-bakery-chocolate border-bakery-200 hover:bg-bakery-100'
                              }`}
                            >
                              <span className="text-[11px] font-bold">{label}</span>
                              <span className={`font-price text-[10px] font-medium ${isSelected ? 'text-amber-100' : 'text-amber-800'}`}>
                                {formatINR(v.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                        Quantity <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-bakery-200 rounded-xl overflow-hidden bg-bakery-50">
                          <button
                            type="button"
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            className="px-3.5 py-2.5 text-bakery-chocolate hover:bg-bakery-100 active:bg-bakery-200 transition-colors disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Decrease quantity"
                            disabled={qty <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 py-2.5 text-sm font-extrabold text-bakery-chocolate select-none min-w-[2.5rem] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(q => q + 1)}
                            className="px-3.5 py-2.5 text-bakery-chocolate hover:bg-bakery-100 active:bg-bakery-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Live price */}
                        <div className="flex-1 bg-amber-50 border border-amber-200/60 rounded-xl px-3.5 py-2 flex items-center justify-between min-h-[44px]">
                          <span className="text-[10px] text-bakery-500 font-medium">
                            {qty > 1 ? `${qty} × ${formatINR(unitPrice)}` : `Price for ${selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}`}
                          </span>
                          <span className="font-price text-base sm:text-lg font-medium text-amber-800">{formatINR(totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION: Delivery ── */}
                  <div className="space-y-3">
                    <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} label="Delivery" />

                    {/* City */}
                    <div>
                      <label htmlFor="order-city" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                        Delivery City <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="order-city"
                          value={selectedCity}
                          onChange={e => { setSelectedCity(e.target.value); clearError('city'); }}
                          className={`w-full appearance-none ${inputCls('city')} pr-8 min-h-[44px]`}
                        >
                          {cities.length === 0 ? (
                            <option value="Trivandrum">Trivandrum</option>
                          ) : (
                            cities.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-bakery-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {errors.city && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city}</p>}
                    </div>

                    {/* Date + Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="order-date" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                          Date <span className="text-rose-500">*</span>
                        </label>
                        <DatePicker
                          id="order-date"
                          value={deliveryDate}
                          minDate={todayStr}
                          onChange={val => { setDeliveryDate(val); clearError('deliveryDate'); }}
                          error={errors.deliveryDate}
                        />
                        {deliveryDate && <p className="text-[10px] text-amber-800 font-medium mt-1" suppressHydrationWarning>{formatDisplayDate(deliveryDate)}</p>}
                        {errors.deliveryDate && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deliveryDate}</p>}
                      </div>

                      <div>
                        <label htmlFor="order-time" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                          Time <span className="text-rose-500">*</span>
                        </label>
                        <TimePicker
                          id="order-time"
                          value={deliveryTime}
                          onChange={val => { setDeliveryTime(val); clearError('deliveryTime'); }}
                          error={errors.deliveryTime}
                        />
                        {deliveryTime && <p className="text-[10px] text-amber-800 font-medium mt-1" suppressHydrationWarning>{formatDisplay12(deliveryTime)}</p>}
                        {errors.deliveryTime && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deliveryTime}</p>}
                      </div>
                    </div>
                    <p className="text-[10px] text-bakery-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      Default delivery is 30 minutes from now. You can change the date &amp; time above.
                    </p>
                  </div>

                  {/* ── SECTION: Cake Message ── */}
                  <div className="space-y-3">
                    <SectionLabel icon={<MessageSquare className="w-3.5 h-3.5" />} label="Message on Cake" />
                    <textarea
                      rows={2}
                      value={cakeMessage}
                      onChange={e => setCakeMessage(e.target.value)}
                      placeholder='e.g. "Happy Birthday Sarah!"'
                      className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600 resize-none"
                    />
                    <textarea
                      rows={2}
                      value={specialNotes}
                      onChange={e => setSpecialNotes(e.target.value)}
                      placeholder="Any special instructions for your order? (e.g. no nuts, extra moist, fondant flowers)"
                      className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600 resize-none"
                    />
                  </div>

                  {/* ── SECTION: Your Details ── */}
                  <div className="space-y-3">
                    <SectionLabel icon={<User className="w-3.5 h-3.5" />} label="Your Details" />

                    <div>
                      <label htmlFor="order-name" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-bakery-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="order-name"
                          type="text"
                          required
                          value={customerName}
                          onChange={e => { setCustomerName(e.target.value); clearError('customerName'); }}
                          placeholder="Your full name"
                          className={`${inputCls('customerName')} pl-8 min-h-[44px]`}
                          autoComplete="name"
                        />
                      </div>
                      {errors.customerName && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.customerName}</p>}
                    </div>

                    <div>
                      <label htmlFor="order-mobile" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 flex items-center gap-1 pointer-events-none">
                          <Phone className="w-3.5 h-3.5 text-bakery-400" />
                          <span className="text-[11px] font-bold text-bakery-500">+91</span>
                        </div>
                        <input
                          id="order-mobile"
                          type="tel"
                          required
                          value={mobile}
                          onChange={e => { setMobile(e.target.value); clearError('mobile'); }}
                          placeholder="98765 43210"
                          className={`${inputCls('mobile')} pl-14 min-h-[44px]`}
                          autoComplete="tel"
                          inputMode="numeric"
                        />
                      </div>
                      {errors.mobile && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.mobile}</p>}
                    </div>
                  </div>

                  {/* ── LOYALTY POINTS REDEMPTION (Direct Order) ── */}
                  {session?.user && (
                    <div className="bg-gradient-to-r from-amber-50 via-amber-50 to-amber-100/70 border border-amber-200/90 p-3.5 rounded-2xl space-y-1.5 text-xs text-bakery-chocolate shadow-2xs">
                      {userPoints >= 100 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <label htmlFor="direct-redeem-points" className="font-bold flex items-center gap-2 cursor-pointer select-none">
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Redeem {maxRedeemablePoints} Points (₹{potentialPointsDiscount} Off)</span>
                            </label>
                            <input
                              id="direct-redeem-points"
                              type="checkbox"
                              checked={redeemPoints}
                              onChange={(e) => setRedeemPoints(e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer accent-amber-600"
                              aria-label={`Redeem ${maxRedeemablePoints} points for ₹${potentialPointsDiscount} discount`}
                            />
                          </div>
                          <p className="text-[11px] text-bakery-600 leading-snug">
                            You have <strong>{userPoints} points</strong> available. {redeemPoints ? `₹${pointsDiscountAmount} discount applied!` : 'Check the box to apply discount instantly.'}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-bakery-chocolate">
                                Rewards Points Balance: <span className="text-amber-700 font-extrabold">{userPoints} pts</span>
                              </p>
                              <p className="text-[10px] text-bakery-600 leading-snug">
                                Earn 5 points for every ₹100 spent! Collect 100 points to unlock ₹50 off.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  {/* ── ORDER SUMMARY ── */}
                  <div className="bg-bakery-50 border border-bakery-200/70 rounded-2xl p-4 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setShowSummary(s => !s)}
                      className="w-full flex items-center justify-between text-xs font-bold text-bakery-chocolate min-h-[36px]"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Order Summary
                      </span>
                      <ChevronDown className={`w-4 h-4 text-bakery-400 transition-transform ${showSummary ? 'rotate-180' : ''}`} />
                    </button>

                    {showSummary && (
                      <div className="space-y-1.5 pt-1 border-t border-bakery-200 text-xs text-bakery-700">
                        <div className="flex justify-between"><span className="text-bakery-500">Cake</span><span className="font-semibold text-bakery-chocolate">{selectedModalProduct.name}</span></div>
                        <div className="flex justify-between"><span className="text-bakery-500">Weight</span><span className="font-semibold">{selectedWeight >= 1000 ? `${selectedWeight / 1000} kg` : `${selectedWeight} g`}</span></div>
                        <div className="flex justify-between"><span className="text-bakery-500">Quantity</span><span className="font-semibold">{qty}</span></div>
                        <div className="flex justify-between"><span className="text-bakery-500">City</span><span className="font-semibold">{selectedCity || '—'}</span></div>
                        <div className="flex justify-between">
                          <span className="text-bakery-500">Delivery</span>
                          <span className="font-semibold">
                            {deliveryDate && deliveryTime
                              ? `${formatDisplayDate(deliveryDate)} • ${formatDisplayTime(deliveryTime)}`
                              : '—'}
                          </span>
                        </div>
                        {cakeMessage && <div className="flex justify-between"><span className="text-bakery-500">Message</span><span className="font-semibold italic">&ldquo;{cakeMessage}&rdquo;</span></div>}
                        {customerName && <div className="flex justify-between"><span className="text-bakery-500">Contact</span><span className="font-semibold">{customerName}</span></div>}
                        {redeemPoints && pointsDiscountAmount > 0 && (
                          <div className="flex justify-between items-center text-emerald-700 font-semibold text-xs pt-1 border-t border-bakery-200/60">
                            <span>Points Discount ({maxRedeemablePoints} pts)</span>
                            <span className="font-price font-medium">-₹{pointsDiscountAmount}</span>
                          </div>
                        )}
                        <div className="border-t border-bakery-200 pt-2 flex justify-between items-center">
                          <span className="font-bold text-bakery-chocolate">Total Payable</span>
                          <span className="font-price text-base font-bold text-amber-800">{formatINR(finalPayablePrice)}</span>
                        </div>
                      </div>
                    )}

                    {/* Always visible total */}
                    {!showSummary && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-bakery-500">{qty} × {selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`} — {selectedCity || 'Trivandrum'}</span>
                        <div className="text-right">
                          {redeemPoints && pointsDiscountAmount > 0 && (
                            <span className="text-[10px] text-emerald-700 font-semibold block leading-none mb-0.5">(-₹{pointsDiscountAmount} pts off)</span>
                          )}
                          <span className="font-price text-base font-bold text-amber-800">{formatINR(finalPayablePrice)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gated Order Submission / Action Buttons */}
                  {!session?.user ? (
                    <div className="space-y-3 pt-2">
                      <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-2xl text-center space-y-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-bakery-chocolate uppercase tracking-wider">Sign In Required to Place Order</h4>
                          <p className="text-xs text-bakery-800 leading-relaxed">
                            Sign in with Google to place your order and track it anytime
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            className="w-full sm:w-auto flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                          >
                            <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleAddToCart();
                              handleGoogleSignIn(window.location.href);
                            }}
                            className="w-full sm:w-auto flex-2 inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-100/60 text-bakery-chocolate font-bold py-3 px-4 rounded-xl border border-amber-300 shadow-xs transition-all text-xs min-h-[44px] cursor-pointer"
                          >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Sign in with Google to Place Order</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Action Buttons — desktop */}
                      <div className="hidden sm:flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-2xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 min-h-[44px]"
                        >
                          <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                          <span>{isSubmitting ? 'Placing Order...' : `Place Order • ${formatINR(finalPayablePrice)}`}</span>
                        </button>
                      </div>
                    </>
                  )}

                </div>
              </form>

              {/* ─── STICKY BOTTOM CTA (Mobile) ─── */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-bakery-200 p-3 flex gap-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-none bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 px-4 rounded-2xl text-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <span>Cart</span>
                </button>

                {!session?.user ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart();
                      handleGoogleSignIn(window.location.href);
                    }}
                    className="flex-1 bg-white hover:bg-amber-50 text-bakery-chocolate font-bold py-3 px-3 rounded-2xl text-xs border border-amber-300 shadow-soft transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[44px]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="truncate">Sign in to Order</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 min-h-[44px]"
                  >
                    <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                    <span>{isSubmitting ? 'Placing Order...' : `Place Order • ${formatINR(finalPayablePrice)}`}</span>
                  </button>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
