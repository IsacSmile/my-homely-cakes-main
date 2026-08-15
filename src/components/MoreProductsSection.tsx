import React from 'react';
import ProductCard from './ProductCard';
import { Cake, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';

interface MoreProductsSectionProps {
  products: any[];
  discountPercent?: number;
  isLoading?: boolean;
}

export default function MoreProductsSection({
  products,
  discountPercent = 0,
  isLoading = false,
}: MoreProductsSectionProps) {
  // Hide section entirely if no non-featured products are available
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  // Display up to 12 non-featured products on homepage
  const displayProducts = products.slice(0, 12);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-bakery-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Cake className="w-4 h-4 text-amber-600" />
            <span>Fresh From The Oven</span>
          </div>
          
          <h2 className="font-serif text-3xl font-bold text-bakery-chocolate">
            More From Our Bakery
          </h2>
          
          <p className="text-xs sm:text-sm text-bakery-800/80 max-w-2xl leading-relaxed mt-1">
            Explore our artisanal menu of handcrafted home cakes, prepared with natural ingredients and delivered fresh across Trivandrum.
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
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              discountPercent={discountPercent}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA Button */}
      {products.length > 12 && (
        <div className="pt-4 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-soft transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore All {products.length}+ Cakes in Shop</span>
            <ArrowRight className="w-4 h-4 text-amber-200" />
          </Link>
        </div>
      )}
    </section>
  );
}
