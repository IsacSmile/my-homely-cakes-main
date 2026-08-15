import { signIn, signOut } from 'next-auth/react';

export function handleGoogleSignIn(callbackUrl?: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mhc_auth_action', 'login');
  }
  return signIn('google', { callbackUrl: callbackUrl || (typeof window !== 'undefined' ? window.location.href : '/') });
}

export function handleGoogleSignOut(callbackUrl: string = '/') {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mhc_auth_action', 'logout');
  }
  return signOut({ callbackUrl });
}
