"use client";

import { useEffect, useState } from "react";
import appwriteService from "@src/lib/appwrite.config";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    appwriteService
      .isLoggedIn()
      .then((isLoggedIn) => {
        if (isLoggedIn) {
          router.replace("/dashboard");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1e]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1e] min-h-screen flex flex-col">
      {children}
    </div>
  );
}