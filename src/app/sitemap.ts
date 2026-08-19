import { MetadataRoute } from 'next';
import { db } from '@/db';
import { products } from '@/db/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.myhomelycakes.com';

  let productUrls: any[] = [];
  try {
    const rawProducts = (await db.select().from(products).all()) || [];
    if (Array.isArray(rawProducts)) {
      productUrls = rawProducts.map((product: any) => ({
        url: `${baseUrl}/shop?product=${product.slug}`,
        lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Sitemap products fetch warning:', e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refunds`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...productUrls,
  ];
}
