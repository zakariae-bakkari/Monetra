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
    <div className="grid grid-cols-6  min-h-screen">
      <div className="">
        <Navbar />
      </div>
      <main className="col-span-5 max-h-screen overflow-y-scroll bg-background">{children}</main>
    </div>
  );
}
