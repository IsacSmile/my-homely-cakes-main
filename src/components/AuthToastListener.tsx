'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';

export default function AuthToastListener() {
  const { data: session, status } = useSession();
  const { showToast } = useCart();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const action = sessionStorage.getItem('mhc_auth_action');
    const urlParams = new URLSearchParams(window.location.search);
    const hasErrorParam = urlParams.has('error');

    // Handle OAuth login error / cancellation
    if (hasErrorParam) {
      sessionStorage.removeItem('mhc_auth_action');
      showToast({
        type: 'error',
        title: 'Sign in was not completed',
        message: 'Google sign in was cancelled or failed.',
      });
      // Clean error param from URL cleanly
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return;
    }

    // Handle successful login toast
    if (status === 'authenticated' && session?.user && action === 'login') {
      sessionStorage.removeItem('mhc_auth_action');
      const name = session.user.name ? session.user.name.split(' ')[0] : '';
      showToast({
        type: 'success',
        title: name ? `Welcome back, ${name}` : 'Signed in successfully',
        message: 'You are now logged into your MyHomelyCake account.',
      });
      return;
    }

    // Handle successful logout toast
    if (status === 'unauthenticated' && action === 'logout') {
      sessionStorage.removeItem('mhc_auth_action');
      showToast({
        type: 'info',
        title: 'You\'ve been signed out',
        message: 'Signed out successfully.',
      });
      return;
    }

    isInitialMount.current = false;
  }, [status, session, showToast]);

  return null;
}
