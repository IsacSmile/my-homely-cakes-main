'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, MessageSquareQuote, Star, CheckCircle2 } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  cakeName: string;
  rating: number;
  quote: string;
  initials: string;
  avatarBg: string;
  sortOrder: number;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Anjali Nair',
    location: 'Kowdiar, Trivandrum',
    cakeName: 'Tender Coconut Dream Cake',
    rating: 5,
    quote: 'The Tender Coconut cake for my daughter’s 1st birthday was an absolute dream! So fresh, perfectly moist, and zero artificial sweetness. Everyone at the party asked where we ordered it from.',
    initials: 'AN',
    avatarBg: 'bg-amber-100 text-amber-900 border-amber-300',
    sortOrder: 1,
  },
  {
    id: 't2',
    name: 'Dr. Suresh Kumar',
    location: 'Pattom, Trivandrum',
    cakeName: 'Belgian Chocolate Truffle',
    rating: 5,
    quote: 'Ordered the Belgian Chocolate Truffle for our wedding anniversary. Delivery was right on time at 7 PM and the cake melted in our mouths. 100% authentic home bakery quality!',
    initials: 'SK',
    avatarBg: 'bg-rose-100 text-rose-900 border-rose-300',
    sortOrder: 2,
  },
  {
    id: 't3',
    name: 'Pooja & Deepak',
    location: 'Technopark, Kazhakkoottam',
    cakeName: 'Red Velvet Cream Cheese',
    rating: 5,
    quote: 'We order cakes for all our team birthdays at Technopark from MyHomelyCake. The online 1-tap ordering with cash/UPI on delivery is so convenient and completely stress-free.',
    initials: 'PD',
    avatarBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    sortOrder: 3,
  },
];

