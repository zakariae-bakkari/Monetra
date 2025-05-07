"use client";
import './globals.css';
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import appwriteService from "@src/lib/appwrite.config";
import { AuthProvider } from "@src/context/authContext";

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
  const [authStatus,setAuthStatus  ] = useState(false);
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    appwriteService.isLoggedIn().then(setAuthStatus).finally(()=>setLoader(false));
  }, []);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider value={{ authStatus, setAuthStatus }}>
          {!loader && (
            <>
            <main className="">
              {children}
            </main>
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
