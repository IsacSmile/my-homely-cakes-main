'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, ExternalLink, Store } from 'lucide-react';

export interface OutletItem {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  badge?: string;
  sortOrder: number;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

export default function OutletsSection({ initialOutlets }: { initialOutlets?: OutletItem[] }) {
  const [outlets, setOutlets] = useState<OutletItem[]>(initialOutlets || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOutlets);

  useEffect(() => {
    if (initialOutlets && initialOutlets.length > 0) return;

    fetch('/api/outlets')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.outlets)) {
          setOutlets(data.outlets);
        } else {
          setOutlets([]);
        }
      })
      .catch(() => setOutlets([]))
      .finally(() => setIsLoading(false));
  }, [initialOutlets]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <section aria-labelledby="outlets-heading" className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 id="outlets-heading" className="font-serif text-2xl sm:text-4xl font-bold text-bakery-chocolate tracking-tight">
            Our Bakery Outlets
          </h2>
          <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed">
            Visit us at one of our physical locations across Trivandrum for fresh cakes and warm hospitality.
          </p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-amber-200/60 shadow-soft animate-pulse">
              <div className="h-56 bg-amber-100/60 w-full" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-amber-200/70 rounded-md w-3/4" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-amber-100/80 rounded-md w-full" />
                  <div className="h-3 bg-amber-100/80 rounded-md w-2/3" />
                </div>
                <div className="h-10 bg-amber-200/60 rounded-xl w-full pt-2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!outlets || outlets.length === 0) {
    return null;
  }

  // Schema for LocalBusiness
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': outlets.map((outlet) => ({
      '@type': 'Bakery',
      '@id': `https://myhomelycake.com/#outlet-${outlet.id}`,
      name: outlet.name,
      description: 'Handcrafted fresh cakes, birthday cakes, and bakery specialties.',
      image: outlet.imageUrl || FALLBACK_IMAGE,
      address: {
        '@type': 'PostalAddress',
        streetAddress: outlet.address,
        addressLocality: 'Thiruvananthapuram',
        addressRegion: 'Kerala',
        addressCountry: 'IN',
      },
      url: 'https://myhomelycake.com/about',
    })),
  };

  return (
    <section aria-labelledby="outlets-heading" className="space-y-5 sm:space-y-7">
      {/* JSON-LD LocalBusiness SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* Section Header */}
      <div className="text-center space-y-1.5 sm:space-y-2 max-w-2xl mx-auto">
        <h2
          id="outlets-heading"
          className="font-serif text-2xl sm:text-4xl font-bold text-bakery-chocolate tracking-tight"
        >
          Visit Our Outlets
        </h2>
        
        <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed max-w-xl mx-auto font-normal">
          Experience our fresh baked delights in person at any of our outlets across Thiruvananthapuram.
        </p>

        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full opacity-80" />
      </div>

      {/* Outlets Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {outlets.map((outlet) => {
          const mapQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(outlet.address)}`;
          const rawUrl = outlet.imageUrl || FALLBACK_IMAGE;
          const optimizedSrc = rawUrl.includes('unsplash.com') && !rawUrl.includes('w=')
            ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&w=800&q=80`
            : rawUrl;

          return (
            <article
              key={outlet.id}
              className="group bg-white rounded-[2rem] overflow-hidden border border-amber-200/70 shadow-[0_10px_30px_rgba(69,26,3,0.04)] hover:shadow-[0_20px_40px_rgba(180,83,9,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                {/* Storefront Image Container */}
                <div className="relative h-52 sm:h-56 w-full bg-amber-100/50 overflow-hidden">
                  <Image
                    src={optimizedSrc}
                    alt={`${outlet.name} storefront image in Trivandrum`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Smooth Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
                  
                  <span className="absolute top-3.5 right-3.5 bg-amber-900/80 text-amber-100 font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-xs shadow-xs border border-amber-700/50 z-10">
                    {outlet.badge || 'Trivandrum Store'}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-3.5">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-bakery-chocolate leading-snug group-hover:text-amber-800 transition-colors">
                    {outlet.name}
                  </h3>

                  <div className="flex items-start gap-2.5 text-xs text-bakery-800/85 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <address className="not-italic text-[11px] sm:text-xs leading-snug font-normal">
                      {outlet.address}
                    </address>
                  </div>
                </div>
              </div>

              {/* Card Footer Action Button */}
              <div className="p-6 pt-0">
                <a
                  href={mapQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${outlet.name} on Google Maps`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 group/btn cursor-pointer"
                >
                  <span>View Location on Map</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover/btn:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
