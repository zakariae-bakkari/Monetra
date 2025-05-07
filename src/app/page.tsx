"use client";
import useAuth from "@src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
   const { authStatus } = useAuth();
   const router = useRouter();
   
   useEffect(() => {
    if (authStatus) {
      router.replace("/calendar");
    }
    else {
      router.replace("/login");
    }
  }, [authStatus, router]);
 

}