import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin-manage/',
    },
    sitemap: 'https://myhomelycakes.com/sitemap.xml',
  };
}
