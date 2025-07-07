"use client";
import useAuth from "@src/hooks/useAuth";
import appwriteService from "@src/lib/appwrite.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  ArrowRight,
  Coins,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { cn } from "@src/lib/utils";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuthStatus } = useAuth();
  const router = useRouter();

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userData = await appwriteService.createUserAccount(formData);
      if (userData) {
        // update the auth status in context
        setAuthStatus(true);
        router.push("/dashboard");
      } else {
        setError("Could not create account");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // the name of the input field and its value
    setFormData((prev) => ({
      ...prev,
      [name]: value, // update the state with the new value
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Features list with benefits of joining
  const features = [
    {
      title: "Track expenses easily",
      description: "Categorize and monitor your spending habits",
    },
    {
      title: "Financial insights",
      description: "Visualize your finances with intuitive charts",
    },
    {
      title: "Secure & private",
      description: "Your financial data is always protected",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Registration form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          className="w-full max-w-md space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="text-muted-foreground">
              Start managing your finances with Monetra
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
                  <p className="text-sm text-destructive font-medium">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.form
            className="mt-8 space-y-6"
            onSubmit={create}
            variants={containerVariants}
          >
            <motion.div className="space-y-4" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-[18px] w-[18px] text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="pl-10 border-border/60 focus-visible:ring-primary/30 py-5 bg-secondary/50"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-foreground mb-1"
                >
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-[18px] w-[18px] text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="pl-10 border-border/60 focus-visible:ring-primary/30 py-5 bg-secondary/50"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Password must be at least 8 characters
                </p>
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
                    Creating your account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>

            <motion.p
              className="mt-4 text-center text-sm text-muted-foreground"
              variants={itemVariants}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in instead
              </Link>
            </motion.p>

            <motion.p
              className="text-xs text-center text-muted-foreground"
              variants={itemVariants}
            >
              By creating an account, you agree to our{" "}
              <a href="#" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-foreground">
                Privacy Policy
              </a>
              .
            </motion.p>
          </motion.form>
        </motion.div>
      </div>

      {/* Right side - Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-accent via-accent/90 to-primary/80 p-8 text-accent-foreground justify-center items-center">
        <div className="max-w-md mx-auto">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-3">
              <Coins className="h-10 w-10" />
              <h1 className="text-3xl font-bold"><Link href={"/"}>Monetra</Link></h1>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Start your financial journey today
              </h2>
              <p className="mt-2 text-accent-foreground/80">
                Join thousands of users managing their finances smarter with
                Monetra.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                >
                  <div className="mt-1">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-accent-foreground/70">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-6">
              <div className="border-t border-accent-foreground/20 pt-6">
                <p className="text-sm text-accent-foreground/70">
                  &quot;Since using Monetra, I&apos;ve been able to save 30% more every month
                  and finally have control over my finances.&quot;
                </p>
                <p className="mt-2 text-sm font-medium">
                  — Sarah J., Monetra User
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
