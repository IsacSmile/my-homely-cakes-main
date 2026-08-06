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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span>Your Saved Cakes ({wishlist.length})</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">
          Saved Wishlist
        </h1>
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
