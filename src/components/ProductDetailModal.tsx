'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Zap, CheckCircle2, Scale, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { parseProductVariants, getDefaultVariant, getVariantPrice, formatINR, WeightVariant } from '@/lib/pricing';

export default function ProductDetailModal() {
  const { selectedModalProduct, closeProductModal, addToCart } = useCart();
  
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Set default weight and active photo when product opens
  useEffect(() => {
    if (selectedModalProduct) {
      const defVariant = getDefaultVariant(selectedModalProduct);
      setSelectedWeight(defVariant.weightG);
      setActiveImageIndex(0);
      setOrderSuccess(null);
    }
  }, [selectedModalProduct]);

  if (!selectedModalProduct) return null;

  // Extract gallery photos
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
  } catch (e) {
    galleryPhotos = [selectedModalProduct.imageUrl];
  }
  if (galleryPhotos.length === 0) {
    galleryPhotos = [selectedModalProduct.imageUrl || '/cake-placeholder.svg'];
  }

  // Parse structured weight-price variants
  const variantsList: WeightVariant[] = parseProductVariants(selectedModalProduct);
  const currentPrice = getVariantPrice(selectedModalProduct, selectedWeight);
  const activePhotoUrl = galleryPhotos[activeImageIndex] || galleryPhotos[0] || '/cake-placeholder.svg';

  const handleInstantOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          mobile,
          address,
          notes,
          items: [
            {
              productId: selectedModalProduct.id,
              name: selectedModalProduct.name,
              weightG: selectedWeight,
              calculatedPrice: currentPrice,
              qty: 1,
            }
          ]
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data);
      } else {
        alert(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 text-bakery-chocolate hover:bg-white shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {orderSuccess ? (
          /* Success Screen */
          <div className="p-8 w-full flex flex-col items-center justify-center text-center space-y-6 bg-bakery-50">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-bakery-chocolate mb-1">
                Order Placed Successfully! 🎉
              </h2>
              <p className="text-sm text-bakery-800">
                Order Reference: <strong className="font-price font-extrabold text-amber-800 font-mono">{orderSuccess.orderNumber}</strong>
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-bakery-200 text-xs text-bakery-800 w-full max-w-md space-y-2 text-left">
              <p className="font-bold text-bakery-chocolate text-sm mb-2 text-center">What happens next?</p>
              <p>1. Our head baker will phone call your mobile number <span className="font-bold">{mobile}</span> directly to confirm delivery time & details.</p>
              <p>2. Payment can be made via UPI or Cash upon delivery/pickup.</p>
            </div>

            <button
              onClick={closeProductModal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-full shadow-soft transition-all"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <>
            {/* Left Multi-Photo Image Gallery */}
            <div className="w-full md:w-1/2 flex flex-col bg-bakery-100 relative">
              {/* Main Photo View */}
              <div className="relative h-64 md:h-auto md:flex-1 w-full bg-bakery-200 overflow-hidden">
                <Image
                  src={activePhotoUrl}
                  alt={selectedModalProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-all duration-300"
                  priority
                />
                
                <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
                  {selectedModalProduct.category}
                </div>

                {/* Left/Right Carousel Controls */}
                {galleryPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails Strip */}
              {galleryPhotos.length > 1 && (
                <div className="p-3 bg-white border-t border-bakery-200 flex items-center justify-center gap-2 overflow-x-auto">
                  {galleryPhotos.map((photo, idx) => {
                    const isSelected = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          isSelected ? 'border-amber-600 ring-2 ring-amber-600/30 scale-105' : 'border-bakery-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image src={photo} alt={`Thumbnail ${idx + 1}`} fill sizes="56px" className="object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Details & Order Form */}
            <div className="w-full md:w-1/2 p-5 sm:p-6 overflow-y-auto max-h-[85vh] flex flex-col justify-between space-y-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-bakery-chocolate leading-tight">
                  {selectedModalProduct.name}
                </h2>
                <p className="text-xs text-bakery-800/80 mt-2 leading-relaxed">
                  {selectedModalProduct.description}
                </p>

                {/* Weight Variant Selector showing exact admin prices in Montserrat */}
                <div className="mt-4 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-bakery-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    Select Cake Weight / Portion:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {variantsList.map((v: WeightVariant) => {
                      const label = v.weightG >= 1000 ? `${v.weightG / 1000} kg` : `${v.weightG} g`;
                      const isSelected = selectedWeight === v.weightG;
                      return (
                        <button
                          key={v.weightG}
                          type="button"
                          onClick={() => setSelectedWeight(v.weightG)}
                          className={`py-2.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-600 shadow-soft font-bold scale-102'
                              : 'bg-bakery-50 text-bakery-chocolate border-bakery-200/80 hover:bg-bakery-100'
                          }`}
                        >
                          <span className="text-xs font-bold">{label}</span>
                          <span className={`font-price text-[11px] font-bold ${isSelected ? 'text-amber-100' : 'text-amber-800'}`}>
                            {formatINR(v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Display in Montserrat font-price */}
                <div className="mt-4 p-3.5 bg-bakery-softBg rounded-2xl border border-amber-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-bakery-600 font-medium block">
                      Price for {selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}:
                    </span>
                    <span className="font-price text-xl sm:text-2xl font-extrabold text-amber-800 tracking-tight">
                      {formatINR(currentPrice)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Free Trivandrum Delivery Consult
                  </span>
                </div>

                {/* Direct 1-Step Order Form */}
                <form onSubmit={handleInstantOrder} className="mt-4 space-y-2.5 pt-3 border-t border-bakery-100">
                  <span className="text-xs font-bold text-bakery-chocolate flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Quick Order (No Login Required)
                  </span>

                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Mobile Phone Number (Trivandrum) *"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Delivery Area in Trivandrum (e.g. Kowdiar, Kazhakkoottam)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Special Cake Message (e.g., Happy Birthday Rahul!)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedModalProduct, selectedWeight, 1);
                        closeProductModal();
                      }}
                      className="flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                      <span>{isSubmitting ? 'Placing Order...' : 'Order Now'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
