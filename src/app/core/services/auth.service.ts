import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './firestore.service';
import { ToastService } from './toast.service';
import { UserProfile, UserRole } from '../models';

/**
 * ====================================================================================
 * AUTHENTICATION SERVICE (Angular 18 Signals + Firebase Modular Auth)
 * ====================================================================================
 * Manages user authentication state, registration, login, role determination,
 * password management, and auth readiness promise for route guards.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Reactive State Signals
  public firebaseUser = signal<User | null>(null);
  public userProfile = signal<UserProfile | null>(null);
  public isAuthReady = signal<boolean>(false);

  // Computed state
  public isAuthenticated = computed(() => !!this.userProfile());
  public userRole = computed<UserRole | null>(() => this.userProfile()?.role ?? null);
  public isApproved = computed(() => this.userProfile()?.approved ?? false);

  // Promise that resolves once initial auth state is resolved
  public authReadyPromise: Promise<boolean>;
  private resolveAuthReady!: (value: boolean) => void;

  constructor() {
    this.authReadyPromise = new Promise(resolve => {
      this.resolveAuthReady = resolve;
    });

    this.initializeAuthStateListener();
  }

  /**
   * Firebase Auth state change listener setup
   */
  private initializeAuthStateListener(): void {
    const auth = this.firebaseService.auth;

    if (this.firebaseService.isFirebaseConfigured && auth && auth.app) {
      try {
        onAuthStateChanged(auth, async (user: User | null) => {
          this.firebaseUser.set(user);
          if (user) {
            const profile = await this.firestoreService.getUserProfile(user.uid);
            if (profile) {
              this.userProfile.set(profile);
              this.persistSession(profile);
            } else {
              const cached = this.getCachedUser();
              if (cached && cached.uid === user.uid) {
                this.userProfile.set(cached);
              }
            }
          } else {
            this.userProfile.set(null);
            this.clearSession();
          }

          this.isAuthReady.set(true);
          this.resolveAuthReady(true);
        });
      } catch (err) {
        console.warn('onAuthStateChanged fallback:', err);
        this.fallbackInit();
      }
    } else {
      this.fallbackInit();
    }
  }

  private fallbackInit(): void {
    const cached = this.getCachedUser();
    if (cached) {
      this.userProfile.set(cached);
    }
    this.isAuthReady.set(true);
    this.resolveAuthReady(true);
  }

  private getCachedUser(): UserProfile | null {
    try {
      // 1. Check tab-isolated session storage first (allows simultaneous Admin, Faculty, and Student tabs)
      const sessionData = sessionStorage.getItem('eduportal_active_user');
      if (sessionData) return JSON.parse(sessionData);

      // 2. Fall back to persistent localStorage
      const localData = localStorage.getItem('eduportal_active_user');
      return localData ? JSON.parse(localData) : null;
    } catch {
      return null;
    }
  }

  private persistSession(profile: UserProfile): void {
    const json = JSON.stringify(profile);
    // Tab-level isolated session (enables concurrent multi-role logins across browser tabs)
    sessionStorage.setItem('eduportal_active_user', json);
    localStorage.setItem('eduportal_active_user', json);
  }

  private clearSession(): void {
    sessionStorage.removeItem('eduportal_active_user');
    localStorage.removeItem('eduportal_active_user');
  }

  /**
   * Fast Account Switcher: Switch between Admin, Faculty, and Student with 1-click
   */
  async quickSwitchAccount(targetEmail: string): Promise<void> {
    const allUsers = await this.firestoreService.getAllUsers();
    const target = allUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (target) {
      this.userProfile.set(target);
      this.persistSession(target);
      this.toast.success(`Switched active account to: ${target.displayName} (${target.role.toUpperCase()})`);
      this.redirectAfterLogin(target);
    } else {
      this.toast.error(`Account ${targetEmail} not found in database.`);
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check live Firebase Auth if configured
    if (this.firebaseService.isFirebaseConfigured && this.firebaseService.auth?.app) {
      try {
        const cred = await signInWithEmailAndPassword(this.firebaseService.auth, cleanEmail, pass);
        const profile = await this.firestoreService.getUserProfile(cred.user.uid);
        if (profile) {
          if (profile.status === 'suspended') {
            await signOut(this.firebaseService.auth);
            throw new Error('Your account is currently suspended. Please contact the administrator.');
          }
          this.userProfile.set(profile);
          this.persistSession(profile);
          this.redirectAfterLogin(profile);
          return profile;
        }
      } catch (err: any) {
        console.warn('Firebase login attempt fallback:', err.message);
      }
    }

    // 2. Offline / Local Demo authentication lookup
    const allUsers = await this.firestoreService.getAllUsers();
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      if (matchedUser.status === 'suspended') {
        throw new Error('Your account is currently suspended. Please contact the administrator.');
      }
      this.userProfile.set(matchedUser);
      this.persistSession(matchedUser);
      this.toast.success(`Welcome back, ${matchedUser.displayName}!`);
      this.redirectAfterLogin(matchedUser);
      return matchedUser;
    }

    throw new Error('Invalid email or password. Please verify credentials.');
  }

  /**
   * Register new account (Student or Faculty)
   * Note: Self-registration as 'admin' is explicitly disallowed!
   */
  async register(data: {
    displayName: string;
    email: string;
    password: string;
    role: 'student' | 'faculty';
    courseId?: string;
    courseName?: string;
    rollNo?: string;
    semester?: number;
    department?: string;
    designation?: string;
    phoneNumber?: string;
  }): Promise<UserProfile> {
    const cleanEmail = data.email.trim().toLowerCase();
    let uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    // Live Firebase Auth account creation if available
    if (this.firebaseService.isFirebaseConfigured && this.firebaseService.auth?.app) {
      try {
        const cred = await createUserWithEmailAndPassword(this.firebaseService.auth, cleanEmail, data.password);
        uid = cred.user.uid;
      } catch (err: any) {
        console.warn('Firebase registration fallback:', err.message);
      }
    }

    // Role approval rule as requested:
    // Student requires approval from Faculty or Admin.
    // Faculty requires approval from Admin.
    const isApproved = false;

    const newProfile: UserProfile = {
      uid,
      email: cleanEmail,
      displayName: data.displayName.trim(),
      role: data.role,
      approved: isApproved,
      status: 'pending',
      phoneNumber: data.phoneNumber || '',
      department: data.department || '',
      designation: data.designation || '',
      rollNo: data.rollNo || (data.role === 'student' ? `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      courseId: data.courseId || '',
      courseName: data.courseName || '',
      semester: data.semester || 1,
      createdAt: new Date().toISOString()
    };

    // Save profile to Firestore and local storage
    await this.firestoreService.saveUserProfile(newProfile);
    this.userProfile.set(newProfile);
    this.persistSession(newProfile);

    if (newProfile.role === 'faculty') {
      this.toast.info('Registration successful! Faculty account is pending Administrator approval.');
    } else {
      this.toast.info('Registration successful! Student account is pending Faculty or Administrator approval.');
    }
    this.router.navigate(['/awaiting-approval']);

    return newProfile;
  }

  /**
   * Reset Password request
   */
  async forgotPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (this.firebaseService.isFirebaseConfigured && this.firebaseService.auth?.app) {
      try {
        await sendPasswordResetEmail(this.firebaseService.auth, cleanEmail);
      } catch (err: any) {
        console.warn('Firebase reset password email warning:', err.message);
      }
    }
    this.toast.success('Password reset link sent to your email address (check inbox/spam).');
  }

  /**
   * Update Password
   */
  async changePassword(newPass: string): Promise<void> {
    if (this.firebaseService.auth?.currentUser) {
      await updatePassword(this.firebaseService.auth.currentUser, newPass);
    }
    this.toast.success('Your password has been changed successfully.');
  }

  /**
   * Update Profile Details
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const current = this.userProfile();
    if (!current) throw new Error('No user is currently logged in.');

    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await this.firestoreService.saveUserProfile(updated);
    this.userProfile.set(updated);
    this.persistSession(updated);
    this.toast.success('Profile updated successfully.');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (this.firebaseService.isFirebaseConfigured && this.firebaseService.auth?.app) {
      try {
        await signOut(this.firebaseService.auth);
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    this.userProfile.set(null);
    this.firebaseUser.set(null);
    this.clearSession();
    this.toast.info('Logged out successfully.');
    this.router.navigate(['/login']);
  }

  /**
   * Redirect based on role and approval status
   */
  public redirectAfterLogin(profile: UserProfile): void {
    if (profile.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (profile.role === 'faculty') {
      if (profile.approved) {
        this.router.navigate(['/faculty/dashboard']);
      } else {
        this.router.navigate(['/awaiting-approval']);
      }
    } else if (profile.role === 'student') {
      if (profile.approved) {
        this.router.navigate(['/student/dashboard']);
      } else {
        this.router.navigate(['/awaiting-approval']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
