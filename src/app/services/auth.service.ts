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
  avatarUrl?: string;
  department?: string;
  loginTime?: string;
}

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'faculty' | 'student';
  description: string;
  badgeClass: string;
  icon: string;
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

  // Curated demo accounts for one-click demo login
  public readonly demoAccounts: DemoAccount[] = [
    {
      email: 'admin@eduportal.ac.in',
      password: 'admin123',
      name: 'Dr. Vikram Patel',
      role: 'admin',
      description: 'Full administrative access: Student records, marks, and settings',
      badgeClass: 'badge-admin',
      icon: 'fa-user-shield'
    },
    {
      email: 'faculty@eduportal.ac.in',
      password: 'faculty123',
      name: 'Prof. Ananya Roy',
      role: 'faculty',
      description: 'Department faculty: Add & edit student marks, attendance and labs',
      badgeClass: 'badge-faculty',
      icon: 'fa-chalkboard-user'
    },
    {
      email: 'student@eduportal.ac.in',
      password: 'student123',
      name: 'Rohan Panchal',
      role: 'student',
      description: 'Enrolled student: View academic scorecard, notices and syllabus',
      badgeClass: 'badge-student',
      icon: 'fa-user-graduate'
    }
  ];

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
      // ignore storage error
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.getValue();
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.getValue();
  }

  login(email: string, password: string): { success: boolean; message: string; user?: AuthUser } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email or username.' };
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    // Check against curated demo accounts first
    const demoMatch = this.demoAccounts.find(
      d => d.email.toLowerCase() === cleanEmail && d.password === cleanPassword
    );

    let user: AuthUser;

    if (demoMatch) {
      user = {
        email: demoMatch.email,
        role: demoMatch.role,
        name: demoMatch.name,
        department: demoMatch.role === 'admin' ? 'Administration' : demoMatch.role === 'faculty' ? 'Computer Science' : 'MCA Department',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(demoMatch.name)}`,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      // Allow flexible login for custom email/password
      const role: 'admin' | 'faculty' | 'student' = 
        cleanEmail.includes('admin') ? 'admin' :
        cleanEmail.includes('student') ? 'student' : 'faculty';

      const displayName = cleanEmail.split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      user = {
        email: cleanEmail,
        role: role,
        name: displayName || 'Demo User',
        department: role === 'admin' ? 'Administration' : role === 'student' ? 'Student Body' : 'Faculty Member',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    this.currentUserSubject.next(user);
    this.loggedInSubject.next(true);

    try {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage save failed');
    }

    return { 
      success: true, 
      message: `Welcome back, ${user.name}! Logged in as ${user.role.toUpperCase()}.`, 
      user 
    };
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.loggedInSubject.next(false);
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (e) {
      // ignore
    }
  }
}
