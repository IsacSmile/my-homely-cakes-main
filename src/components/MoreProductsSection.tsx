'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Cake, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface MoreProductsSectionProps {
  initialProducts: any[];
  totalCount?: number;
  discountPercent?: number;
}

export default function MoreProductsSection({
  initialProducts = [],
  totalCount,
  discountPercent = 0,
}: MoreProductsSectionProps) {
  const [productList, setProductList] = useState<any[]>(initialProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const total = totalCount !== undefined ? totalCount : initialProducts.length;
  const hasMore = productList.length < total;

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const res = await fetch(`/api/products?limit=12&offset=${productList.length}`);
      const data = await res.json();

      if (data && Array.isArray(data.products) && data.products.length > 0) {
        setProductList((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = data.products.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      }
    } catch (error) {
      console.error('Error loading additional products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!productList || productList.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8 pt-2">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-bakery-200/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <Cake className="w-4 h-4 text-amber-600" />
            <span>Fresh From The Oven</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-bakery-chocolate tracking-tight">
            More From Our Bakery
          </h2>

          <p className="text-xs sm:text-sm text-bakery-800/80 max-w-2xl leading-relaxed">
            Explore our artisanal selection of handcrafted home cakes, prepared with 100% natural butter and delivered fresh across Trivandrum.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-600 bg-white hover:bg-amber-50 px-4 py-2.5 rounded-full border border-amber-200 shadow-xs transition-all shrink-0 self-start sm:self-auto"
        >
          <span>Explore All Cakes</span>
          <ArrowRight className="w-4 h-4 text-amber-700" />
        </Link>
      </div>

      {/* Product Cards Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {productList.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            discountPercent={discountPercent}
            priority={idx < 4}
          />
        ))}
      </div>

      {/* Load More Pagination Button */}
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                <span>Loading Cakes...</span>
              </>
            ) : (
              <>
                <span>Load More Cakes ({total - productList.length} remaining)</span>
                <ArrowRight className="w-4 h-4 text-amber-700" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
