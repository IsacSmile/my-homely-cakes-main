import React from 'react';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import AdminProductsClient from './AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  let initialProducts: any[] = [];
  let rawCategories: any[] = [];

  try {
    initialProducts = (await db.select().from(products)) || [];
    rawCategories = (await db.select().from(categories)) || [];
  } catch (error) {
    console.error('Error fetching admin products:', error);
  }

  // Attach live product count to categories
  const initialCategories = rawCategories.map((cat: any) => {
    const pCount = initialProducts.filter((p: any) => p.category === cat.name).length;
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
