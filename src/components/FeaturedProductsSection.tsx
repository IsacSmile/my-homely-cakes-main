import React from 'react';
import ProductCard from './ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';

interface FeaturedProductsSectionProps {
  products: any[];
  discountPercent?: number;
  isLoading?: boolean;
}

export default function FeaturedProductsSection({
  products,
  discountPercent = 0,
  isLoading = false,
}: FeaturedProductsSectionProps) {
  if (!isLoading && (!products || products.length === 0)) {
    return null; // Hide section entirely if admin hasn't marked any products as featured
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-amber-50/60 via-amber-50/30 to-transparent border-y border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Handpicked Favorites</span>
            </div>
            
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-bakery-chocolate tracking-tight">
              Featured Bakery Creations
            </h2>
            
            <p className="text-xs sm:text-sm text-bakery-800/80 max-w-2xl leading-relaxed">
              Curated by our master bakers — hand-crafted specialty cakes highlighted for celebrations, birthdays, and anniversaries.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-600 bg-white hover:bg-amber-50 px-4 py-2.5 rounded-full border border-amber-200 shadow-xs transition-all shrink-0 self-start md:self-auto"
          >
            <span>Explore Full Shop Catalog</span>
            <ArrowRight className="w-4 h-4 text-amber-700" />
          </Link>
        </div>

        {/* Featured Products Cards Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                discountPercent={discountPercent}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
