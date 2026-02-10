import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export let firebaseInitTime = 0;
export let firebaseInitStatus: 'ok' | 'fallback' | 'not-configured' = 'not-configured';

if (!getApps().length) {
  const initStart = Date.now();
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
      });
      firebaseInitStatus = 'ok';
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
      });
      firebaseInitStatus = 'fallback';
    }
  } else {
    console.warn('Firebase Admin SDK not configured - server features will not work');
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
    });
  }
  firebaseInitTime = Date.now() - initStart;
  console.log(`[Firebase Admin] init: ${firebaseInitTime}ms (status: ${firebaseInitStatus})`);
}

export const adminDb = getFirestore();
