'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Cake, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/pricing';

import { useScrollLock } from '@/hooks/useScrollLock';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openProductModal } = useCart();

  useScrollLock(isOpen);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);

      // Track search query analytics silently
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'search', query: query.trim() }),
      }).catch(() => {});

      // Fetch matching products
      fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=8`)
        .then(res => res.json())
        .then(data => {
          setResults(data.products || []);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn touch-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-bakery-200 touch-auto">
        
        {/* Search Input Header */}
        <div className="p-4 bg-bakery-50 border-b border-bakery-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-700 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for cakes (e.g. Tender Coconut, Truffle, Red Velvet)..."
            className="w-full bg-transparent text-sm text-bakery-chocolate placeholder-bakery-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-bakery-400 hover:text-bakery-800">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-semibold text-bakery-600 hover:text-bakery-900 px-2 py-1">
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto overscroll-contain space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-bakery-400">Searching fresh cakes...</div>
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-bakery-400">No cakes found matching &quot;{query}&quot;. Try searching coconut, red velvet, or chocolate.</div>
          ) : results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  openProductModal(product);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-bakery-100/70 transition-colors cursor-pointer border border-transparent hover:border-bakery-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                    <Cake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-bakery-chocolate">{product.name}</h4>
                    <span className="text-[10px] text-amber-800 font-medium">{product.category} • {product.baseWeightG}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs font-bold text-bakery-chocolate">{formatINR(product.basePrice)}</span>
                  <ArrowRight className="w-4 h-4 text-amber-700" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 px-2">
              <span className="text-xs font-bold text-bakery- chocolate block mb-2">Popular Trivandrum Searches:</span>
              <div className="flex flex-wrap gap-2">
                {['Tender Coconut', 'Chocolate Truffle', 'Red Velvet', 'Cheesecake', 'Mango Gateau', 'Custom Birthday'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate px-3 py-1.5 rounded-full font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
