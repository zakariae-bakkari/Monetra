"use client";
import appwriteService from "@src/lib/appwrite.config";
import useAuth from "@src/app/context/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {FormEvent, useState} from "react";

const Signup = () => {
   const [fomeData, setFormData] = useState({
      email: "",
      password: "",
      name: "",
   });
   const [ error, setError ] = useState<string>("");
   const {setAuthStatus} = useAuth(); 
   return ()
}