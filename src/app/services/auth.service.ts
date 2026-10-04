import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ====================================================================================
 * [EXPERIMENT 20 & 22] - Authentication Service for Login and Route Protection
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * User login status, authentication state, aur admin session manage karta hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `isLoggedInSubject` boolean value rakhta hai jo track karta hai ki user logged in hai ya nahi.
 * 2. `login(email, password)` method credentials check karke logged-in state ko true set karta hai.
 * 3. `logout()` session clear karke access revoke karta hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * College Admin panel, student fee configuration, aur sensitive records ko sirf
 * authorized staff/admin ko allow karne ke liye AuthGuard ke saath connect hota hai.
 */

export interface AuthUser {
  email: string;
  role: 'admin' | 'faculty' | 'student';
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'sms_auth_token_v1';
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.checkStoredSession();
  }

  private checkStoredSession(): void {
    try {
      const stored = localStorage.getItem(this.AUTH_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
        this.loggedInSubject.next(true);
      }
    } catch (e) {
      // ignore
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.getValue();
  }

  login(email: string, password: string): { success: boolean; message: string } {
    // Demo admin credentials
    // Note: Any valid email with length >= 6 and strong password accepted for testing
    if (email && password && password.length >= 6) {
      const user: AuthUser = {
        email: email,
        role: email.includes('admin') ? 'admin' : 'faculty',
        name: email.split('@')[0].toUpperCase()
      };

      this.currentUserSubject.next(user);
      this.loggedInSubject.next(true);
      try {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      } catch (e) {}

      return { success: true, message: `Welcome ${user.name}! Login successful.` };
    }

    return { success: false, message: 'Invalid credentials. Password must be at least 6 characters.' };
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.loggedInSubject.next(false);
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (e) {}
  }
}
