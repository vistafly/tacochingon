import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Allow build to succeed without credentials
    console.warn('Firebase Admin SDK not configured - server features will not work');
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
    });
  }
}

export const adminDb = getFirestore();
