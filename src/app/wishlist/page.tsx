'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import {
  Heart, Cake, ArrowRight, Sparkles, ShoppingBag,
  Trash2, Share2, Check, RefreshCw, Star, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedAllToCart, setAddedAllToCart] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products?limit=100')
      .then(res => res.json())
      .then(data => {
        const products = data.products || [];
        setAllProducts(products);
        if (wishlist.length > 0) {
          const filtered = products.filter((p: any) => wishlist.includes(p.id));
          setWishlistProducts(filtered);
        } else {
          setWishlistProducts([]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [wishlist]);

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(product => {
      addToCart(product, product.baseWeightG || 500, 1);
    });
    setAddedAllToCart(true);
    setTimeout(() => setAddedAllToCart(false), 3000);
  };

  const handleClearWishlist = () => {
    if (confirm('Are you sure you want to clear all items from your wishlist?')) {
      wishlist.forEach(id => toggleWishlist(id));
    }
  };

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Recommended products when wishlist is empty or has items
  const recommendedProducts = allProducts
    .filter(p => !wishlist.includes(p.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-bakery-50/50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
        
        {/* Premium Hero Header Section */}
        <div className="bg-white rounded-3xl border border-bakery-200/80 p-6 sm:p-10 shadow-soft relative overflow-hidden">
          
          {/* Subtle Ambient Background Gradient Glow */}
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-to-br from-amber-200/30 to-rose-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-gradient-to-tr from-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            
            {/* Top Row: Badge & Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bakery-100/80 pb-4">
              
              {/* Bracketed Breadcrumb: [ HOME / WISHLIST ] */}
              <div className="text-xs font-bold tracking-widest text-bakery-500 uppercase flex items-center gap-1.5">
                <span className="text-bakery-400 font-normal">[</span>
                <Link href="/" className="hover:text-amber-800 transition-colors">HOME</Link>
                <span className="text-bakery-300">/</span>
                <span className="text-bakery-chocolate font-extrabold">WISHLIST</span>
                <span className="text-bakery-400 font-normal">]</span>
              </div>

              {/* Curated Collection Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 text-[11px] font-bold tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Personal Favorites ({wishlist.length})</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-1">
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-bakery-chocolate tracking-tight uppercase leading-none">
                  MY CAKE WISHLIST
                </h1>
                <p className="text-sm sm:text-base text-bakery-600/90 leading-relaxed pt-1">
                  Review your saved artisanal cakes and sweet treats. Easily order them, customize weight options, or request direct home delivery across Trivandrum.
                </p>
              </div>

              {/* Action Buttons (when items exist) */}
              {wishlistProducts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddAllToCart}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-soft transition-all active:scale-95"
                  >
                    {addedAllToCart ? (
                      <>
                        <Check className="w-4 h-4 text-amber-200" />
                        <span>Added All to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-amber-200" />
                        <span>Add All to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWishlist}
                    className="inline-flex items-center gap-1.5 bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate border border-bakery-200 text-xs font-semibold px-4 py-3 rounded-2xl transition-colors"
                    title="Share Wishlist"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-bakery-600" />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearWishlist}
                    className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3.5 py-3 rounded-2xl transition-colors"
                    title="Clear Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Row: Count Indicator & Benefits */}
            <div className="pt-4 border-t border-bakery-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-amber-800 uppercase">
                {isLoading
                  ? 'LOADING SAVED CAKES...'
                  : wishlistProducts.length > 0
                  ? `SHOWING 1–${wishlistProducts.length} OF ${wishlistProducts.length} SAVED CAKE${wishlistProducts.length > 1 ? 'S' : ''}`
                  : '0 SAVED CAKES IN WISHLIST'}
              </span>

              <div className="flex items-center gap-4 text-bakery-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Preservative Free
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 4.9★ Customer Rating
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Wishlist Content Section */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-bakery-600">Loading your saved cakes...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          
          /* ─── EMPTY STATE (PREMIUM DESIGN) ─── */
          <div className="space-y-12">
            
            <div className="bg-white rounded-3xl border border-bakery-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto text-amber-700">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs sm:text-sm text-bakery-600 leading-relaxed">
                  You haven&apos;t saved any artisanal cakes yet. Tap the heart icon on any cake card while browsing to save your favorites here for easy ordering!
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-7 py-3.5 rounded-full shadow-soft transition-all active:scale-95"
              >
                <span>Explore Our Cake Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Recommended Products Strip */}
            {recommendedProducts.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-bakery-200 pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                      Popular Cakes You Might Love
                    </h3>
                    <p className="text-xs text-bakery-600 mt-0.5">
                      Explore Trivandrum&apos;s most ordered home-baked creations
                    </p>
                  </div>
                  <Link href="/shop" className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (

          /* ─── WISHLIST PRODUCT GRID ─── */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Bottom Recommendation Section if Wishlist has items */}
            {recommendedProducts.length > 0 && (
              <div className="pt-10 space-y-6 border-t border-bakery-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-bakery-chocolate">
                      You Might Also Like
                    </h3>
                    <p className="text-xs text-bakery-600 mt-0.5">
                      Handcrafted cakes based on Trivandrum popular orders
                    </p>
                  </div>
                  <Link href="/shop" className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
                    <span>Explore Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
