'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Search, Cake, Loader2, Sparkles } from 'lucide-react';

interface ShopClientProps {
  initialProducts: any[];
  initialCategories: any[];
  initialHasMore: boolean;
}

export default function ShopClient({
  initialProducts,
  initialCategories,
  initialHasMore,
}: ShopClientProps) {
  const [productsList, setProductsList] = useState<any[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [offset, setOffset] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Fetch updated list when category changes or search is submitted
  const fetchFilteredProducts = async (cat: string, search: string, reset: boolean = false) => {
    if (reset) {
      setIsFilterLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const currentOffset = reset ? 0 : offset;
    const url = `/api/products?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(search)}&limit=20&offset=${currentOffset}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (reset) {
        setProductsList(data.products || []);
        setOffset(20);
      } else {
        setProductsList(prev => [...prev, ...(data.products || [])]);
        setOffset(prev => prev + 20);
      }
      setHasMore(data.hasMore || false);
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setIsFilterLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    fetchFilteredProducts(categoryName, searchQuery, true);

    // Track category click analytics
    if (categoryName !== 'All') {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'search', query: `Category: ${categoryName}` }),
      }).catch(() => {});
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredProducts(selectedCategory, searchQuery, true);

    // Track search query analytics
    if (searchQuery.trim()) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'search', query: searchQuery.trim() }),
      }).catch(() => {});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Page Header & Wide Search Bar */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
          <Cake className="w-4 h-4 text-amber-600" />
          <span>Trivandrum Home Bakery Catalog</span>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-chocolate">
          Browse Fresh Handcrafted Cakes
        </h1>

        {/* Wide Search Bar with Search Icon & Solid Orange Search Button */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto pt-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flavor (e.g. Tender Coconut, Truffle, Mango)…"
              className="w-full bg-white border border-bakery-300/80 rounded-full py-3.5 pl-12 pr-28 text-xs sm:text-sm text-bakery-chocolate placeholder-bakery-400 shadow-soft focus:outline-none focus:border-amber-600"
            />
            <Search className="w-5 h-5 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-sm transition-all active:scale-95"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Horizontal Scroll Category Filter Pills */}
      <div className="flex items-center justify-start md:justify-center gap-2.5 overflow-x-auto pb-2 scrollbar-none max-w-full">
        {/* Default 'All' pill */}
        <button
          onClick={() => handleCategoryClick('All')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-bakery-chocolate text-white shadow-soft scale-105'
              : 'bg-white text-bakery-chocolate hover:bg-bakery-100 border border-bakery-200/80'
          }`}
        >
          All Cakes
        </button>

        {/* Admin-manageable categories */}
        {initialCategories.map((cat: any) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-bakery-chocolate text-white shadow-soft scale-105'
                  : 'bg-white text-bakery-chocolate hover:bg-bakery-100 border border-bakery-200/80'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Instant First-Paint Products Grid (No initial full page spinner!) */}
      {isFilterLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-bakery-600 font-medium">Filtering cakes...</p>
        </div>
      ) : productsList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4">
          <Cake className="w-12 h-12 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Cakes Found</h3>
          <p className="text-xs text-bakery-600">Try selecting another category or clear your search keyword.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              fetchFilteredProducts('All', '', true);
            }}
            className="text-xs font-bold text-amber-800 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Zomato / Swiggy style: 2 cols on mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {productsList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button (Infinite-scroll style pagination for mobile friendliness) */}
          {hasMore && (
            <div className="text-center pt-6">
              <button
                onClick={() => fetchFilteredProducts(selectedCategory, searchQuery, false)}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 bg-bakery-chocolate hover:bg-bakery-chocolateLight text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-soft transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Loading More Cakes...</span>
                  </>
                ) : (
                  <span>Load More Cakes</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
