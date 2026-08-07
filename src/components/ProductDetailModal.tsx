'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X, ShoppingBag, Zap, CheckCircle2, Scale, Sparkles,
  ChevronLeft, ChevronRight, Minus, Plus, MapPin,
  Calendar, Clock, MessageSquare, User, Phone, MapPinned,
  ChevronDown, AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { parseProductVariants, getDefaultVariant, getVariantPrice, formatINR, WeightVariant } from '@/lib/pricing';

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

  // Product state
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [qty, setQty] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

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
  const [address, setAddress] = useState<string>('');

  // UX State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Set defaults when modal opens
  useEffect(() => {
    if (!selectedModalProduct) return;

    const defVariant = getDefaultVariant(selectedModalProduct);
    setSelectedWeight(defVariant.weightG);
    setQty(1);
    setActiveImageIndex(0);
    setOrderSuccess(null);
    setErrors({});
    setShowSummary(false);
    setCakeMessage('');
    setSpecialNotes('');
    setCustomerName('');
    setMobile('');
    setAddress('');

    // Default delivery = now IST + 30 min
    const nowIST = getNowIST();
    const defaultDelivery = addMinutes(nowIST, 30);
    setDeliveryDate(formatDateISO(defaultDelivery));
    setDeliveryTime(formatTimeHHMM(defaultDelivery));
  }, [selectedModalProduct]);

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

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeProductModal();
  }, [closeProductModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (selectedModalProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedModalProduct]);

  if (!selectedModalProduct) return null;

  // Gallery photos
  let galleryPhotos: string[] = [selectedModalProduct.imageUrl];
  try {
    if (selectedModalProduct.images) {
      const parsed = typeof selectedModalProduct.images === 'string'
        ? JSON.parse(selectedModalProduct.images)
        : selectedModalProduct.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        galleryPhotos = parsed.filter((url: string) => typeof url === 'string' && url.trim().length > 0);
      }
    }
  } catch {
    galleryPhotos = [selectedModalProduct.imageUrl];
  }
  if (galleryPhotos.length === 0) galleryPhotos = [selectedModalProduct.imageUrl || '/cake-placeholder.svg'];

  const variantsList: WeightVariant[] = parseProductVariants(selectedModalProduct);
  const unitPrice = getVariantPrice(selectedModalProduct, selectedWeight);
  const totalPrice = unitPrice * qty;
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
    if (!address.trim()) newErrors.address = 'Please enter your delivery address.';
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
          address: address.trim(),
          deliveryCity: selectedCity,
          deliveryDate,
          deliveryTime,
          cakeMessage: cakeMessage.trim() || null,
          notes: specialNotes.trim() || null,
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
    addToCart(selectedModalProduct, selectedWeight, qty);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) closeProductModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${selectedModalProduct.name}`}
    >
      <div className="bg-white w-full max-w-4xl sm:max-h-[92vh] max-h-[97vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scaleIn">

        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 text-bakery-chocolate hover:bg-white shadow-md transition-colors"
          aria-label="Close order modal"
        >
          <X className="w-5 h-5" />
        </button>

        {orderSuccess ? (
          /* ─── SUCCESS SCREEN ─── */
          <div className="p-8 w-full flex flex-col items-center justify-center text-center space-y-5 bg-gradient-to-b from-emerald-50 to-bakery-50 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-bakery-chocolate">Order Confirmed! 🎂</h2>
              <p className="text-xs text-bakery-600 mt-1">Your homemade cake is being prepared with love.</p>
            </div>

            <div className="bg-white border border-bakery-200 rounded-2xl p-5 w-full max-w-sm space-y-3 text-left shadow-soft">
              <div className="flex justify-between items-center border-b border-bakery-100 pb-2">
                <span className="text-xs font-bold text-bakery-600">Order Reference</span>
                <span className="font-mono font-extrabold text-amber-800 text-sm">{orderSuccess.orderNumber}</span>
              </div>
              <div className="text-xs space-y-2 text-bakery-800">
                <div className="flex justify-between"><span className="text-bakery-500">Cake</span><span className="font-semibold">{selectedModalProduct.name}</span></div>
                <div className="flex justify-between"><span className="text-bakery-500">Weight</span><span className="font-semibold">{selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}</span></div>
                <div className="flex justify-between"><span className="text-bakery-500">Qty</span><span className="font-semibold">{qty}</span></div>
                <div className="flex justify-between"><span className="text-bakery-500">City</span><span className="font-semibold">{orderSuccess.deliveryCity || selectedCity}</span></div>
                {orderSuccess.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-bakery-500">Delivery</span>
                    <span className="font-semibold">{formatDisplayDate(orderSuccess.deliveryDate)} • {formatDisplayTime(orderSuccess.deliveryTime)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-bakery-100 pt-2 mt-1">
                  <span className="font-bold text-bakery-chocolate">Total</span>
                  <span className="font-price font-medium text-amber-800 text-base">{formatINR(orderSuccess.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-900 text-left w-full max-w-sm space-y-1.5">
              <p className="font-bold mb-1">What happens next?</p>
              <p>📞 Our baker will call <strong>{mobile}</strong> to confirm your order.</p>
              <p>💳 Payment via UPI or Cash on Delivery.</p>
            </div>

            <button
              onClick={closeProductModal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-8 py-3 rounded-full shadow-soft transition-all active:scale-95"
            >
              Continue Browsing
            </button>
          </div>

        ) : (
          <>
            {/* ─── LEFT: IMAGE GALLERY ─── */}
            <div className="hidden md:flex w-full md:w-5/12 flex-col bg-bakery-100 relative shrink-0">
              <div className="relative flex-1 bg-bakery-200 overflow-hidden">
                <Image
                  src={activePhotoUrl}
                  alt={selectedModalProduct.name}
                  fill
                  sizes="40vw"
                  className="object-cover transition-all duration-300"
                  priority
                />
                <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  {selectedModalProduct.category}
                </div>
                {galleryPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex(p => p === 0 ? galleryPhotos.length - 1 : p - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      aria-label="Previous photo"
                    ><ChevronLeft className="w-4 h-4" /></button>
                    <button
                      onClick={() => setActiveImageIndex(p => p === galleryPhotos.length - 1 ? 0 : p + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      aria-label="Next photo"
                    ><ChevronRight className="w-4 h-4" /></button>
                  </>
                )}
              </div>
              {galleryPhotos.length > 1 && (
                <div className="p-3 bg-white border-t border-bakery-200 flex items-center justify-center gap-2 overflow-x-auto">
                  {galleryPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === idx ? 'border-amber-600 scale-105' : 'border-bakery-200 opacity-60 hover:opacity-100'}`}
                    >
                      <Image src={photo} alt={`Thumbnail ${idx + 1}`} fill sizes="48px" className="object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── RIGHT: ORDER FORM ─── */}
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Mobile: mini image strip at top */}
              <div className="md:hidden relative h-44 bg-bakery-200 shrink-0">
                <Image src={activePhotoUrl} alt={selectedModalProduct.name} fill sizes="100vw" className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-12">
                  <span className="text-[10px] text-white/80 font-semibold uppercase tracking-widest">{selectedModalProduct.category}</span>
                  <h2 className="font-serif text-lg font-bold text-white leading-tight">{selectedModalProduct.name}</h2>
                </div>
              </div>

              {/* Scrollable form area */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto overscroll-contain"
                noValidate
              >
                <div className="p-4 sm:p-5 space-y-5 pb-24 sm:pb-5">

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
                              className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${isSelected
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
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-bakery-200 rounded-xl overflow-hidden bg-bakery-50">
                          <button
                            type="button"
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            className="px-4 py-2.5 text-bakery-chocolate hover:bg-bakery-100 active:bg-bakery-200 transition-colors disabled:opacity-30"
                            aria-label="Decrease quantity"
                            disabled={qty <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-5 py-2.5 text-sm font-extrabold text-bakery-chocolate select-none min-w-[3rem] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(q => q + 1)}
                            className="px-4 py-2.5 text-bakery-chocolate hover:bg-bakery-100 active:bg-bakery-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Live price */}
                        <div className="flex-1 bg-amber-50 border border-amber-200/60 rounded-xl px-3.5 py-2 flex items-center justify-between">
                          <span className="text-[10px] text-bakery-500 font-medium">
                            {qty > 1 ? `${qty} × ${formatINR(unitPrice)}` : `Price for ${selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}`}
                          </span>
                          <span className="font-price text-lg font-medium text-amber-800">{formatINR(totalPrice)}</span>
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
                          className={`w-full appearance-none ${inputCls('city')} pr-8`}
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
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="order-date"
                            type="date"
                            required
                            value={deliveryDate}
                            min={todayStr}
                            onChange={e => { setDeliveryDate(e.target.value); clearError('deliveryDate'); }}
                            className={`${inputCls('deliveryDate')} pl-8 cursor-pointer`}
                          />
                        </div>
                        {deliveryDate && <p className="text-[10px] text-amber-800 font-medium mt-0.5">{formatDisplayDate(deliveryDate)}</p>}
                        {errors.deliveryDate && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deliveryDate}</p>}
                      </div>

                      <div>
                        <label htmlFor="order-time" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                          Time <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="order-time"
                            type="time"
                            required
                            value={deliveryTime}
                            min={minTime}
                            onChange={e => { setDeliveryTime(e.target.value); clearError('deliveryTime'); }}
                            className={`${inputCls('deliveryTime')} pl-8 cursor-pointer`}
                          />
                        </div>
                        {deliveryTime && <p className="text-[10px] text-amber-800 font-medium mt-0.5">{formatDisplayTime(deliveryTime)}</p>}
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
                    <SectionLabel icon={<MessageSquare className="w-3.5 h-3.5" />} label="Cake Message (Optional)" />
                    <textarea
                      rows={2}
                      value={cakeMessage}
                      onChange={e => setCakeMessage(e.target.value)}
                      placeholder='e.g. "Happy Birthday Sarah! 🎂"'
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
                          className={`${inputCls('customerName')} pl-8`}
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
                          className={`${inputCls('mobile')} pl-14`}
                          autoComplete="tel"
                          inputMode="numeric"
                        />
                      </div>
                      {errors.mobile && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.mobile}</p>}
                    </div>

                    <div>
                      <label htmlFor="order-address" className="text-[11px] font-bold text-bakery-800 block mb-1.5">
                        Delivery Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPinned className="w-3.5 h-3.5 text-bakery-400 absolute left-3 top-3 pointer-events-none" />
                        <textarea
                          id="order-address"
                          required
                          rows={3}
                          value={address}
                          onChange={e => { setAddress(e.target.value); clearError('address'); }}
                          placeholder="House / Flat number, Street, Area, Landmark…"
                          className={`${inputCls('address')} pl-8 resize-none`}
                          autoComplete="street-address"
                        />
                      </div>
                      {errors.address && <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                    </div>
                  </div>

                  {/* ── ORDER SUMMARY ── */}
                  <div className="bg-bakery-50 border border-bakery-200/70 rounded-2xl p-4 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setShowSummary(s => !s)}
                      className="w-full flex items-center justify-between text-xs font-bold text-bakery-chocolate"
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
                        <div className="border-t border-bakery-200 pt-2 flex justify-between items-center">
                          <span className="font-bold text-bakery-chocolate">Total</span>
                          <span className="font-price text-base font-medium text-amber-800">{formatINR(totalPrice)}</span>
                        </div>
                      </div>
                    )}

                    {/* Always visible total */}
                    {!showSummary && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-bakery-500">{qty} × {selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`} — {selectedCity || 'Trivandrum'}</span>
                        <span className="font-price text-base font-medium text-amber-800">{formatINR(totalPrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons — desktop */}
                  <div className="hidden sm:flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-2xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                      <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
                    </button>
                  </div>

                </div>
              </form>

              {/* ─── STICKY BOTTOM CTA (Mobile) ─── */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-bakery-200 p-3 flex gap-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-none bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 px-4 rounded-2xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <span>Cart</span>
                </button>

                <button
                  type="submit"
                  form="order-form-mobile"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                  <span>{isSubmitting ? 'Placing Order...' : `Place Order • ${formatINR(totalPrice)}`}</span>
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
