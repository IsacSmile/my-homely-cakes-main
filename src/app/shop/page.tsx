import React from 'react';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cake Menu & Online Orders',
  description: 'Explore our full menu of freshly baked homemade cakes in Trivandrum. Tender Coconut, Belgian Truffle, Red Velvet & Cheesecakes. Select weight and order in 1 tap.',
  alternates: {
    canonical: 'https://www.myhomelycakes.com/shop',
  },
  openGraph: {
    title: 'Cake Menu & Online Orders | My Homely Cakes Trivandrum',
    description: 'Explore our full menu of freshly baked homemade cakes in Trivandrum. Handcrafted with pure natural butter & zero preservatives.',
    url: 'https://www.myhomelycakes.com/shop',
    siteName: 'My Homely Cakes',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'My Homely Cakes Menu',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cake Menu & Online Orders | My Homely Cakes Trivandrum',
    description: 'Explore our full menu of freshly baked homemade cakes in Trivandrum.',
    images: ['/icon.png'],
  },
};

export default async function ShopPage() {
  let allProductsRaw: any[] = [];
  let initialCategories: any[] = [];

  try { allProductsRaw = (await db.select().from(products)) || []; } catch {}
  try { initialCategories = (await db.select().from(categories).orderBy(asc(categories.displayOrder)).all()) || []; } catch {}

  const initialProducts = allProductsRaw
    .filter((p: any) => p.isAvailable !== false)
    .sort((a: any, b: any) => {
      const orderA = Number(a.displayPosition || a.homeSectionOrder || 0);
      const orderB = Number(b.displayPosition || b.homeSectionOrder || 0);
      if (orderA > 0 && orderB > 0) return orderA - orderB;
      if (orderA > 0) return -1;
      if (orderB > 0) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 20);

  const initialHasMore = initialProducts.length >= 20;

  return (
    <ShopClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialHasMore={initialHasMore}
    />
  );
}
