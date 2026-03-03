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

// 2. Viewport Configuration
export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 3. Upgraded Metadata (SEO, WhatsApp, and PWA)
export const metadata: Metadata = {
  metadataBase: new URL("https://pmjmasjid.vercel.app"), // <-- THIS FIXES WHATSAPP!
  title: "PMJ Masjid - Perunguzhi",
  description: "Official web portal for Perunguzhi Muslim Jamath Masjid. Access member dashboards, notifications, and varshika vari details.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PMJ Masjid",
  },
  openGraph: {
    title: "PMJ Masjid - Perunguzhi",
    description: "Official web portal for Perunguzhi Muslim Jamath Masjid.",
    url: "https://pmjmasjid.vercel.app",
    siteName: "PMJ Masjid",
    images: [
      {
        url: "/web-app-manifest-512x512.png", // Using the icon we know is in your public folder
        width: 512,
        height: 512,
        alt: "PMJ Masjid Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${anekMalayalam.variable} antialiased min-h-screen bg-gray-50`}>
        <Toaster position="top-center" />
        <ForegroundFCMListener />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}