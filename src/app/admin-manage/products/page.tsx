import React from 'react';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import AdminProductsClient from './AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const initialProducts = db.select().from(products).all();
  const rawCategories = db.select().from(categories).all();

  // Attach live product count to categories
  const initialCategories = rawCategories.map(cat => {
    const pCount = initialProducts.filter(p => p.category === cat.name).length;
    return {
      ...cat,
      productCount: pCount,
    };
  });

  return (
    <AdminProductsClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
