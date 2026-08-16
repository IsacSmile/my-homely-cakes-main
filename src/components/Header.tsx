'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall, Package, LogOut, ChevronDown, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { handleGoogleSignIn, handleGoogleSignOut } from '@/lib/auth-toast';
import { useScrollLock } from '@/hooks/useScrollLock';

function UserAvatar({ image, name, size = 32 }: { image?: string | null; name?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || 'U').charAt(0).toUpperCase();

  if (image && !imgError) {
    return (
      <div
        className="relative rounded-full overflow-hidden shrink-0 border border-amber-300 bg-amber-100 flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: size >= 36 ? '15px' : '12px',
      }}
    >
      {initial}
    </div>
  );
}

export default function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { cartTotalCount, wishlist, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle click outside & escape key to close profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  // Lock body scroll when mobile menu is open
  useScrollLock(mobileMenuOpen);

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
    <header className="sticky top-0 z-50 w-full transition-all duration-300 ease-out gpu-header">
      
      {/* Top Banner Notice - Smooth Height & Opacity Collapse */}
      <div className={`bg-bakery-chocolate text-bakery-100 text-[11px] sm:text-xs text-center font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out origin-top gpu-header ${
        isScrolled ? 'max-h-0 opacity-0 py-0 overflow-hidden' : 'max-h-12 opacity-100 py-1.5 px-3 sm:px-4'
      }`}>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="truncate">Freshly Baked Home Cakes • Express Delivery Across Trivandrum</span>
        <a href="tel:919947066011" className="hidden sm:inline-flex items-center gap-1 font-semibold text-amber-300 underline ml-2 shrink-0">
          <PhoneCall className="w-3 h-3" /> +91 99470 66011
        </a>
      </div>

      {/* TRANSFORMING HEADER BAR - Hardware Accelerated Mobile & Desktop Morphing */}
      <div className={`transition-all duration-300 ease-out gpu-header ${
        isScrolled
          ? 'sm:mt-2 mx-auto w-full sm:w-[calc(100%-1rem)] max-w-5xl bg-white/95 backdrop-blur-md rounded-none sm:rounded-full border-b sm:border border-bakery-200/80 shadow-soft-lg px-3 sm:px-6 py-2 sm:py-2'
          : 'mt-0 w-full max-w-full bg-white/90 backdrop-blur-md border-b border-bakery-200/50 shadow-xs px-3 sm:px-8 py-2.5 sm:py-3 rounded-none'
      }`}>
        <div className="flex items-center justify-between gap-1 max-w-full relative">
          
          {/* Main Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-h-[38px] sm:min-h-[44px] shrink-0 min-w-0">
            <div className={`relative rounded-full overflow-hidden border border-amber-500/20 group-hover:scale-105 transition-all duration-500 ease-out shadow-xs shrink-0 bg-white p-0.5 ${
              isScrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-9 h-9 sm:w-11 sm:h-11'
            }`}>
              <Image
                src="/logo.png"
                alt="MyHomelyCake Trivandrum Logo"
                fill
                sizes="(max-width: 640px) 36px, 44px"
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0 transition-all duration-500 ease-out">
              <span className={`font-serif font-bold text-bakery-chocolate tracking-tight group-hover:text-amber-800 transition-colors leading-none truncate max-w-[105px] min-[360px]:max-w-[140px] sm:max-w-none ${
                isScrolled ? 'text-xs sm:text-lg' : 'text-sm sm:text-xl'
              }`}>
                MyHomelyCake
              </span>
              <span className="text-[7px] sm:text-[10px] tracking-widest uppercase font-bold text-amber-700 mt-0.5 truncate hidden min-[360px]:block">
                Trivandrum Bakery
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Nav Links */}
          <nav className="hidden md:flex items-center md:gap-3.5 lg:gap-7">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs sm:text-sm font-semibold transition-colors hover:text-amber-700 relative py-1 min-h-[44px] flex items-center shrink-0 ${
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
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2.5 shrink-0">
            
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2.5 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-100/60 transition-colors min-w-[34px] min-h-[34px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Search Cakes"
              title="Search Cakes"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Icon (Desktop & Tablet; also accessible inside mobile drawer) */}
            <Link
              href="/wishlist"
              className="hidden sm:flex p-2 sm:p-2.5 rounded-full text-bakery-chocolate/80 hover:text-amber-800 hover:bg-bakery-100/60 transition-colors relative min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] items-center justify-center"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {isMounted && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Google Authentication Button / User Profile (Desktop & Tablet only; Mobile is inside Hamburger Menu) */}
            <div className="hidden sm:block relative" ref={userMenuRef}>
              {isMounted && status === 'authenticated' && session?.user ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUserMenuOpen(prev => !prev);
                    }}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-amber-300/80 bg-white hover:bg-amber-50 transition-colors min-h-[38px] sm:min-h-[44px] cursor-pointer max-w-[140px] lg:max-w-[190px] shadow-xs active:scale-95"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <UserAvatar image={session.user.image} name={session.user.name} size={26} />
                    <span className="text-xs font-bold text-bakery-chocolate truncate max-w-[65px] lg:max-w-[120px]">
                      {session.user.name || 'Account'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-bakery-600 shrink-0 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-bakery-200 shadow-2xl py-2 z-50 animate-scaleIn">
                      <div className="px-4 py-2 border-b border-bakery-100 flex items-center gap-2.5">
                        <UserAvatar image={session.user.image} name={session.user.name} size={36} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-bakery-chocolate truncate">{session.user.name}</p>
                          <p className="text-[10px] text-bakery-600 truncate">{session.user.email}</p>
                        </div>
                      </div>

                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-bakery-chocolate hover:bg-amber-50 hover:text-amber-900 transition-colors"
                      >
                        <Package className="w-4 h-4 text-amber-700" />
                        My Orders
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleGoogleSignOut('/');
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-bakery-100 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-bakery-50 text-bakery-chocolate border border-bakery-200/90 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-semibold text-xs transition-all shadow-xs min-h-[40px] sm:min-h-[44px] cursor-pointer"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="hidden lg:inline">Sign in with Google</span>
                  <span className="inline lg:hidden">Sign In</span>
                </button>
              )}
            </div>


            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-soft transition-all duration-200 active:scale-95 min-h-[36px] sm:min-h-[44px] cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-200 shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/25 text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full">
                {isMounted ? cartTotalCount : 0}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-bakery-chocolate hover:bg-bakery-100/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay Navigation */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn md:hidden touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-slideInRight touch-auto overflow-y-auto overscroll-contain">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-bakery-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-500/20 bg-white p-0.5 shrink-0">
                    <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <span className="font-serif text-lg font-bold text-bakery-chocolate">MyHomelyCake</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-full text-bakery-400 hover:text-bakery-800 hover:bg-bakery-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile User Profile Section */}
              {isMounted && status === 'authenticated' && session?.user ? (
                <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar image={session.user.image} name={session.user.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-bakery-chocolate truncate">{session.user.name}</p>
                      <p className="text-[10px] text-bakery-600 truncate">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleGoogleSignIn();
                    }}
                    className="flex items-center justify-center gap-2.5 w-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-2xl py-3.5 px-4 text-xs font-bold shadow-xs active:scale-98 transition-all min-h-[48px] cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              )}

              {/* Drawer Links */}
              <nav className="py-4 space-y-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-2xl font-bold text-base transition-colors min-h-[48px] ${
                        isActive
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/60'
                          : 'text-bakery-chocolate hover:bg-bakery-50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                {/* My Orders Link (Always visible in mobile menu) */}
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-base transition-colors min-h-[48px] ${
                    pathname === '/orders'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200/60'
                      : 'text-bakery-chocolate hover:bg-bakery-50'
                  }`}
                >
                  <Package className="w-5 h-5 text-amber-700" />
                  My Orders
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-base text-bakery-chocolate hover:bg-bakery-50 transition-colors min-h-[48px]"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Saved Wishlist
                  </span>
                  {isMounted && wishlist.length > 0 && (
                    <span className="bg-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Sign Out button (If logged in) */}
                {status === 'authenticated' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleGoogleSignOut('/');
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-2xl font-bold text-base text-rose-600 hover:bg-rose-50 transition-colors min-h-[48px] cursor-pointer mt-2 border-t border-bakery-100 pt-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                )}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="space-y-3 pt-4 border-t border-bakery-100">
              <a
                href="tel:919947066011"
                className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-soft transition-colors min-h-[44px]"
              >
                <PhoneCall className="w-4 h-4 text-amber-200 shrink-0" /> Call Baker: +91 99470 66011
              </a>
              <p className="text-[11px] text-center text-bakery-400 font-medium">
                Freshly Baked Home Cakes Delivered in Trivandrum
              </p>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
