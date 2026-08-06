import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductDetailModal from '@/components/ProductDetailModal';
import MainLayoutClientWrapper from '@/components/MainLayoutClientWrapper';

export const metadata: Metadata = {
  title: 'MyHomelyCake Trivandrum | Fresh Home Bakery Cakes Order Online',
  description: 'Order fresh, 100% preservative-free home baked cakes in Trivandrum. Tender Coconut, Belgian Truffle, Red Velvet, Cheesecakes & Custom Birthday Cakes. Phone & WhatsApp confirmation.',
  keywords: ['Cakes Trivandrum', 'Home Bakery Trivandrum', 'Cake Delivery Trivandrum', 'Tender Coconut Cake', 'Birthday Cake Trivandrum', 'MyHomelyCake'],
  authors: [{ name: 'MyHomelyCake Trivandrum' }],
  openGraph: {
    title: 'MyHomelyCake Trivandrum | Premium Home Baked Cakes',
    description: 'Freshly baked homemade cakes delivered across Trivandrum. No login or online payment required - order in 1 tap!',
    locale: 'en_IN',
    type: 'website',
  },
};

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
    telephone: '+919876543210',
    email: 'orders@myhomelycakes.com',
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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBakerySchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <CartProvider>
          <MainLayoutClientWrapper>
            {children}
          </MainLayoutClientWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
