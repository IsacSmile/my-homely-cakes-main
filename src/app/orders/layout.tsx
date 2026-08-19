import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View and track your home-baked cake orders at My Homely Cakes Trivandrum.',
  alternates: {
    canonical: 'https://www.myhomelycakes.com/orders',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
