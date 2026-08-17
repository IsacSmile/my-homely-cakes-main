import React from 'react';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import ShopClient from './ShopClient';

export const revalidate = 60;

export const metadata = {
  title: 'Shop',
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
