import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.appId &&
  firebaseConfig.projectId
);

if (typeof window !== 'undefined') {
  // Client-side initialization — make tolerant for missing envs
  try {
    if (!isFirebaseConfigured) {
      console.warn('Firebase not initialized: missing NEXT_PUBLIC_FIREBASE_* configuration. Required: apiKey, authDomain, appId, projectId');
      console.log('Current config:', {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        appId: !!firebaseConfig.appId,
        projectId: !!firebaseConfig.projectId
      });
    } else {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig as any);
        console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
      } else {
        app = getApps()[0];
      }

      if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
      }
    }
  } catch (e) {
    console.error('Firebase initialization error:', e);
  }
}

export { app, auth, db, storage, isFirebaseConfigured };
