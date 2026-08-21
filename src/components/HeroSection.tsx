'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, PhoneCall, Check, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { HeroSlide } from '@/app/api/hero/route';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/context/CartContext';

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'cake_2',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER #1',
    cardTitle: 'Belgian Chocolate Truffle Cake',
    cardPrice: '₹700',
    linkUrl: '/shop?product=cake_2',
    productId: 'cake_2',
  },
  {
    id: 'cake_3',
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'TOP FAVORITE',
    cardTitle: 'Nutella Hazelnut Crunch',
    cardPrice: '₹800',
    linkUrl: '/shop?product=cake_3',
    productId: 'cake_3',
  },
  {
    id: 'cake_1',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'POPULAR CHOICE',
    cardTitle: 'Tender Coconut Dream Cake',
    cardPrice: '₹650',
    linkUrl: '/shop?product=cake_1',
    productId: 'cake_1',
  },
  {
    id: 'cake_16',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER #4',
    cardTitle: 'Ferrero Rocher Hazelnut Drip Cake',
    cardPrice: '₹890',
    linkUrl: '/shop?product=cake_16',
    productId: 'cake_16',
  },
  {
    id: 'cake_8',
    imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER #5',
    cardTitle: 'Black Forest Royale',
    cardPrice: '₹600',
    linkUrl: '/shop?product=cake_8',
    productId: 'cake_8',
  },
];

export default function HeroSection({ initialHeroData }: { initialHeroData?: any }) {
  const { data: session, status } = useSession();
  const cart = useCart();
  const openProductModal = cart?.openProductModal;
  const [heroData, setHeroData] = useState<any>(initialHeroData || {
    badge: "Trivandrum's Most Loved Home Bakery",
    heading: "Freshly Baked Homemade Cakes Delivered in Trivandrum.",
    subheading: "Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order easily with Google sign-in!",
    ctaPrimaryText: "Explore Cake Menu",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Call Baker Direct",
    ctaSecondaryPhone: "+91 99470 66011",
    slides: FALLBACK_SLIDES,
  });

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Extract first name safely for logged-in user
  const rawName = session?.user?.name || '';
  const firstName = rawName.split(' ')[0]?.trim();
  const formattedFirstName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : '';

  const welcomeGreeting = (isMounted && status === 'authenticated' && formattedFirstName)
    ? `Welcome back, ${formattedFirstName}`
    : 'Welcome to MyHomelyCake';

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 bg-gradient-to-b from-amber-500/10 via-bakery-100/60 to-amber-500/5 rounded-3xl border border-amber-200/60 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            
            {/* Short Personalized Eyebrow Welcome Line */}
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{welcomeGreeting}</span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold text-bakery-chocolate tracking-tight leading-[1.15]">
              {heroData.heading}
            </h2>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-base text-bakery-800/80 max-w-xl mx-auto md:mx-0 leading-relaxed font-sans">
              {heroData.subheading}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5">
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
            <div className="pt-4 sm:pt-5 grid grid-cols-3 gap-1.5 sm:gap-3 border-t border-bakery-200/60 max-w-lg mx-auto md:mx-0">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold text-bakery-900 leading-tight">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>Track Order Online</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold text-bakery-900 leading-tight">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>Pay on Delivery</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold text-bakery-900 leading-tight">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>100% Fresh Bake</span>
              </div>
            </div>
          </div>

          {/* Right Featured Hero Carousel Showcase Column */}
          <div className="md:col-span-5 relative group max-w-md mx-auto md:max-w-none w-full">
            <div className="relative aspect-square w-full rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-bakery-200">
              
              {/* Skeleton background placeholder */}
              <Skeleton className="absolute inset-0 z-0 w-full h-full rounded-none" />
              
              {/* Cross-Fading Images Array */}
              {slides.map((slide: any, idx: number) => {
                const isActive = activeImgIdx % slides.length === idx;
                const srcUrl = imageErrors[slide.id]
                  ? (FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length]?.imageUrl || FALLBACK_SLIDES[0].imageUrl)
                  : (slide.imageUrl || FALLBACK_SLIDES[0].imageUrl);

                const handleSlideClick = (e: React.MouseEvent) => {
                  if (openProductModal && slide.product) {
                    e.preventDefault();
                    openProductModal(slide.product);
                  }
                };

                return (
                  <div
                    key={slide.id || idx}
                    onClick={handleSlideClick}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
                      isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={srcUrl}
                      alt={slide.cardTitle || `Best selling cake slide ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={() => handleImageError(slide.id)}
                    />
                  </div>
                );
              })}

              {/* Prev / Next Arrows on Hover */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev - 1 + slides.length) % slides.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-25 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    aria-label="Previous best seller"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev + 1) % slides.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-25 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    aria-label="Next best seller"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Floating Highlight Cake Card Overlay */}
              {activeSlide && (
                <div
                  onClick={(e) => {
                    if (openProductModal && activeSlide.product) {
                      e.preventDefault();
                      openProductModal(activeSlide.product);
                    }
                  }}
                  className="absolute bottom-5 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-bakery-200 shadow-xl flex items-center justify-between group/card hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold shrink-0 group-hover/card:scale-110 transition-transform">
                      <Award className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-700 font-bold block">
                        {activeSlide.cardTag || 'BESTSELLER'}
                      </span>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-bakery-chocolate group-hover/card:text-amber-800 transition-colors">
                        {activeSlide.cardTitle}
                      </h4>
                    </div>
                  </div>

                  <span className="font-price text-sm sm:text-base font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 shrink-0 ml-2">
                    {activeSlide.cardPrice}
                  </span>
                </div>
              )}

              {/* Indicator Dots at top right (Only visible if 2 or more slides exist) */}
              {slides.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
                  {slides.map((slide: any, idx: number) => (
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
