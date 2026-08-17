import React from 'react';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { Cake, Award, PhoneCall, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { db } from '@/db';
import { products, offers, orders, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';
import BelowTheFoldLazy from '@/components/BelowTheFoldLazy';

import FeaturedProductsSection from '@/components/FeaturedProductsSection';
import MoreProductsSection from '@/components/MoreProductsSection';

// Dynamic below-the-fold components
const OccasionOffersBanner = nextDynamic(() => import('@/components/OccasionOffersBanner'));
const MeetTheTeamSection = nextDynamic(() => import('@/components/MeetTheTeamSection'));
const TestimonialsSection = nextDynamic(() => import('@/components/TestimonialsSection'));

export const dynamic = 'force-dynamic';

const DEFAULT_SLIDES = [
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

const isProductFeatured = (p: any): boolean => {
  if (!p) return false;
  const val = p.isFeatured;
  return val === true || val === 1 || val === '1' || val === 'true';
};

const isProductAvailable = (p: any): boolean => {
  if (!p) return false;
  const val = p.isAvailable;
  return val === true || val === 1 || val === '1' || val === 'true' || val === undefined;
};

export default async function HomePage() {
  // Fetch active products server-side
  const allProducts = (await db.select().from(products)) || [];

  // 1. Featured Products (Curated by admin, ordered by featuredOrder or recency)
  const featuredProducts = allProducts
    .filter((p: any) => isProductAvailable(p) && isProductFeatured(p))
    .sort((a: any, b: any) => (a.featuredOrder || 0) - (b.featuredOrder || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 2. Non-Featured Products for "Fresh From The Oven / More From Our Oven" Section
  const nonFeaturedAvailableProducts = allProducts
    .filter((p: any) => isProductAvailable(p) && !isProductFeatured(p))
    .sort((a: any, b: any) => {
      const orderA = Number(a.homeSectionOrder || 0);
      const orderB = Number(b.homeSectionOrder || 0);
      if (orderA > 0 && orderB > 0) {
        if (orderA !== orderB) return orderA - orderB;
      } else if (orderA > 0) {
        return -1;
      } else if (orderB > 0) {
        return 1;
      }
      const numA = parseInt(a.id.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.id.replace(/\D/g, '') || '0', 10);
      return numB - numA || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Top Promoted Product Section: Initial 20 non-featured products
  const initialTopProducts = nonFeaturedAvailableProducts.slice(0, 20);
  const totalProductCount = nonFeaturedAvailableProducts.length;

  // 3. Most Ordered This Week (ranked list of top products by orderCount)
  const mostOrderedThisWeek = [...allProducts]
    .filter((p: any) => Boolean(p.isAvailable))
    .sort((a: any, b: any) => b.orderCount - a.orderCount)
    .slice(0, 6);

  // 4. Active Occasion Offers
  const activeOffers = (await db.select().from(offers).where(eq(offers.isActive, true)).all()) || [];
  const topDiscount = activeOffers.length > 0
    ? Math.max(...activeOffers.map((o: any) => o.discountPercent))
    : 0;

  // 5. Monthly Orders Counter
  const allOrdersList = (await db.select().from(orders).all()) || [];
  const totalOrdersCount = allOrdersList.length;
  const displayMonthlyCount = Math.max(500, 500 + totalOrdersCount * 8);

  // 6. Server-side fetch Hero Settings
  const allSettings = (await db.select().from(settings).all()) || [];
  const settingsMap = allSettings.reduce((acc: Record<string, string>, item: any) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);

  let slides = DEFAULT_SLIDES;
  if (settingsMap.hero_slides) {
    try {
      const parsed = JSON.parse(settingsMap.hero_slides);
      if (Array.isArray(parsed) && parsed.length > 0) slides = parsed;
    } catch {}
  }

  const initialHeroData = {
    badge: settingsMap.hero_badge || "Trivandrum's Most Loved Home Bakery",
    heading: settingsMap.hero_heading || "Freshly Baked Homemade Cakes Delivered in Trivandrum.",
    subheading: settingsMap.hero_subheading || "Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order easily with Google sign-in!",
    ctaPrimaryText: settingsMap.hero_cta_primary_text || "Explore Cake Menu",
    ctaPrimaryLink: settingsMap.hero_cta_primary_link || "/shop",
    ctaSecondaryText: settingsMap.hero_cta_secondary_text || "Call Baker Direct",
    ctaSecondaryPhone: settingsMap.hero_cta_secondary_phone || "+91 99470 66011",
    slides,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8 sm:py-12 pb-20">
      
      {/* 1. PROMOTED PRODUCT GRID (HOMEPAGE OPENER — 20 PRODUCTS INITIAL LOAD) */}
      <MoreProductsSection
        initialProducts={initialTopProducts}
        totalCount={totalProductCount}
        discountPercent={topDiscount}
      />

      {/* 2. OCCASION OFFERS BANNER (LAZY LOADED BELOW THE FOLD) */}
      {activeOffers.length > 0 && (
        <BelowTheFoldLazy minHeight="120px">
          <OccasionOffersBanner offers={activeOffers} />
        </BelowTheFoldLazy>
      )}

      {/* 3. MONTHLY ORDERS COUNTER HIGHLIGHT / TRUST BAR */}
      <section className="bg-bakery-cream rounded-3xl p-8 border border-bakery-200 shadow-soft text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-700 shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-price font-medium text-3xl md:text-4xl text-amber-800">
                {displayMonthlyCount}+
              </span>
              <span className="text-xs uppercase font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Verified</span>
            </div>
            <p className="text-sm font-medium text-bakery-chocolate mt-0.5">
              Cakes Ordered & Delivered Across Trivandrum This Month!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="inline-block w-9 h-9 rounded-full bg-amber-200 border-2 border-white text-xs font-bold flex items-center justify-center text-amber-900">AK</span>
            <span className="inline-block w-9 h-9 rounded-full bg-rose-200 border-2 border-white text-xs font-bold flex items-center justify-center text-rose-900">RP</span>
            <span className="inline-block w-9 h-9 rounded-full bg-emerald-200 border-2 border-white text-xs font-bold flex items-center justify-center text-emerald-900">SV</span>
          </div>
          <span className="text-xs text-bakery-800 font-semibold">
            4.9★ Rated by 1,200+ Trivandrum Families
          </span>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (ADMIN CURATED HANDPICKED FAVORITES) */}
      {featuredProducts.length > 0 && (
        <FeaturedProductsSection products={featuredProducts} discountPercent={topDiscount} />
      )}

      {/* 5. WEEKLY LEADERBOARD / MOST ORDERED THIS WEEK */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-bakery-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Weekly Leaderboard</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-bakery-chocolate">
              Most Ordered This Week
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-xs font-bold text-amber-800 hover:text-amber-600 flex items-center gap-1 underline"
          >
            <span>View All 20+ Cakes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid — 2 cols mobile, 3 cols tablet/desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {mostOrderedThisWeek.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              discountPercent={topDiscount}
            />
          ))}
        </div>
      </section>

      {/* 6. RELOCATED HERO SECTION (CLOSING CONVERSION SHOWCASE) */}
      <HeroSection initialHeroData={initialHeroData} />

      {/* 7. WHY TRIVANDRUM LOVES OUR HOME BAKERY */}
      <section className="bg-bakery-chocolate text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        <div className="max-w-full space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold">
            Why Trivandrum Loves Our Home Bakery
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 text-sm text-bakery-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">100% Home Baked Fresh</h4>
                <p className="text-xs text-bakery-300">Cakes are baked specifically after your phone confirmation. Never kept frozen.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Pure Ingredients Only</h4>
                <p className="text-xs text-bakery-300">Using real Malabar tender coconut, Amul butter, and imported Belgian chocolate.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Safe Doorstep Delivery</h4>
                <p className="text-xs text-bakery-300">Temperature-controlled delivery boxes across Kowdiar, Pattom, Technopark, Kazhakkoottam, and TVM city.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Zero Payment Stress</h4>
                <p className="text-xs text-bakery-300">Place order online without payment details. We call you to finalize details first.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MEET THE TEAM SHOWCASE CAROUSEL (LAZY LOADED) */}
      <BelowTheFoldLazy minHeight="300px">
        <MeetTheTeamSection />
      </BelowTheFoldLazy>

      {/* 9. EDITORIAL CUSTOMER TESTIMONIALS CAROUSEL (LAZY LOADED) */}
      <BelowTheFoldLazy minHeight="300px">
        <TestimonialsSection />
      </BelowTheFoldLazy>
    </div>
  );
}
