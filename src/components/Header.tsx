'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const pathname = usePathname();
  const { cartTotalCount, wishlist, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide public header on admin pages
  if (pathname.startsWith('/admin-manage')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop Cakes', href: '/shop' },
    { name: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-bakery-200/60 shadow-xs transition-all duration-300">
      {/* Top Banner Notice */}
      <div className="bg-bakery-chocolate text-bakery-100 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Freshly Baked Home Cakes • Express Delivery Across Trivandrum</span>
        <a href="tel:9876543210" className="hidden sm:inline-flex items-center gap-1 font-semibold text-amber-300 underline ml-2">
          <PhoneCall className="w-3 h-3" /> +91 98765 43210
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Main Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-amber-500/20 group-hover:scale-105 transition-transform duration-300 shadow-xs shrink-0 bg-white p-0.5">
              <Image
                src="/logo.png"
                alt="MyHomelyCake Trivandrum Logo"
                fill
                sizes="(max-width: 640px) 40px, 48px"
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold text-bakery-chocolate tracking-tight group-hover:text-amber-800 transition-colors leading-none">
                MyHomelyCake
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-amber-700 mt-0.5">
                Trivandrum Bakery
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-amber-700 relative py-1 ${
                    isActive ? 'text-amber-800 font-bold' : 'text-bakery-chocolate/80'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-100 transition-colors"
              aria-label="Search Cakes"
              title="Search Cakes"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-100 transition-colors relative"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-soft transition-all duration-200 active:scale-95"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/25 text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full">
                {cartTotalCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-bakery-chocolate hover:bg-bakery-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-bakery-200 px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl font-medium text-base transition-colors ${
                pathname === link.href
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-bakery-chocolate/80 hover:bg-bakery-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-bakery-100">
            <a
              href="tel:9876543210"
              className="flex items-center justify-center gap-2 w-full bg-amber-50 text-amber-900 font-bold py-2.5 rounded-xl text-xs"
            >
              <PhoneCall className="w-4 h-4 text-amber-700" /> Call Baker: +91 98765 43210
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
