import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Outfit, Montserrat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import MainLayoutClientWrapper from '@/components/MainLayoutClientWrapper';

const headingFont = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const bodyFont = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const priceFont = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-price',
  weight: ['500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {

  title: {
    default: 'My Homely Cakes | Home',
    template: 'My Homely Cakes | %s',
  },
  description: 'Order fresh, 100% preservative-free home baked cakes in Trivandrum. Tender Coconut, Belgian Truffle, Red Velvet, Cheesecakes & Custom Birthday Cakes. Direct phone call confirmation.',
  keywords: ['Cakes Trivandrum', 'Home Bakery Trivandrum', 'Cake Delivery Trivandrum', 'Tender Coconut Cake', 'Birthday Cake Trivandrum', 'MyHomelyCake'],
  authors: [{ name: 'My Homely Cakes' }],
  openGraph: {
    title: 'My Homely Cakes | Home',
    description: 'Freshly baked homemade cakes delivered across Trivandrum. No login or online payment required - order in 1 tap!',
    locale: 'en_IN',
    type: 'website',
  },
};

import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdBakerySchema = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'MyHomelyCake Trivandrum',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136',
    telephone: '+919947066011',
    email: 'myhomelycakes@gmail.com',
    priceRange: '₹450 - ₹2000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Thiruvananthapuram',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 8.5241,
      longitude: 76.9366,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '21:00',
    },
  };

  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} ${priceFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBakerySchema) }}
        />
        {/* Google Analytics Tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-JK37B6Z11K"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JK37B6Z11K');
            `,
          }}
        />
      </head>

      <body className="min-h-screen max-w-full w-full overflow-x-clip relative flex flex-col justify-between antialiased font-sans bg-bakery-bg text-bakery-chocolate" suppressHydrationWarning>
        <SessionProviderWrapper>
          <CartProvider>
            <MainLayoutClientWrapper>
              {children}
            </MainLayoutClientWrapper>
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
