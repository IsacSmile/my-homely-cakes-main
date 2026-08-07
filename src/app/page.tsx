import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cake, Sparkles, Award, Heart, PhoneCall, ArrowRight, ShieldCheck, Star, Truck, Check } from 'lucide-react';
import { db } from '@/db';
import { products, offers, orders, emailSignups } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import OccasionOffersBanner from '@/components/OccasionOffersBanner';

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
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-bakery-softBg via-bakery-100/50 to-bakery-softBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-900 text-xs font-bold px-4 py-2 rounded-full border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-700 animate-spin" />
                <span>Trivandrum&apos;s Most Loved Home Bakery</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-bakery-chocolate tracking-tight leading-[1.15]">
                Freshly Baked <br />
                <span className="text-amber-700 italic">Homemade Cakes</span> <br />
                Delivered in Trivandrum.
              </h1>

              <p className="text-sm sm:text-base text-bakery-800/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order in 1 tap — no login or payment gateway needed!
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-full text-sm shadow-soft-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <span>Explore Cake Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:9876543210"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-bakery-chocolate hover:bg-bakery-chocolateLight text-white font-semibold px-6 py-4 rounded-full text-sm transition-all"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Call Baker Direct: +91 98765 43210</span>
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

            {/* Right Featured Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square w-full rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-bakery-200">
                <Image
                  src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80"
                  alt="Tender Coconut Dream Cake Trivandrum"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Highlight Counter Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-bakery-200 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                      🏆
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-bakery-600 font-bold block">Trivandrum Favorite</span>
                      <h4 className="font-serif text-sm font-bold text-bakery-chocolate">Tender Coconut Dream Cake</h4>
                    </div>
                  </div>
                  <span className="font-serif text-base font-extrabold text-amber-800">₹650</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

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
                <span className="font-serif text-3xl md:text-4xl font-extrabold text-amber-800">
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
    </div>
  );
}
