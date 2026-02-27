# 🕌 PMJ Masjid - Community Management Portal

A modern, full-stack Progressive Web App (PWA) built for the **Perunguzhi Muslim Jamath (PMJ) Masjid**. This platform digitizes member management, automates financial tracking (Varshika Vari & Arrears), and keeps the community engaged through real-time, automated push notifications.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Key Features

* **📱 Progressive Web App (PWA):** Fully installable on iOS and Android with custom splash screens, offline manifests, and mobile-optimized layouts.
* **🔔 Smart Push Notifications (FCM):**
  * **Foreground & Background:** Service workers ensure notifications are delivered whether the app is open or closed.
  * **Automated Reminders:** Scheduled Vercel Cron jobs automatically calculate dues and send personalized payment reminders to specific members.
  * **Admin Broadcasts:** Committee members can instantly broadcast Mahallu notices to all registered devices, safely handling 500+ token batches.
* **⚙️ Automated Financial Engine:** A Supabase SQL Stored Procedure (RPC) runs annually to safely roll over unpaid subscriptions into arrears, handling edge cases and exemptions automatically.
* **🌍 Bilingual Support:** Seamlessly integrates English (Inter) and Malayalam (Anek Malayalam) typography for a localized user experience.
* **🛡️ Role-Based Dashboards:** Secure, separate interfaces for general members (to view dues and manage device tokens) and committee admins (to broadcast notices and view system logs).

## 🏗️ Architecture & Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
* **Backend:** Next.js Server Actions & API Routes.
* **Database & Auth:** Supabase (PostgreSQL) with Row Level Security (RLS).
* **Cloud Messaging:** Firebase Cloud Messaging (FCM) + Firebase Admin SDK.
* **Automation:** Vercel Cron Jobs.

## 🚀 How the Automation Works

To bypass hosting limitations and ensure maximum reliability, the system uses a **Daily Master Cron** pattern:
1. Every day at 3:30 PM IST, Vercel pings a secure Next.js API route.
2. The server checks the current date.
3. If it is the end of the financial year, it triggers the Supabase RPC for financial rollovers.
4. If it is a designated reminder day (e.g., Dec 28th), it joins the `members` and `device_tokens` tables, isolates members with pending dues, and dispatches personalized FCM payloads.
5. All automated actions and dead-token cleanups are recorded in a PostgreSQL `logs` table for admin auditing.