'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    document.title = 'My Homely Cakes | Page Not Found';
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-bakery-chocolate">Something went wrong!</h1>
      <p className="text-xs text-bakery-600 max-w-sm">
        An unexpected error occurred while loading this section.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft hover:bg-amber-500 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <Link href="/" className="text-xs text-bakery-600 underline font-semibold">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
