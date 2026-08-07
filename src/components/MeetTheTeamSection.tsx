'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Heart } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        if (data.members) {
          setMembers(data.members);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-advancing loop (3.5s interval) — pauses on hover or touch
  useEffect(() => {
    if (members.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % members.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [members.length, isPaused]);

  if (isLoading || members.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? members.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % members.length);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-bakery-bg via-amber-50/40 to-bakery-bg overflow-hidden border-y border-bakery-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-1 rounded-full border border-amber-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Behind The Oven Doors</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-bakery-chocolate tracking-tight">
            Meet the Hands Behind Your Cake
          </h2>

          <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed font-sans">
            The passionate home bakers and artisanal sugar decorators crafting every 100% preservative-free cake at MyHomelyCake Trivandrum.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative px-2 sm:px-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrow Left */}
          <button
            onClick={handlePrev}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 text-bakery-chocolate hover:bg-amber-600 hover:text-white shadow-soft border border-bakery-200/60 transition-all duration-200 active:scale-90"
            aria-label="Previous team member"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Navigation Arrow Right */}
          <button
            onClick={handleNext}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 text-bakery-chocolate hover:bg-amber-600 hover:text-white shadow-soft border border-bakery-200/60 transition-all duration-200 active:scale-90"
            aria-label="Next team member"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards Showcase (Responsive Grid Layout synced with currentIndex) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member, idx) => {
              // Highlight active item on mobile/tablet transitions
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={member.id}
                  className={`group bg-white rounded-3xl p-6 border transition-all duration-500 flex flex-col items-center text-center space-y-4 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 ${
                    isCurrent
                      ? 'border-amber-500/80 ring-2 ring-amber-500/20 scale-102'
                      : 'border-bakery-200/70 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Circular Photo Frame with Double Gold Accent Rings */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white ring-4 ring-amber-500/30 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={member.photoUrl || '/cake-placeholder.svg'}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 128px, 160px"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-1.5 w-full">
                    <h3 className="font-serif text-lg font-bold text-bakery-chocolate line-clamp-1">
                      {member.name}
                    </h3>
                    
                    <span className="inline-block bg-amber-50 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200/70 max-w-full truncate">
                      {member.occupation}
                    </span>
                  </div>

                  {/* Short Bio Quote */}
                  {member.bio && (
                    <p className="text-xs text-bakery-800/70 leading-relaxed line-clamp-3 italic pt-2 border-t border-bakery-100 w-full">
                      &quot;{member.bio}&quot;
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Carousel Dots Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {members.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-7 bg-amber-600'
                    : 'w-2.5 bg-bakery-300 hover:bg-bakery-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
