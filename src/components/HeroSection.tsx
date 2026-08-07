'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, PhoneCall, Check } from 'lucide-react';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
];

export default function HeroSection() {
  const [heroData, setHeroData] = useState<any>({
    badge: "Trivandrum's Most Loved Home Bakery",
    heading: "Freshly Baked Homemade Cakes Delivered in Trivandrum.",
    subheading: "Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order in 1 tap — no login or payment gateway needed!",
    ctaPrimaryText: "Explore Cake Menu",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Call Baker Direct",
    ctaSecondaryPhone: "+91 98765 43210",
    images: FALLBACK_IMAGES,
    cardTag: "TRIVANDRUM FAVORITE",
    cardTitle: "Tender Coconut Dream Cake",
    cardPrice: "₹650",
  });

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [imageErrors, setImageErrors] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    fetch('/api/hero')
      .then(res => res.json())
      .then(data => {
        if (data && data.heading) {
          setHeroData(data);
        }
      })
      .catch(() => {});
  }, []);

  // Cycle through 3 hero images every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIdx(prev => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const heroImages = (heroData.images && heroData.images.length === 3)
    ? heroData.images
    : FALLBACK_IMAGES;

  const handleImageError = (idx: number) => {
    setImageErrors(prev => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-bakery-softBg via-bakery-100/50 to-bakery-softBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge */}
            {heroData.badge && (
              <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-900 text-xs font-bold px-4 py-2 rounded-full border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-700 animate-spin" />
                <span>{heroData.badge}</span>
              </div>
            )}

            {/* Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-bakery-chocolate tracking-tight leading-[1.15]">
              {heroData.heading}
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-bakery-800/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {heroData.subheading}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href={heroData.ctaPrimaryLink || '/shop'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-full text-sm shadow-soft-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>{heroData.ctaPrimaryText || 'Explore Cake Menu'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`tel:${(heroData.ctaSecondaryPhone || '').replace(/\s+/g, '')}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-bakery-chocolate hover:bg-bakery-chocolateLight text-white font-semibold px-6 py-4 rounded-full text-sm transition-all"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>{heroData.ctaSecondaryText || 'Call Baker Direct'}: {heroData.ctaSecondaryPhone}</span>
              </a>
            </div>

            {/* Guarantees Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-bakery-200/60 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-bakery-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No Account Needed</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-bakery-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pay on Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-bakery-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Fresh Bake</span>
              </div>
            </div>
          </div>

          {/* Right Featured Hero Image Box — Cross-Fading 3 Images Every 3s */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square w-full rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-bakery-200">
              
              {/* 3 Cross-Fading Images */}
              {[0, 1, 2].map((idx) => {
                const isActive = activeImgIdx === idx;
                const srcUrl = imageErrors[idx]
                  ? FALLBACK_IMAGES[idx]
                  : (heroImages[idx] || FALLBACK_IMAGES[idx]);

                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <Image
                      src={srcUrl}
                      alt={`Hero photo ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                      onError={() => handleImageError(idx)}
                    />
                  </div>
                );
              })}
              
              {/* Floating Highlight Counter Badge */}
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-bakery-200 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                    🏆
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-bakery-600 font-bold block">
                      {heroData.cardTag || 'TRIVANDRUM FAVORITE'}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-bakery-chocolate">
                      {heroData.cardTitle || 'Tender Coconut Dream Cake'}
                    </h4>
                  </div>
                </div>
                <span className="font-price text-base font-medium text-amber-800">
                  {heroData.cardPrice || '₹650'}
                </span>
              </div>

              {/* Indicator Dots at top right */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeImgIdx === idx ? 'w-5 bg-amber-400' : 'w-2 bg-white/60'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
