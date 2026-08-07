'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { Heart, Cake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch('/api/products?limit=100')
      .then(res => res.json())
      .then(data => {
        const all = data.products || [];
        const filtered = all.filter((p: any) => wishlist.includes(p.id));
        setWishlistProducts(filtered);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header Section matching reference image */}
      <div className="space-y-3">
        {/* Breadcrumb: [ HOME / WISHLIST ] */}
        <div className="text-xs font-bold tracking-widest text-bakery-500 uppercase flex items-center gap-1.5">
          <span className="text-bakery-400 font-normal">[</span>
          <Link href="/" className="hover:text-amber-800 transition-colors">HOME</Link>
          <span className="text-bakery-300">/</span>
          <span className="text-bakery-chocolate font-extrabold">WISHLIST</span>
          <span className="text-bakery-400 font-normal">]</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-bakery-chocolate tracking-tight uppercase">
          MY CAKE WISHLIST
        </h1>

        {/* Subtitle / Description */}
        <p className="text-sm sm:text-base text-bakery-600/90 max-w-2xl leading-relaxed">
          Review your saved artisanal cakes and sweet treats. Easily order them or request custom details for your special occasions.
        </p>

        {/* Items Count Indicator: SHOWING 1-N OF N SAVED CAKES */}
        <div className="pt-3">
          <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-amber-800 uppercase">
            {isLoading
              ? 'LOADING SAVED CAKES...'
              : wishlistProducts.length > 0
              ? `SHOWING 1–${wishlistProducts.length} OF ${wishlistProducts.length} SAVED CAKE${wishlistProducts.length > 1 ? 'S' : ''}`
              : '0 SAVED CAKES IN WISHLIST'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-bakery-600">Loading saved cakes...</div>
      ) : wishlistProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4 max-w-md mx-auto">
          <Cake className="w-12 h-12 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Saved Cakes Yet</h3>
          <p className="text-xs text-bakery-600">
            Tap the heart icon on any cake card to save it to your local wishlist for quick reference!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-amber-600 text-white text-xs font-bold px-6 py-3 rounded-full shadow-soft hover:bg-amber-500 transition-colors"
          >
            <span>Explore Cakes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
