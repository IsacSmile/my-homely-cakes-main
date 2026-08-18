'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Offer {
  id: string;
  heading: string;
  discountPercent: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export default function OccasionOffersBanner({ offers }: { offers?: Offer[] }) {
  const [activeOffers, setActiveOffers] = useState<Offer[]>(offers || []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!offers) {
      fetch('/api/offers')
        .then(res => res.json())
        .then(data => {
          if (data.offers) {
            setActiveOffers(data.offers.filter((o: Offer) => o.isActive));
          }
        })
        .catch(() => {});
    }
  }, [offers]);

  if (!activeOffers || activeOffers.length === 0) return null;

  const currentOffer = activeOffers[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-bakery-chocolate text-white p-6 sm:p-8 shadow-soft-lg border border-amber-500/30">
      {/* Decorative SVG Patterns */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-200 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Limited Occasion Special</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {currentOffer.heading}
          </h3>

          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            Get an instant <span className="font-bold text-amber-300 text-base">{currentOffer.discountPercent}% OFF</span> on all fresh cake orders placed this week across Trivandrum!
          </p>

          {isMounted && currentOffer.endDate && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span suppressHydrationWarning>Offer Valid Until: {new Date(currentOffer.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 bg-white text-bakery-chocolate hover:bg-amber-100 font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-md transition-all duration-200 shrink-0 hover:scale-105 active:scale-95"
        >
          <span>Claim Offer & Browse Cakes</span>
          <ArrowRight className="w-4 h-4 text-amber-700" />
        </Link>
      </div>
    </div>
  );
}
