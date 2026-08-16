import { useEffect } from 'react';

/**
 * Mobile-safe body scroll lock hook.
 * Uses position: fixed on document.body with scroll position offset preservation
 * to prevent background touch-scroll bleed on mobile WebKit & Blink browsers.
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    // Capture current scroll position
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // Store original inline styles to restore cleanly
    const originalStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    // Apply fixed position to freeze body at current scroll position
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore original inline styles
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.left = originalStyle.left;
      document.body.style.right = originalStyle.right;
      document.body.style.width = originalStyle.width;
      document.body.style.overflow = originalStyle.overflow;

      // Instantly restore scroll position cleanly
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
}
