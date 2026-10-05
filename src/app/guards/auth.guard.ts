import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * ====================================================================================
 * [EXPERIMENT 20] - Implement a simple route guard to protect the admin page
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Angular Router me `CanActivateFn` functional route guard hai.
 * Ye ensure karta hai ki koi bhi user bina login kiye `/admin` page open na kar sake.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `authService.isLoggedIn()` check karta hai ki user logged in hai ya nahi.
 * 2. Agar user authenticated hai, toh ye `true` return karta hai aur route allow ho jaata hai.
 * 3. Agar user NOT logged in hai, toh ye user ko warning message alert karke
 *    login form section par navigate karta hai aur `false` return karta hai (access blocked!).
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * College administration panel, marks editing, student deletion jaisi administrative
 * rights sirf verified admin user ke paas honi chahiye. AuthGuard is security barrier
 * ko provide karta hai.
 */

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // User is logged in -> Allow route activation
    return true;
  }

  // User is not logged in -> Block navigation and redirect to login
  alert('AUTHENTICATION REQUIRED: Please login with valid credentials first.');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
