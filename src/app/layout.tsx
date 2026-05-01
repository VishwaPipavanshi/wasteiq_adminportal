import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BarLayout from "@/components/layout/Barlayout"; // ✅ Import your combined layout

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WasteIQ AdminPortal",
  description: "Admin panel for Garbage Detection & Classification AI",
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ BarLayout handles Sidebar + Topbar + Page content */}
        <BarLayout>
          {children}
        </BarLayout>
      </body>
    </html>
  );
}
