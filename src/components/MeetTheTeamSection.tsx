'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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

  // Continuous smooth auto-scroll loop via requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || members.length === 0) return;

    let lastTime = performance.now();
    const speed = 0.5; // pixels per frame (smooth & comfortable)

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
    }, 2000);
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

  // Manual Arrow Controls
  const handleScrollLeft = () => {
    pauseAutoScroll();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
    resumeAutoScroll();
  };

  const handleScrollRight = () => {
    pauseAutoScroll();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
    resumeAutoScroll();
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-bakery-bg via-amber-50/30 to-bakery-bg border-y border-bakery-200/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-1 rounded-full border border-amber-200/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Behind The Oven Doors</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-bakery-chocolate tracking-tight">
              Meet the Hands Behind Your Cake
            </h2>

            <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed">
              The passionate home bakers and artisanal sugar decorators crafting every 100% preservative-free cake at MyHomelyCake Trivandrum.
            </p>
          </div>

          {/* Carousel Manual Prev / Next Buttons */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={handleScrollLeft}
              className="p-3 rounded-full bg-white hover:bg-amber-600 text-bakery-chocolate hover:text-white shadow-soft border border-bakery-200/70 transition-all duration-200 active:scale-95"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleScrollRight}
              className="p-3 rounded-full bg-white hover:bg-amber-600 text-bakery-chocolate hover:text-white shadow-soft border border-bakery-200/70 transition-all duration-200 active:scale-95"
              aria-label="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FULL HORIZONTAL CAROUSEL (Single-row on mobile, touch swipe + desktop drag) */}
        <div
          ref={scrollRef}
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
          className="flex flex-nowrap gap-5 overflow-x-auto select-none no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x pb-4 pt-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayMembers.map((member, idx) => (
            <div
              key={`${member.id}-${idx}`}
              className="w-[260px] sm:w-[300px] shrink-0 bg-white rounded-3xl p-6 border border-bakery-200/60 shadow-soft hover:shadow-soft-lg hover:border-amber-400/80 transition-all duration-300 flex flex-col items-center text-center space-y-4 group transform hover:-translate-y-1"
            >
              {/* Circular Photo with Soft Warm Ambient Ring */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white ring-4 ring-amber-500/20 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={member.photoUrl || '/cake-placeholder.svg'}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100px, 112px"
                  className="object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Name & Occupation */}
              <div className="space-y-1 w-full">
                <h3 className="font-serif text-base sm:text-lg font-bold text-bakery-chocolate line-clamp-1">
                  {member.name}
                </h3>
                
                <span className="inline-block bg-amber-50 text-amber-900 text-[11px] font-semibold px-3 py-0.5 rounded-full border border-amber-200/70 max-w-full truncate">
                  {member.occupation}
                </span>
              </div>

              {/* Short Bio Quote */}
              {member.bio && (
                <p className="text-xs text-bakery-800/70 leading-relaxed line-clamp-2 italic pt-2 border-t border-bakery-100 w-full">
                  &quot;{member.bio}&quot;
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
