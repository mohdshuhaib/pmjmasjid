// Import Firebase scripts from CDN (Required for Service Workers)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyByT3ZniYGpx-YAD2vY6KLchUK9JER5Bxo",
  authDomain: "pmj-masjid-app.firebaseapp.com",
  projectId: "pmj-masjid-app",
  storageBucket: "pmj-masjid-app.firebasestorage.app",
  messagingSenderId: "421064781317",
  appId: "1:421064781317:web:5cb2030cd0cd07b534f66c"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages and show the notification
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192x192.png', // Make sure you have an icon here!
    badge: '/icon-192x192.png', // Replaced with icon, as usually standard badges are pure white/transparent.
    data: {
      // Pass the specific URL we want to open when this is clicked
      url: '/notifications',
      ...payload.data
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- NEW: Handle clicks on the notification ---
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  // 1. Close the notification box
  event.notification.close();

  // 2. Define the target URL (Defaults to /notifications from the payload data above)
  const targetPath = event.notification.data?.url || '/notifications';
  const targetUrl = self.location.origin + targetPath;

  // 3. Open or focus the window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the app
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];

        // If the app is already open somewhere, just focus it and navigate to the target URL
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // If no window is open, open a new tab/window to the URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});