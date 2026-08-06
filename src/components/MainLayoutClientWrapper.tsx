'use client';

import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ProductDetailModal from './ProductDetailModal';
import SearchModal from './SearchModal';

export default function MainLayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ProductDetailModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