export default function TestimonialsSection() {
  const [data, setData] = useState<{
    eyebrow: string;
    heading: string;
    subheading: string;
    testimonials: Testimonial[];
  }>({
    eyebrow: 'Customer Stories',
    heading: 'What Our Customers Say',
    subheading: 'Real stories from the people who made their celebrations a little sweeter with MyHomelyCake.',
    testimonials: FALLBACK_TESTIMONIALS,
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch reviews dynamically from API
  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.testimonials && resData.testimonials.length > 0) {
          setData(resData);
        }
      })
      .catch(() => {});
  }, []);

  const items = data.testimonials || FALLBACK_TESTIMONIALS;

  // Update active slide index based on scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;
    const cardWidth = 380;
    const index = Math.floor((el.scrollLeft + 100) / cardWidth) % items.length;
    setActiveSlideIndex(index);
  };

  // Continuous smooth auto-scroll loop via requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;

    let lastTime = performance.now();
    const speed = 0.35; // smooth, comfortable, luxury pace

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isInteracting && !isDragging.current) {
        el.scrollLeft += (speed * delta) / 16.6;

        // Loop seamlessly when reaching halfway
        const maxScroll = el.scrollWidth / 2;
        if (el.scrollLeft >= maxScroll) {
          el.scrollLeft = 0;
        }
      }

      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isInteracting, items.length]);

  // Duplicate items for infinite loop preview
  const displayTestimonials = [...items, ...items, ...items, ...items];

  // Pause & Resume Helpers
  const pauseAutoScroll = () => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const resumeAutoScroll = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2500);
  };

  // Desktop Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
    pauseAutoScroll();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      resumeAutoScroll();
    }
  };

  // Manual Editorial Arrow Controls
  const handleScrollLeft = () => {
    pauseAutoScroll();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
    resumeAutoScroll();
  };

  const handleScrollRight = () => {
    pauseAutoScroll();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
    resumeAutoScroll();
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F2] text-[#2C1A14] overflow-hidden border-t border-b border-[#EAD1B6]/50 relative">
      
      {/* Editorial Decorative Whisk / Bakery Line Motif */}
      <div className="absolute top-8 left-8 opacity-5 pointer-events-none hidden lg:block">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180C144.183 180 180 144.183 180 100" stroke="#2C1A14" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M100 40L100 160" stroke="#8E552D" strokeWidth="1.5" />
          <path d="M40 100L160 100" stroke="#8E552D" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER — Dynamic settings with exact typography scale */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          
          {/* Left Column: Typography Hierarchy */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
              <MessageSquareQuote className="w-4 h-4 text-amber-600" />
              <span>{data.eyebrow}</span>
            </div>

            <h2 className="font-serif text-3xl font-bold text-bakery-chocolate">
              {data.heading}
            </h2>

            <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed font-sans pt-0.5">
              {data.subheading}
            </p>
          </div>

          {/* Right Column: Sleek Editorial Navigation Controls (← 01 / 06 →) */}
          <div className="flex items-center gap-6 self-start md:self-end">
            
            {/* Slide Counter (01 / 06) */}
            <div className="font-mono text-xs font-semibold tracking-wider text-[#6B3E20]">
              <span className="text-[#2C1A14] font-bold text-sm">
                {String((activeSlideIndex % items.length) + 1).padStart(2, '0')}
              </span>
              <span className="mx-1.5 opacity-40">/</span>
              <span className="opacity-60">{String(items.length).padStart(2, '0')}</span>
            </div>

            {/* Editorial Minimal Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleScrollLeft}
                className="p-3 rounded-full border border-[#2C1A14]/20 hover:border-[#2C1A14] text-[#2C1A14] hover:bg-[#2C1A14] hover:text-white transition-all duration-300 active:scale-95 shadow-xs"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleScrollRight}
                className="p-3 rounded-full border border-[#2C1A14]/20 hover:border-[#2C1A14] text-[#2C1A14] hover:bg-[#2C1A14] hover:text-white transition-all duration-300 active:scale-95 shadow-xs"
                aria-label="Next testimonial"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* EDITORIAL TESTIMONIAL CAROUSEL (3 visible on desktop + peek of next) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseEnter={pauseAutoScroll}
          onMouseLeave={() => {
            handleMouseUp();
            resumeAutoScroll();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={pauseAutoScroll}
          onTouchEnd={resumeAutoScroll}
          className="flex flex-nowrap gap-5 sm:gap-6 overflow-x-auto select-none no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x pb-6 pt-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayTestimonials.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[300px] sm:w-[370px] shrink-0 bg-white/95 rounded-3xl p-6 sm:p-7 border border-[#EAD1B6]/70 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 group relative overflow-hidden"
            >
              {/* Top Row: 5-Star Rating & Subtle Quote Mark */}
              <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <span className="font-serif text-3xl font-extrabold text-[#D97706]/20 leading-none group-hover:text-[#D97706]/40 transition-colors">
                  “
                </span>
              </div>

              {/* Middle: Testimonial Quote */}
              <p className="text-xs sm:text-sm text-[#2C1A14]/85 leading-relaxed font-sans italic">
                &quot;{item.quote}&quot;
              </p>

              {/* Cake Ordered Tag */}
              <div className="pt-1">
                <span className="inline-block bg-[#FAF4EB] text-[#8E552D] text-[10px] font-bold px-3 py-1 rounded-full border border-[#EAD1B6]/60">
                  🎂 Ordered: {item.cakeName}
                </span>
              </div>

              {/* Bottom Row: Customer Avatar, Name & Location */}
              <div className="pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border-2 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${item.avatarBg || 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                    {item.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-sm font-bold text-[#2C1A14]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[#6B3E20] font-medium">
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Progress Bar Indicator */}
        <div className="mt-8 max-w-xs mx-auto h-0.5 bg-[#EAD1B6]/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8E552D] transition-all duration-300 rounded-full"
            style={{ width: `${((activeSlideIndex + 1) / items.length) * 100}%` }}
          />
        </div>

      </div>
    </section>
  );
}
