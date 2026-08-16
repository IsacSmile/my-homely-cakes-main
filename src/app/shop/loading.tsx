import React from 'react';
import { Cake } from 'lucide-react';
import { ProductGridSkeleton, CategoryFilterSkeleton } from '@/components/ui/Skeletons';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="space-y-2.5 sm:space-y-3 text-center max-w-3xl mx-auto flex flex-col items-center">
        <Skeleton className="h-9 sm:h-11 w-72 sm:w-96 rounded-xl mx-auto" />
        <Skeleton className="h-12 w-full max-w-2xl rounded-2xl mx-auto mt-2" />
      </div>

      {/* Categories Filter Skeleton */}
      <div className="pt-2">
        <CategoryFilterSkeleton />
      </div>

      {/* Products Grid Skeleton */}
      <ProductGridSkeleton count={8} />
    </div>
  );
}
