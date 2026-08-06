import React from 'react';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import ShopClient from './ShopClient';

export const revalidate = 60; // ISR: Revalidate static HTML every 60 seconds

export default async function ShopPage() {
  // Pre-fetch initial products and admin categories on the server
  const initialProducts = db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(20)
    .all();

  const initialCategories = db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder))
    .all();

  const totalProductsCount = db.select().from(products).all().length;
  const initialHasMore = totalProductsCount > 20;

  return (
    <ShopClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialHasMore={initialHasMore}
    />
  );
}
