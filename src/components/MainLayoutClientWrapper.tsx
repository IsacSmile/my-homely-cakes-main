'use client';

import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ProductDetailModal from './ProductDetailModal';
import SearchModal from './SearchModal';
import AuthToastListener from './AuthToastListener';

export default function MainLayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <AuthToastListener />
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1 max-w-full w-full overflow-x-clip">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ProductDetailModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
