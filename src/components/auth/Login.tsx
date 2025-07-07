"use client";
import useAuth from "@src/hooks/useAuth";
import appwriteService from "@src/lib/appwrite.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {FormEvent, useState} from "react";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Coins, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { cn } from "@src/lib/utils";

const Login = () => {
   const [formData, setFormData] = useState({
      email: "",
      password: "",
   });
   const [error, setError] = useState<string>("");
   const [isLoading, setIsLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const {setAuthStatus} = useAuth(); 
   const router = useRouter();

   const login = async (e: FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      setError("");// clear any previous error messages
      setIsLoading(true);
      
      try {
         const user = await appwriteService.login(formData);
         if (user) {
            setAuthStatus(true); // update the auth status in context
            router.push("/dashboard"); // redirect to dashboard page
         } else {
            setError("User not found");
         }
      } catch (error: unknown) {
         setError(error instanceof Error ? error.message : "An unknown error occurred"); // set the error message if an error occurs
      } finally {
         setIsLoading(false);
      }
   }

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target; // the name of the Input field and its value
      setFormData((prev) => ({
         ...prev,
         [name]: value, // update the state with the new value
      }))
   }

   // Animation variants
   const containerVariants = {
      hidden: { opacity: 0 },
      visible: { 
         opacity: 1,
         transition: { 
            staggerChildren: 0.15,
            delayChildren: 0.2
         } 
      }
   };
   
   const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { 
         y: 0, 
         opacity: 1,
         transition: { 
            type: "spring",
            stiffness: 100,
            damping: 15
         }
      }
   };

   return (
      <div className="min-h-screen flex flex-col md:flex-row">
         {/* Left side - Brand panel */}
         <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/60 p-8 text-primary-foreground justify-center items-center">
            <div className="max-w-md mx-auto">
               <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
               >
                  <div className="flex items-center space-x-3">
                     <Coins className="h-10 w-10" />
                     <h1 className="text-3xl font-bold"><Link href={"/"}>Monetra</Link></h1>
                  </div>
                  
                  <h2 className="text-2xl font-semibold">Welcome back!</h2>
                  
                  <p className="text-primary-foreground/80">
                     Log in to continue your journey toward financial success with Monetra&apos;s powerful tools and insights.
                  </p>
                  
                  <div className="pt-6">
                     <div className="border-t border-primary-foreground/20 pt-6">
                        <div className="flex items-center space-x-4">
                           <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                              <Coins className="h-6 w-6" />
                           </div>
                           <div>
                              <h3 className="font-medium">Smart Financial Tracking</h3>
                              <p className="text-sm text-primary-foreground/70">Manage your finances with ease</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* Right side - Login form */}
         <div className="flex-1 flex items-center justify-center p-6 bg-background">
            <motion.div 
               className="w-full max-w-md space-y-8"
               variants={containerVariants}
               initial="hidden"
               animate="visible"
            >
               <motion.div className="text-center space-y-2" variants={itemVariants}>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
                  <p className="text-muted-foreground">
                     Enter your credentials to access your account
                  </p>
               </motion.div>
               
               {error && (
                  <motion.div 
                     className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md"
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                  >
                     <div className="flex">
                        <div className="ml-3">
                           <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                     </div>
                  </motion.div>
               )}
               
               <motion.form 
                  className="mt-8 space-y-6" 
                  onSubmit={login}
                  variants={containerVariants}
               >
                  <motion.div className="space-y-4" variants={containerVariants}>
                     <motion.div variants={itemVariants}>
                        <label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1">
                           Email address
                        </label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-3 h-[18px] w-[18px] text-muted-foreground" />
                           <Input
                              id="email-address"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              className="pl-10 border-border/60 focus-visible:ring-primary/30 py-5 bg-secondary/50"
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={handleChange}
                           />
                        </div>
                     </motion.div>
                     
                     <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-1">
                           <label htmlFor="password" className="block text-sm font-medium text-foreground">
                              Password
                           </label>
                           <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                              Forgot password?
                           </a>
                        </div>
                        <div className="relative">
                           <LockKeyhole className="absolute left-3 top-3 h-[18px] w-[18px] text-muted-foreground" />
                           <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              required
                              className="pl-10 border-border/60 focus-visible:ring-primary/30 py-5 bg-secondary/50"
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={handleChange}
                           />
                           <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                           >
                              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                           </button>
                        </div>
                     </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                     <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                           "w-full py-6 bg-primary text-primary-foreground font-medium cursor-pointer",
                           isLoading && "opacity-70 pointer-events-none"
                        )}
                     >
                        {isLoading ? (
                           <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                              Signing in...
                           </>
                        ) : (
                           "Sign in"
                        )}
                     </Button>
                  </motion.div>
                  
                  <motion.p 
                     className="mt-4 text-center text-sm text-muted-foreground"
                     variants={itemVariants}
                  >
                     Don&apos;t have an account?{' '}
                     <Link href="/register" className="font-medium text-primary hover:text-primary/90">
                        Create one now
                     </Link>
                  </motion.p>
               </motion.form>
            </motion.div>
         </div>
      </div>
   );
};

export default Login;