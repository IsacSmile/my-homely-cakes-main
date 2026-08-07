'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  photoUrl: string;
  bio?: string | null;
  sortOrder: number;
}

export default function MeetTheTeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        if (data.members && data.members.length > 0) {
          setMembers(data.members);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Update active slide index based on scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || members.length === 0) return;
    const cardWidth = 360;
    const index = Math.floor((el.scrollLeft + 100) / cardWidth) % members.length;
    setActiveSlideIndex(index);
  };

  // Continuous smooth auto-scroll loop via requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || members.length === 0) return;

    let lastTime = performance.now();
    const speed = 0.4; // smooth, comfortable, luxury pace

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
  }, [members.length, isInteracting]);

  if (isLoading || members.length === 0) return null;

  // Duplicate members for infinite loop preview
  const displayMembers = [...members, ...members, ...members, ...members];

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
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
    resumeAutoScroll();
  };

  const handleScrollRight = () => {
    pauseAutoScroll();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
    resumeAutoScroll();
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] text-[#2C1A14] overflow-hidden border-t border-b border-[#EAD1B6]/50 relative">
      
      {/* Editorial Decorative Background Motif (Subtle Line Illustration) */}
      <div className="absolute top-10 right-10 opacity-5 pointer-events-none hidden lg:block">
        <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M120 20C64.7715 20 20 64.7715 20 120C20 175.228 64.7715 220 120 220C175.228 220 220 175.228 220 120" stroke="#2C1A14" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M120 40C75.8172 40 40 75.8172 40 120C40 164.183 75.8172 200 120 200" stroke="#8E552D" strokeWidth="1.5" />
          <circle cx="120" cy="120" r="30" stroke="#D97706" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* EDITORIAL HERO SECTION HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14 sm:mb-20">
          
          {/* Left Column: Typography Hierarchy */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#8E552D]/60" />
              <span className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#8E552D]">
                Behind The Oven Doors
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2C1A14] tracking-tight leading-[1.12]">
              Meet the Hands <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#8E552D]">Behind Your Cake</span>
            </h2>

            <p className="text-sm sm:text-base text-[#4D2B16]/80 max-w-xl leading-relaxed font-sans pt-1">
              The passionate home bakers and artisanal sugar decorators crafting every 100% preservative-free cake at MyHomelyCake Trivandrum.
            </p>
          </div>

          {/* Right Column: Sleek Editorial Navigation (← 01 / 04 →) */}
          <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#EAD1B6]/60">
            
            {/* Slide Counter (01 / 04) */}
            <div className="font-mono text-xs font-semibold tracking-wider text-[#6B3E20]">
              <span className="text-[#2C1A14] font-bold text-sm">
                {String((activeSlideIndex % members.length) + 1).padStart(2, '0')}
              </span>
              <span className="mx-1.5 opacity-40">/</span>
              <span className="opacity-60">{String(members.length).padStart(2, '0')}</span>
            </div>

            {/* Editorial Minimal Arrow Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleScrollLeft}
                className="p-3 rounded-full border border-[#2C1A14]/20 hover:border-[#2C1A14] text-[#2C1A14] hover:bg-[#2C1A14] hover:text-white transition-all duration-300 active:scale-95 shadow-xs"
                aria-label="Previous team member"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleScrollRight}
                className="p-3 rounded-full border border-[#2C1A14]/20 hover:border-[#2C1A14] text-[#2C1A14] hover:bg-[#2C1A14] hover:text-white transition-all duration-300 active:scale-95 shadow-xs"
                aria-label="Next team member"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ASYMMETRICAL EDITORIAL PORTRAIT CAROUSEL */}
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
          className="flex flex-nowrap gap-6 sm:gap-8 overflow-x-auto select-none no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x pb-6 pt-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayMembers.map((member, idx) => {
            // Asymmetrical height variation for magazine composition feel
            const isOdd = idx % 2 === 1;

            return (
              <div
                key={`${member.id}-${idx}`}
                className={`w-[280px] sm:w-[340px] shrink-0 group flex flex-col justify-between transition-transform duration-500 ${
                  isOdd ? 'sm:mt-6' : ''
                }`}
              >
                {/* Large Editorial Arch Portrait Frame */}
                <div className="relative h-[360px] sm:h-[420px] w-full rounded-t-[4rem] rounded-b-2xl overflow-hidden bg-[#F5EFE6] shadow-soft border border-[#EAD1B6]/60">
                  <Image
                    src={member.photoUrl || '/cake-placeholder.svg'}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 280px, 340px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    draggable={false}
                  />

                  {/* Gradient Overlay & Role Tag */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A14]/80 via-[#2C1A14]/20 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />

                  {/* Top Subtle Number Badge */}
                  <span className="absolute top-4 right-5 font-mono text-[10px] font-bold text-white/70 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
                    ARTISAN 0{(idx % members.length) + 1}
                  </span>

                  {/* Content Overlay inside Portrait */}
                  <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#F59E0B] block">
                      {member.occupation}
                    </span>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                      {member.name}
                    </h3>

                    {member.bio && (
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-sans pt-1 border-t border-white/15">
                        &quot;{member.bio}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Minimalist Sub-Text Line */}
                <div className="pt-3 px-1 flex items-center justify-between text-xs text-[#8E552D] font-medium">
                  <span className="truncate">MyHomelyCake Trivandrum</span>
                  <span className="font-mono text-[10px] text-[#6B3E20]">Craft Member</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Indicator */}
        <div className="mt-10 max-w-xs mx-auto h-0.5 bg-[#EAD1B6]/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8E552D] transition-all duration-300 rounded-full"
            style={{ width: `${((activeSlideIndex + 1) / members.length) * 100}%` }}
          />
        </div>

      </div>
    </section>
  );
}
