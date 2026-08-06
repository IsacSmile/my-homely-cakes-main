'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall, Cake } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-bakery-softBg/90 backdrop-blur-md border-b border-bakery-200/50 transition-all duration-300">
      {/* Top Banner Notice */}
      <div className="bg-bakery-chocolate text-bakery-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Freshly Baked Home Cakes • Express Delivery Across Trivandrum Only • Call/WhatsApp Orders</span>
        <a href="tel:9876543210" className="hidden sm:inline-flex items-center gap-1 font-semibold text-amber-300 underline ml-2">
          <PhoneCall className="w-3 h-3" /> +91 98765 43210
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full bg-amber-500/10 p-2 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <Cake className="w-7 h-7 text-amber-700" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold text-bakery-chocolate tracking-tight group-hover:text-amber-800 transition-colors">
                MyHomelyCake
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 -mt-1">
                Trivandrum Home Bakery
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
                    isActive ? 'text-amber-800 font-semibold' : 'text-bakery-chocolate/80'
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
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-200/50 transition-colors"
              aria-label="Search Cakes"
              title="Search Cakes"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2.5 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-200/50 transition-colors relative"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-bakery-chocolate text-white px-4 py-2.5 rounded-full font-medium text-sm hover:bg-bakery-chocolateLight shadow-soft hover:shadow-soft-lg transition-all duration-200 active:scale-95"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartTotalCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-bakery-chocolate hover:bg-bakery-200/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bakery-cream border-b border-bakery-200 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl font-medium text-base transition-colors ${
                pathname === link.href
                  ? 'bg-amber-500/10 text-amber-800 font-semibold'
                  : 'text-bakery-chocolate/80 hover:bg-bakery-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-bakery-200">
            <a
              href="tel:9876543210"
              className="flex items-center justify-center gap-2 w-full bg-amber-500/15 text-amber-900 font-medium py-2.5 rounded-xl text-sm"
            >
              <PhoneCall className="w-4 h-4" /> Call Baker: +91 98765 43210
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
