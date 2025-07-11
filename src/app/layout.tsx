"use client";

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import appwriteService from "@src/lib/appwrite.config";
import { AuthProvider } from "@src/context/authContext";
import { ThemeProvider } from "@src/components/theme-provider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"
import { TutorialProvider } from "@src/context/tutorialContext";
import { Toaster } from "@src/components/ui/sonner";
import { TutorialManager } from "@src/components/tutorial/TutorialManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authStatus, setAuthStatus] = useState(false);
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    appwriteService
      .isLoggedIn()
      .then(setAuthStatus)
      .finally(() => setLoader(false));
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider value={{ authStatus, setAuthStatus }}>
          {!loader && (
            <>
              <ThemeProvider>
                <TutorialProvider>
                  <TutorialManager>
                    {children}
                    <Toaster />
                  </TutorialManager>
                </TutorialProvider>
                <SpeedInsights />
                <Analytics />
              </ThemeProvider>
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
