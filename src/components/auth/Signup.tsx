"use client";
import useAuth from "@src/hooks/useAuth";
import appwriteService from "@src/lib/appwrite.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {FormEvent, useState} from "react";
import { Input } from "../ui/input";

const Signup = () => {
   const [fomeData, setFormData] = useState({
      email: "",
      password: "",
      name: "",
   });
   const [error, setError] = useState<string>("");
   const {setAuthStatus} = useAuth(); 
   const router = useRouter();

   const create = async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      try {
         const userData = await appwriteService.createUserAccount(fomeData);
         if (userData) {
            // update the auth status in context
            setAuthStatus(true);
            router.push("/calendar");
         } else {
            setError("User not created");
         }
      } catch (error: unknown) {
         setError(error instanceof Error ? error.message : "An unknown error occurred"); 
      }
   }

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target; // the name of the input field and its value
      setFormData((prev) => ({
         ...prev,
         [name]: value, // update the state with the new value
      }))
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
         <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg">
            <div className="text-center">
               <h2 className="mt-6 text-3xl font-extrabold">Create your account</h2>
               <p className="mt-2 text-sm ">
                  Or{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                     already have an account?
                  </Link>
               </p>
            </div>
            
            {error && (
               <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                     <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                     </div>
                  </div>
               </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={create}>
               <div className="rounded-md shadow-sm space-y-4">
                  <div>
                     <label htmlFor="name" className="sr-only">Full Name</label>
                     <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Full Name"
                        value={fomeData.name}
                        onChange={handleChange}
                     />
                  </div>
                  <div>
                     <label htmlFor="email-address" className="sr-only">Email address</label>
                     <Input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                        value={fomeData.email}
                        onChange={handleChange}
                     />
                  </div>
                  <div>
                     <label htmlFor="password" className="sr-only">Password</label>
                     <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                        value={fomeData.password}
                        onChange={handleChange}
                     />
                  </div>
               </div>

               <div>
                  <button
                     type="submit"
                     className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                  >
                     Sign up
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default Signup;