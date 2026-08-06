import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cake, Heart, MapPin, ShieldCheck, Award, PhoneCall } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
          <Cake className="w-4 h-4 text-amber-600" />
          <span>Our Story</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-bakery-chocolate">
          The Story Behind MyHomelyCake Trivandrum
        </h1>
        <p className="text-sm text-bakery-800/80 max-w-2xl mx-auto leading-relaxed">
          From a humble home kitchen in Kowdiar to Trivandrum&apos;s favorite home-bakery for birthdays, anniversaries, and sweet celebrations.
        </p>
      </div>

      {/* Main Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
            alt="MyHomelyCake Trivandrum Home Baker"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-4 text-sm text-bakery-800 leading-relaxed">
          <h2 className="font-serif text-2xl font-bold text-bakery-chocolate">
            Baked Fresh to Order — Never Stored, Never Preserved.
          </h2>
          <p>
            At MyHomelyCake, we believe that a cake for a special moment should taste like it was baked right at home by someone who loves you. We started our home bakery in Trivandrum with a simple promise: <strong>100% fresh baking</strong> using natural ingredients.
          </p>
          <p>
            Unlike mass commercial bakeries that freeze sponge bases for weeks, every single cake ordered at MyHomelyCake is baked from scratch only after our head baker calls to confirm your exact flavor and time preference.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-700 mx-auto flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Home Kitchen Hygiene</h3>
          <p className="text-xs text-bakery-600 leading-relaxed">
            Prepared in a sanitized home kitchen following strict food safety standards and 100% natural butter & cream.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-700 mx-auto flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Trivandrum Doorstep Delivery</h3>
          <p className="text-xs text-bakery-600 leading-relaxed">
            Serving Kowdiar, Pattom, Vellayambalam, Kazhakkoottam, Technopark, Nemom, and surrounding areas.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-700 mx-auto flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Zero Prepayment Required</h3>
          <p className="text-xs text-bakery-600 leading-relaxed">
            Submit your order free online. Our team calls you to confirm delivery timing before any payment is arranged.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-bakery-chocolate text-white rounded-3xl p-8 text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold">Planning a Celebration in Trivandrum?</h3>
        <p className="text-xs text-bakery-200 max-w-lg mx-auto">
          Need a custom theme cake or specific dietary request? Call or WhatsApp our baker directly!
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            href="/shop"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 px-6 rounded-full shadow-md transition-all"
          >
            Explore Cake Menu
          </Link>
          <a
            href="tel:9876543210"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-3 px-6 rounded-full transition-all flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>Call Baker</span>
          </a>
        </div>
      </div>
    </div>
  );
}
