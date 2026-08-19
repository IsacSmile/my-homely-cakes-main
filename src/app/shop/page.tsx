import React from 'react';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import ShopClient from './ShopClient';

export const revalidate = 60;

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
  // Execute initial products and categories queries in parallel for fast loading
  const [initialProducts, initialCategories] = await Promise.all([
    db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(20)
      .then((res: any[]) => res || []),
    db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder))
      .then((res: any[]) => res || []),
  ]);

  const initialHasMore = initialProducts.length >= 20;

  return (
    <ShopClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialHasMore={initialHasMore}
    />
  );
}
