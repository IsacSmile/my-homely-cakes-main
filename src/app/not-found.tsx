import React from 'react';
import Link from 'next/link';
import { Cake, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-700 flex items-center justify-center">
        <Cake className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">404 - Page Not Found</h1>
      <p className="text-xs text-bakery-600 max-w-sm">
        Oops! The cake or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-full shadow-soft hover:bg-amber-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Bakery Home</span>
      </Link>
    </div>
  );
}
