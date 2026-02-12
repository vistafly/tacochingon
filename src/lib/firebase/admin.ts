import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export let firebaseInitTime = 0;
export let firebaseInitStatus: 'ok' | 'fallback' | 'not-configured' = 'not-configured';

if (!getApps().length) {
  const initStart = Date.now();
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const adminPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
        projectId: adminProjectId || 'placeholder',
      });
      firebaseInitStatus = 'fallback';
    }
  } else if (adminProjectId && adminClientEmail && adminPrivateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId: adminProjectId,
          clientEmail: adminClientEmail,
          privateKey: adminPrivateKey,
        }),
      });
      firebaseInitStatus = 'ok';
    } catch (e) {
      console.error('Failed to init Firebase Admin with individual env vars:', e);
      initializeApp({ projectId: adminProjectId });
      firebaseInitStatus = 'fallback';
    }
  } else {
    console.warn('Firebase Admin SDK not configured - server features will not work');
    initializeApp({
      projectId: adminProjectId || 'placeholder',
    });
  }
  firebaseInitTime = Date.now() - initStart;
  console.log(`[Firebase Admin] init: ${firebaseInitTime}ms (status: ${firebaseInitStatus})`);
}

export const adminDb = getFirestore();
