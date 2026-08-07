'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, MapPin, Heart, Mail, CheckCircle2, ShieldCheck, Lock, Clock, Truck, Moon } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (pathname.startsWith('/admin-manage')) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing! Exclusive cake offers will arrive in your inbox.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <footer className="bg-bakery-chocolate text-bakery-100 pt-16 pb-8 border-t border-amber-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & Story */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/30 bg-white p-0.5 shrink-0">
                <Image
                  src="/logo.png"
                  alt="MyHomelyCake Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                MyHomelyCake
              </span>
            </div>
            <p className="text-sm text-bakery-300/90 leading-relaxed">
              Trivandrum&apos;s premier home bakery. Crafting fresh, 100% preservative-free custom cakes using premium ingredients and traditional baking love.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/40">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Exclusively Serving Trivandrum City & Suburbs</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-bakery-300">
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition-colors">
                  Explore Cake Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  Our Home Bakery Story
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-amber-400 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-amber-400 transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Contact & Orders</h4>
            <div className="space-y-3 text-sm text-bakery-300">
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Order Hotline:</strong><br />
                  <a href="tel:9876543210" className="text-white hover:text-amber-400 font-medium">
                    +91 98765 43210
                  </a>
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Email:</strong><br />
                  <a href="mailto:orders@myhomelycakes.com" className="text-white hover:text-amber-400">
                    orders@myhomelycakes.com
                  </a>
                </span>
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>No Advance Online Payment Required</span>
              </div>
            </div>
          </div>

          {/* Working Hours & Delivery */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Hours &amp; Delivery</h4>
            <div className="space-y-3 text-sm text-bakery-300">

              {/* Weekdays */}
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-xs">Mon – Fri</p>
                  <p className="text-bakery-300 text-xs">8:30 AM – 11:30 PM</p>
                </div>
              </div>

              {/* Weekends */}
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-xs">Sat – Sun</p>
                  <p className="text-bakery-300 text-xs">9:00 AM – 11:30 PM</p>
                </div>
              </div>

              {/* 24/7 Delivery */}
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-semibold text-xs">Delivery 24/7</p>
                  <p className="text-bakery-300 text-xs">All days, any time</p>
                </div>
              </div>

              {/* Midnight Delivery */}
              <div className="flex items-start gap-2.5">
                <Moon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-indigo-300 font-semibold text-xs">Midnight Delivery</p>
                  <p className="text-bakery-300 text-xs">Surprise deliveries available</p>
                </div>
              </div>

            </div>
          </div>

          {/* Newsletter Signup Block */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Sweet Updates & Offers</h4>
            <p className="text-xs text-bakery-300 mb-3">
              Subscribe to receive Trivandrum festival discounts, weekend cake specials, and new flavor alerts!
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-bakery-chocolateLight border border-amber-900/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-bakery-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs py-2.5 rounded-xl transition-all shadow-soft active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe to Offers'}
              </button>
              {status === 'success' && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {message}
                </p>
              )}
              {status === 'error' && (
                <p className="text-xs text-rose-400 mt-1">{message}</p>
              )}
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-bakery-400">
          <p>© {new Date().getFullYear()} MyHomelyCake Trivandrum. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-bakery-300">
              Baked with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in Trivandrum
            </span>
            <Link
              href="/admin-manage"
              className="text-bakery-400/50 hover:text-amber-400 transition-colors flex items-center gap-1"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
