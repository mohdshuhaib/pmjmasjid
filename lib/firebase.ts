import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export a function to safely get the messaging instance
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null; // Prevent SSR errors

  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    return null;
  } catch (err) {
    console.error("Firebase Messaging not supported", err);
    return null;
  }
};

export default app;