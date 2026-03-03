"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, BellOff, Loader2, CheckCircle2 } from "lucide-react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

interface NotificationPermissionProps {
  pmj_no: number;
}

export default function NotificationPermission({ pmj_no }: NotificationPermissionProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Safely check permission on mount (Client-side only)
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      console.log("1. Starting notification setup...");
      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        console.error("Messaging module not returned from getFirebaseMessaging");
        alert("Push notifications are not supported on this browser/device.");
        setPermission("unsupported");
        setLoading(false);
        return;
      }

      console.log("2. Requesting notification permission...");
      const currentPermission = await Notification.requestPermission();
      console.log("Permission result:", currentPermission);
      setPermission(currentPermission);

      if (currentPermission === "granted") {
        console.log("3. Permission granted. Attempting explicit SW registration...");

        // Let's try to explicitly register the SW first, waiting for it to be ready
        let swRegistration = null;
        if ('serviceWorker' in navigator) {
          try {
            swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('SW Registered:', swRegistration);

            // Wait until the SW is active
            swRegistration = await navigator.serviceWorker.ready;
            console.log('SW is Ready:', swRegistration);

          } catch (swError) {
            console.error("Failed to register SW explicitly:", swError);
          }
        }

        console.log("4. Attempting to get FCM token...");
        // Pass the explicit service worker registration to getToken
        // Add these two lines temporarily:
        console.log("API Key exists?:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
        console.log("VAPID Key exists?:", !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
        const tokenParams: { vapidKey: string | undefined, serviceWorkerRegistration?: ServiceWorkerRegistration } = {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        };

        if (swRegistration) {
          tokenParams.serviceWorkerRegistration = swRegistration;
        }

        try {
          const token = await getToken(messaging, tokenParams);

          console.log("5. Token retrieved:", token ? "Success (hidden for security)" : "Null returned");

          if (token) {
            const response = await fetch("/api/notifications/register-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pmj_no: pmj_no,
                token: token,
                device_type: navigator.userAgent.includes("Mobile") ? "mobile" : "desktop"
              }),
            });

            if (!response.ok) {
              console.error("6. Failed to save token to database. Status:", response.status);
            } else {
              console.log("6. Token successfully saved to database.");
            }
          } else {
            console.warn("Token generation returned null without throwing an error.");
            alert("Could not generate a notification token. Please try again.");
          }
        } catch (tokenError: any) {
          console.error("Error specifically during getToken():", tokenError);

          // Check for common specific errors
          if (tokenError.code === 'messaging/invalid-vapid-key') {
            alert("Configuration Error: The VAPID key is invalid.");
          } else if (tokenError.code === 'messaging/permission-blocked') {
            alert("Notifications are blocked by the browser.");
          } else {
            alert(`Token generation failed: ${tokenError.message}`);
          }
        }
      } else {
        console.log("Permission was not granted.");
      }
    } catch (error) {
      console.error("General error setting up notifications:", error);
      alert("Something went wrong while setting up notifications.");
    } finally {
      setLoading(false);
    }
  };

  // UI Render states based on permission
  if (permission === "unsupported") return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 w-full">

      {/* State: GRANTED */}
      {permission === "granted" && (
        <>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Notifications Enabled</p>
              <p className="text-xs text-slate-500">You will receive instant alerts on this device.</p>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </>
      )}

      {/* State: DENIED */}
      {permission === "denied" && (
        <>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <BellOff className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Notifications Blocked</p>
              <p className="text-xs text-slate-500">Unblock in your browser settings to receive alerts.</p>
            </div>
          </div>
        </>
      )}

      {/* State: DEFAULT (Needs Action) */}
      {permission === "default" && (
        <>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Stay Updated</p>
              <p className="text-xs text-slate-500">Enable push notifications for Jama'at alerts.</p>
            </div>
          </div>

          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable"}
          </button>
        </>
      )}

    </div>
  );
}