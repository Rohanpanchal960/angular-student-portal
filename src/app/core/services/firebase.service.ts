import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

/**
 * ====================================================================================
 * FIREBASE MODULAR INITIALIZATION SERVICE
 * ====================================================================================
 * Yeh service Firebase modular SDK ko initialize karti hai.
 * Auth aur Firestore instance provide karti hai pure application me.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly app: FirebaseApp;
  public readonly auth: Auth;
  public readonly db: Firestore;
  public readonly isFirebaseConfigured: boolean;

  constructor() {
    // Check if real Firebase config is provided or demo keys
    this.isFirebaseConfigured = !environment.firebase.apiKey.includes('DemoKey');

    try {
      if (!getApps().length) {
        this.app = initializeApp(environment.firebase);
      } else {
        this.app = getApps()[0];
      }

      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      console.log('🔥 [FirebaseService] Firebase initialized successfully:', environment.firebase.projectId);
    } catch (error) {
      console.warn('⚠️ [FirebaseService] Firebase initialization warning (Fallback mode active):', error);
      // Fallback empty instances if initialization fails in development
      this.app = {} as FirebaseApp;
      this.auth = {} as Auth;
      this.db = {} as Firestore;
    }
  }
}
