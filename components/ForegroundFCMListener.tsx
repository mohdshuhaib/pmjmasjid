'use client';

import { useEffect } from 'react';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';
import app from '@/lib/firebase'; // Adjust this path to where your firebase.ts file lives!
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // <-- Added Router

export default function ForegroundFCMListener() {
  const router = useRouter(); // <-- Initialize Router

  useEffect(() => {
    const setupForegroundListener = async () => {
      try {
        // 1. Check if the browser supports Firebase Messaging
        const supported = await isSupported();
        if (!supported) {
          console.log('Firebase Messaging is not supported in this browser.');
          return;
        }

        // 2. Only listen if the user has actually granted permission
        if (Notification.permission !== 'granted') {
          return;
        }

        // 3. Initialize the messaging instance
        const messaging = getMessaging(app);

        // 4. Listen for live messages
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('[Foreground Message Received]: ', payload);

          const title = payload.notification?.title || 'PMJ Masjid';
          const body = payload.notification?.body || 'You have a new notification.';
          // Get the target URL we set in the Admin Actions, fallback to notifications page
          const targetUrl = payload.data?.url || '/notifications';

          // 5. Display a beautiful custom toast matching your mosque's theme
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-in slide-in-from-top-4 fade-in duration-300' : 'animate-out fade-out slide-out-to-top-4 duration-200'
              } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors`}
              // Clicking the main body of the toast routes the user!
              onClick={() => {
                toast.dismiss(t.id);
                router.push(targetUrl);
              }}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-emerald-900">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {body}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the routing click from triggering
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-sm font-bold text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ), {
            duration: 6000, // Stays on screen for 6 seconds
            position: 'top-center'
          });
        });

        // Cleanup the listener if the user leaves the page
        return () => {
          unsubscribe();
        };

      } catch (error) {
        console.error('Error setting up foreground FCM listener:', error);
      }
    };

    setupForegroundListener();
  }, [router]);

  // This component is completely invisible in the HTML
  return null;
}