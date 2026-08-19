import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'Your saved favorite home baked cakes at My Homely Cakes Trivandrum.',
  alternates: {
    canonical: 'https://www.myhomelycakes.com/wishlist',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
