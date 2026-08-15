import React from 'react';
import { Skeleton } from './Skeleton';

// ── PRODUCT CARD SKELETON ──
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-bakery-200/80 shadow-soft flex flex-col justify-between h-full space-y-3">
      <div className="space-y-3">
        {/* Image Block */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-bakery-100/50">
          <Skeleton className="w-full h-full rounded-2xl" />
          {/* Badge Tag Overlay */}
          <div className="absolute top-2.5 left-2.5">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Rating Line */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Skeleton className="h-3.5 w-12 rounded" />
          <Skeleton className="h-3.5 w-8 rounded" />
        </div>

        {/* Product Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 sm:h-5 w-5/6 rounded-md" />
          <Skeleton className="h-3 w-3/4 rounded-md" />
        </div>

        {/* Weight Selector Pill */}
        <div className="pt-1">
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Footer Price & Action CTA */}
      <div className="pt-3 border-t border-bakery-100 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-5 sm:h-6 w-16 rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 sm:w-28 rounded-full" />
      </div>
    </div>
  );
}

// ── PRODUCT GRID SKELETON ──
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── CATEGORY FILTER CHIPS SKELETON ──
export function CategoryFilterSkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 sm:w-28 rounded-full shrink-0" />
      ))}
    </div>
  );
}

// ── HERO BANNER SKELETON ──
export function HeroBannerSkeleton() {
  return (
    <div className="relative min-h-[380px] sm:min-h-[460px] w-full rounded-3xl overflow-hidden bg-white border border-bakery-200/80 shadow-soft p-6 sm:p-10 flex flex-col justify-end">
      <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
      <div className="relative z-10 max-w-lg space-y-4 bg-white/40 backdrop-blur-xs p-6 rounded-2xl border border-white/60">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-8 sm:h-10 w-4/5 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── PRODUCT DETAIL MODAL SKELETON ──
export function ProductDetailModalSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-bakery-100/50">
            <Skeleton className="w-full h-full rounded-2xl" />
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Right Column: Order Form */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-5/6 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>

          <div className="pt-3 border-t border-bakery-100 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <Skeleton className="h-12 w-full rounded-2xl pt-2" />
        </div>
      </div>
    </div>
  );
}

// ── CART ITEM SKELETON ──
export function CartItemSkeleton() {
  return (
    <div className="pt-3 pb-4 space-y-3 border-b border-bakery-100">
      <div className="flex items-start gap-3">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMER ORDER CARD SKELETON ──
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-bakery-200/80 p-5 sm:p-6 shadow-soft space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-100 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-40 rounded" />
        </div>
        <div className="space-y-1 sm:text-right">
          <Skeleton className="h-3 w-16 sm:ml-auto rounded" />
          <Skeleton className="h-6 w-24 sm:ml-auto rounded-md" />
        </div>
      </div>

      {/* Order Progress Tracker Bar */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bakery-50/70 border border-bakery-200/60">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="bg-white p-4 rounded-2xl border border-bakery-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── ADMIN ORDER ROW / CARD SKELETON ──
export function AdminOrderRowSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-bakery-200 shadow-soft space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bakery-100 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-36 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        <div className="md:col-span-4 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="md:col-span-8 space-y-2">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PRODUCT CARD SKELETON ──
export function AdminProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-4 border border-bakery-200 shadow-soft flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
}

// ── ADMIN OVERVIEW STAT CARD SKELETON ──
export function AdminStatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-3xl border border-bakery-200/80 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="w-10 h-10 rounded-2xl" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-3 w-36 rounded" />
    </div>
  );
}
