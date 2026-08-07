'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Zap, Award } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR, getLowestVariant } from '@/lib/pricing';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    images?: string;
    category: string;
    baseWeightG: number;
    basePrice: number;
    variants: string;
    isAvailable: boolean;
    orderCount: number;
  };
  discountPercent?: number;
}

export default function ProductCard({ product, discountPercent = 0 }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, openProductModal } = useCart();
  const isWishlisted = isInWishlist(product.id);
  const [imgSrc, setImgSrc] = useState<string>(
    product.imageUrl || '/cake-placeholder.svg'
  );

  const lowestVariant = getLowestVariant(product);
  const finalBasePrice = discountPercent > 0
    ? Math.round(lowestVariant.price * (1 - discountPercent / 100))
    : lowestVariant.price;

  // Track product click analytics silently
  const handleCardClick = () => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click', productId: product.id }),
    }).catch(() => {});
    openProductModal(product);
  };

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-bakery-200/70 shadow-xs hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-0.5">
      
      {/* Product Image Container — Optimized for Zomato/Swiggy 2-column mobile layout */}
      <div className="relative h-36 sm:h-48 w-full bg-bakery-100 overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc('/cake-placeholder.svg')}
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Category Pill */}
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-md text-bakery-chocolate text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border border-bakery-200/50 shadow-xs max-w-[75%] truncate">
          {product.category}
        </span>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md ${
            isWishlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/90 text-bakery-chocolate/70 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Popular Badge */}
        {product.orderCount > 50 && (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-amber-500/90 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Popular
          </span>
        )}
      </div>

      {/* Product Content Details — Mobile 2-column friendly minimal layout */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <h3
            onClick={handleCardClick}
            className="font-serif text-sm sm:text-base font-bold text-bakery-chocolate line-clamp-1 cursor-pointer hover:text-amber-700 transition-colors leading-snug"
          >
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-bakery-800/70 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-tight">
            {product.description}
          </p>
        </div>

        {/* Price & Weight info */}
        <div className="pt-1.5 border-t border-bakery-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] text-bakery-600 block font-medium">
              Starts at ({lowestVariant.weightG >= 1000 ? `${lowestVariant.weightG / 1000}kg` : `${lowestVariant.weightG}g`})
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-base sm:text-xl font-extrabold text-amber-800">
                {formatINR(finalBasePrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-[10px] sm:text-xs text-bakery-400 line-through">
                  {formatINR(lowestVariant.price)}
                </span>
              )}
            </div>
          </div>

          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
            {lowestVariant.weightG >= 1000 ? `${lowestVariant.weightG / 1000}kg` : `${lowestVariant.weightG}g`}
          </span>
        </div>

        {/* Zomato/Swiggy-Style Compact Mobile Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => addToCart(product, lowestVariant.weightG, 1)}
            className="flex items-center justify-center gap-1 bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate border border-bakery-200 font-semibold text-[11px] sm:text-xs py-2 px-1.5 rounded-xl transition-colors active:scale-95"
            title="Add to Cart"
          >
            <ShoppingBag className="w-3 h-3 text-amber-700 shrink-0" />
            <span className="truncate">Cart</span>
          </button>

          <button
            type="button"
            onClick={handleCardClick}
            className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] sm:text-xs py-2 px-1.5 rounded-xl transition-all shadow-xs hover:shadow-soft active:scale-95"
            title="Order Cake"
          >
            <Zap className="w-3 h-3 text-amber-200 shrink-0" />
            <span className="truncate">Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
