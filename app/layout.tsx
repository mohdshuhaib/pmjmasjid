import type { Metadata, Viewport } from "next";
import { Inter, Anek_Malayalam } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ForegroundFCMListener from "@/components/ForegroundFCMListener";

// 1. Fonts Configuration
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anekMalayalam = Anek_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-anek",
  display: "swap",
});

// 2. Viewport Configuration (Next.js 15 Standard for PWAs)
// export const viewport: Viewport = {
//   themeColor: "#047857", // Example: Emerald Green (changes the phone's top status bar color)
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1, // Prevents weird zooming on mobile inputs
// };

// 3. Upgraded Metadata (SEO, WhatsApp, and PWA)
// export const metadata: Metadata = {
//   title: "PMJ Masjid - Perunguzhi",
//   description: "Official web portal for Perunguzhi Muslim Jamath Masjid. Access member dashboards, notifications, and varshika vari details.",
//   manifest: "/manifest.json", // Tells Android this is an installable app
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "default",
//     title: "PMJ Masjid",
//   },
//   openGraph: {
//     title: "PMJ Masjid - Perunguzhi",
//     description: "Official web portal for Perunguzhi Muslim Jamath Masjid.",
//     url: "https://pmjmasjid.vercel.app",
//     siteName: "PMJ Masjid",
//     images: [
//       {
//         url: "/icon-512x512.png", // Your main high-res logo
//         width: 512,
//         height: 512,
//         alt: "PMJ Masjid Logo",
//       },
//     ],
//     locale: "en_US", // You can change to ml_IN if the primary UI is Malayalam
//     type: "website",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${anekMalayalam.variable} antialiased min-h-screen bg-gray-50`}>
        <Toaster position="top-center" />
        {/* Hidden component to listen for Firebase messages while app is open */}
        <ForegroundFCMListener />
        {/* The main page content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}