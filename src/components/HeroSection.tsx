'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, PhoneCall, Check } from 'lucide-react';
import { HeroSlide } from '@/app/api/hero/route';

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'hs_1',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER',
    cardTitle: 'Belgian Chocolate Truffle',
    cardPrice: '₹750',
    linkUrl: '/shop',
  },
  {
    id: 'hs_2',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'TRIVANDRUM FAVORITE',
    cardTitle: 'Tender Coconut Dream Cake',
    cardPrice: '₹650',
    linkUrl: '/shop',
  },
  {
    id: 'hs_3',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'SEASONAL SPECIAL',
    cardTitle: 'Fresh Alphonso Mango Cake',
    cardPrice: '₹700',
    linkUrl: '/shop',
  },
];

export default function HeroSection({ initialHeroData }: { initialHeroData?: any }) {
  const [heroData, setHeroData] = useState<any>(initialHeroData || {
    badge: "Trivandrum's Most Loved Home Bakery",
    heading: "Freshly Baked Homemade Cakes Delivered in Trivandrum.",
    subheading: "Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order in 1 tap — no login or payment gateway needed!",
    ctaPrimaryText: "Explore Cake Menu",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Call Baker Direct",
    ctaSecondaryPhone: "+91 99470 66011",
    slides: FALLBACK_SLIDES,
  });

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!initialHeroData) {
      fetch('/api/hero')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.heading) {
            setHeroData(data);
          }
        })
        .catch(() => {});
    }
  }, [initialHeroData]);

  const slides: HeroSlide[] = (heroData.slides && heroData.slides.length > 0)
    ? heroData.slides
    : FALLBACK_SLIDES;

  // Auto-cycle through slides every 3 seconds if there are 2 or more slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const activeSlide = slides[activeImgIdx % slides.length] || slides[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20 bg-gradient-to-b from-bakery-softBg via-bakery-100/50 to-bakery-softBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
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
            <p className="text-xs sm:text-base text-bakery-800/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              {heroData.subheading}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                href={heroData.ctaPrimaryLink || '/shop'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-3.5 sm:py-4 rounded-full text-sm shadow-soft-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>{heroData.ctaPrimaryText || 'Explore Cake Menu'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`tel:${(heroData.ctaSecondaryPhone || '').replace(/\s+/g, '')}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-bakery-chocolate hover:bg-bakery-chocolateLight text-white font-semibold px-6 py-3.5 sm:py-4 rounded-full text-sm transition-all"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>{heroData.ctaSecondaryText || 'Call Baker Direct'}: {heroData.ctaSecondaryPhone}</span>
              </a>
            </div>

            {/* Guarantees Badges */}
            <div className="pt-5 grid grid-cols-3 gap-3 border-t border-bakery-200/60 max-w-lg mx-auto lg:mx-0">
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

          {/* Right Featured Hero Carousel Showcase Column */}
          <div className="lg:col-span-5 relative group">
            <div className="relative aspect-square w-full rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-bakery-200">
              
              {/* Cross-Fading Images Array */}
              {slides.map((slide, idx) => {
                const isActive = activeImgIdx % slides.length === idx;
                const srcUrl = imageErrors[slide.id]
                  ? (FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length]?.imageUrl || FALLBACK_SLIDES[0].imageUrl)
                  : (slide.imageUrl || FALLBACK_SLIDES[0].imageUrl);

                return (
                  <Link
                    key={slide.id || idx}
                    href={slide.linkUrl || '/shop'}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
                      isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={srcUrl}
                      alt={slide.cardTitle || `Hero cake slide ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={() => handleImageError(slide.id)}
                    />
                  </Link>
                );
              })}

              {/* Floating Highlight Cake Card Overlay (Acts as Live Redirect Link) */}
              {activeSlide && (
                <Link
                  href={activeSlide.linkUrl || '/shop'}
                  className="absolute bottom-5 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-bakery-200 shadow-xl flex items-center justify-between group/card hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-sm sm:text-base shrink-0 group-hover/card:scale-110 transition-transform">
                      🏆
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-bakery-600 font-bold block">
                        {activeSlide.cardTag || 'TRIVANDRUM FAVORITE'}
                      </span>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-bakery-chocolate group-hover/card:text-amber-800 transition-colors">
                        {activeSlide.cardTitle || 'Tender Coconut Dream Cake'}
                      </h4>
                    </div>
                  </div>

                  <span className="font-price text-sm sm:text-base font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 shrink-0 ml-2">
                    {activeSlide.cardPrice || '₹650'}
                  </span>
                </Link>
              )}

              {/* Indicator Dots at top right (Only visible if 2 or more slides exist) */}
              {slides.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveImgIdx(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeImgIdx % slides.length === idx ? 'w-5 bg-amber-400' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
