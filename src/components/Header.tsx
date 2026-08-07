'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const pathname = usePathname();
  const { cartTotalCount, wishlist, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to trigger floating pill header transformation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className="sticky top-0 z-40 w-full transition-all duration-300 ease-in-out pointer-events-none">
      
      {/* Top Banner Notice — Fades/Shrinks out smoothly when scrolled */}
      <div className={`bg-bakery-chocolate text-bakery-100 text-[11px] sm:text-xs text-center font-medium flex items-center justify-center gap-2 transition-all duration-300 pointer-events-auto ${
        isScrolled ? 'max-h-0 opacity-0 py-0 overflow-hidden' : 'max-h-10 opacity-100 py-1.5 px-4'
      }`}>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Freshly Baked Home Cakes • Express Delivery Across Trivandrum</span>
        <a href="tel:9876543210" className="hidden sm:inline-flex items-center gap-1 font-semibold text-amber-300 underline ml-2">
          <PhoneCall className="w-3 h-3" /> +91 98765 43210
        </a>
      </div>

      {/* TRANSFORMING HEADER BAR (Transparent at 0px -> Floating Pill Shape on Scroll) */}
      <div className={`pointer-events-auto transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'mt-2.5 mx-3 sm:mx-6 md:mx-auto max-w-5xl bg-white/95 backdrop-blur-md rounded-full border border-bakery-200/80 shadow-soft-lg px-4 sm:px-6 py-2'
          : 'w-full bg-transparent border-b border-transparent shadow-none px-4 sm:px-8 py-3.5'
      }`}>
        <div className="flex items-center justify-between">
          
          {/* Main Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-amber-500/20 group-hover:scale-105 transition-transform duration-300 shadow-xs shrink-0 bg-white p-0.5">
              <Image
                src="/logo.png"
                alt="MyHomelyCake Trivandrum Logo"
                fill
                sizes="(max-width: 640px) 36px, 44px"
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-xl font-bold text-bakery-chocolate tracking-tight group-hover:text-amber-800 transition-colors leading-none">
                MyHomelyCake
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-widest uppercase font-bold text-amber-700 mt-0.5">
                Trivandrum Bakery
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs sm:text-sm font-semibold transition-colors hover:text-amber-700 relative py-1 ${
                    isActive ? 'text-amber-800 font-bold' : 'text-bakery-chocolate/85'
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
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-100/60 transition-colors"
              aria-label="Search Cakes"
              title="Search Cakes"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-100/60 transition-colors relative"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-soft transition-all duration-200 active:scale-95"
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
              className="md:hidden p-2 rounded-xl text-bakery-chocolate hover:bg-bakery-100/60 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/98 rounded-3xl border border-bakery-200 px-4 pt-3 pb-5 mt-2 space-y-2 shadow-2xl animate-fadeIn">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-bakery-chocolate/80 hover:bg-bakery-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-bakery-100">
              <a
                href="tel:9876543210"
                className="flex items-center justify-center gap-2 w-full bg-amber-50 text-amber-900 font-bold py-2.5 rounded-2xl text-xs"
              >
                <PhoneCall className="w-4 h-4 text-amber-700" /> Call Baker: +91 98765 43210
              </a>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
