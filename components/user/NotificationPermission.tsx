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
      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        alert("Push notifications are not supported on this browser/device.");
        setPermission("unsupported");
        setLoading(false);
        return;
      }

      // Request Permission from the user
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === "granted") {
        // Generate FCM Token (Replace with your actual VAPID key from Firebase Console)
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
          // Send the token to our API route to store in Supabase
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
            console.error("Failed to save token to database");
          }
        }
      }
    } catch (error) {
      console.error("Error setting up notifications:", error);
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