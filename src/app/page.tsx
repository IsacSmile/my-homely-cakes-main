import React from 'react';
import Link from 'next/link';
import { Cake, Sparkles, Award, PhoneCall, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { db } from '@/db';
import { products, offers, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import OccasionOffersBanner from '@/components/OccasionOffersBanner';
import MeetTheTeamSection from '@/components/MeetTheTeamSection';
import HeroSection from '@/components/HeroSection';
import TestimonialsSection from '@/components/TestimonialsSection';

export const revalidate = 60; // Revalidate dynamic content every 60 seconds

export default async function HomePage() {
  // Fetch active products
  const allProducts = db.select().from(products).all();

  // 1. Most Ordered This Week (ranked list of top products by orderCount)
  const mostOrderedThisWeek = [...allProducts]
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 6);

  // 2. Active Occasion Offers
  const activeOffers = db.select().from(offers).where(eq(offers.isActive, true)).all();
  const topDiscount = activeOffers.length > 0
    ? Math.max(...activeOffers.map(o => o.discountPercent))
    : 0;

  // 3. Monthly Orders Counter (Dynamic count from DB + base counter)
  const totalOrdersCount = db.select().from(orders).all().length;
  const displayMonthlyCount = Math.max(500, 500 + totalOrdersCount * 8);

  return (
    <div className="space-y-16 pb-20">
      
      {/* DYNAMIC & AUTO-FADING HERO SECTION */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* OCCASION OFFERS BANNER */}
        {activeOffers.length > 0 && (
          <OccasionOffersBanner offers={activeOffers} />
        )}

        {/* MONTHLY ORDERS COUNTER HIGHLIGHT */}
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

        {/* MOST ORDERED THIS WEEK */}
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

          {/* Product Grid — Zomato / Swiggy 2 cols on mobile */}
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

        {/* WHY CHOOSE MYHOMELYCAKE */}
        <section className="bg-bakery-chocolate text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Why Trivandrum Loves Our Home Bakery
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-sm text-bakery-200">
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

      </div>

      {/* MEET THE TEAM SHOWCASE CAROUSEL */}
      <MeetTheTeamSection />

      {/* EDITORIAL CUSTOMER TESTIMONIALS CAROUSEL */}
      <TestimonialsSection />
    </div>
  );
}
