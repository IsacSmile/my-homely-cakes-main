'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Zap, Award } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/pricing';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
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

  // Track product click analytics silently
  const handleCardClick = () => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click', productId: product.id }),
    }).catch(() => {});
    openProductModal(product);
  };

  const finalBasePrice = discountPercent > 0
    ? Math.round(product.basePrice * (1 - discountPercent / 100))
    : product.basePrice;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-bakery-200/60 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full bg-bakery-100 overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-bakery-chocolate text-[11px] font-semibold px-3 py-1 rounded-full border border-bakery-200/50 shadow-sm">
          {product.category}
        </span>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
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
          className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all duration-200 shadow-md ${
            isWishlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/90 text-bakery-chocolate/70 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Order count badge */}
        {product.orderCount > 50 && (
          <span className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Award className="w-3 h-3" /> Popular
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3
              onClick={handleCardClick}
              className="font-serif text-lg font-bold text-bakery-chocolate line-clamp-1 cursor-pointer hover:text-amber-700 transition-colors"
            >
              {product.name}
            </h3>
          </div>
          <p className="text-xs text-bakery-800/70 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Weight info */}
        <div className="pt-2 border-t border-bakery-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-bakery-600 block font-medium">
              Starts at ({product.baseWeightG}g)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-extrabold text-bakery-chocolate">
                {formatINR(finalBasePrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-bakery-400 line-through">
                  {formatINR(product.basePrice)}
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
            {product.baseWeightG >= 1000 ? `${product.baseWeightG / 1000}kg` : `${product.baseWeightG}g`} base
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => addToCart(product, product.baseWeightG, 1)}
            className="flex items-center justify-center gap-1.5 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold text-xs py-2.5 px-3 rounded-2xl transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={handleCardClick}
            className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 px-3 rounded-2xl transition-all shadow-soft hover:shadow-soft-lg active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
