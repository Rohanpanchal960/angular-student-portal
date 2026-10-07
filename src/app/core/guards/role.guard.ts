import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * ====================================================================================
 * ROLE-BASED ROUTE GUARDS (Angular 18 Functional Guards)
 * ====================================================================================
 * Guards verify auth state, wait for the auth readiness promise, check user approval,
 * and ensure strict role access (admin | faculty | student).
 */

/**
 * Ensures user is authenticated (any valid role)
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Await the auth-ready promise before deciding
  await auth.authReadyPromise;

  const profile = auth.userProfile();
  if (!profile) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If faculty or student is not approved, redirect to awaiting approval
  if (!profile.approved && profile.role !== 'admin' && !state.url.includes('awaiting-approval')) {
    router.navigate(['/awaiting-approval']);
    return false;
  }

  return true;
};

/**
 * Admin Role Guard: Only allows users with role === 'admin'
 */
export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  await auth.authReadyPromise;
  const profile = auth.userProfile();

  if (!profile) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (profile.role !== 'admin') {
    toast.error('Access Denied: Administrator privileges required.');
    auth.redirectAfterLogin(profile);
    return false;
  }

  return true;
};

/**
 * Faculty Role Guard: Allows users with role === 'faculty' AND approved === true
 */
export const facultyGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  await auth.authReadyPromise;
  const profile = auth.userProfile();

  if (!profile) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (profile.role !== 'faculty') {
    toast.error('Access Denied: Faculty portal access required.');
    auth.redirectAfterLogin(profile);
    return false;
  }

  if (!profile.approved) {
    router.navigate(['/awaiting-approval']);
    return false;
  }

  return true;
};

/**
 * Student Role Guard: Allows users with role === 'student'
 */
export const studentGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  await auth.authReadyPromise;
  const profile = auth.userProfile();

  if (!profile) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (profile.role !== 'student') {
    toast.error('Access Denied: Student portal access required.');
    auth.redirectAfterLogin(profile);
    return false;
  }

  // Student must be approved by Faculty or Admin
  if (!profile.approved) {
    router.navigate(['/awaiting-approval']);
    return false;
  }

  return true;
};

/**
 * Public Only Guard: If already logged in, redirects directly to user dashboard
 */
export const publicOnlyGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);

  await auth.authReadyPromise;
  const profile = auth.userProfile();

  if (profile) {
    auth.redirectAfterLogin(profile);
    return false;
  }

  return true;
};
