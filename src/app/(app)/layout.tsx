"use client";
import Navbar from "@src/components/layouts/navbar";
import useAuth from "@src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { authStatus } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
   if (!authStatus) {
     router.replace("/login");
   }
 }, [authStatus, router]);

return (
  <div className="flex min-h-screen">
    <div>
      <Navbar />
    </div>
    <main className="flex-1 max-h-screen overflow-y-scroll bg-background">
      {children}
    </main>
  </div>
);
}
