"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "@src/hooks/useAuth";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@src/components/ui/button";
import { ChevronRight, Coins, CreditCard, PieChart, Shield, TrendingUp, Wallet } from "lucide-react";

// Feature card component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variants: Variants; // Using any for Framer Motion variants, could be typed more precisely
  color?: "primary" | "accent" | "secondary";
}

export default function HomePage() {
  const { authStatus } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If user is already logged in, redirect them to calendar
    if (authStatus) {
      router.push("/dashboard");
    }
  }, [authStatus, router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const featureItemVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-secondary/5 via-background to-accent/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated background elements */}
        <motion.div 
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 40, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15,
            ease: "easeInOut",
            delay: 2
          }}
        />

        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex flex-col gap-4" variants={itemVariants}>
              <motion.div
                className="inline-block" 
                variants={itemVariants}
              >
                <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent-foreground ring-1 ring-inset ring-accent/20">
                  <span className="mr-1.5">✨</span> Simple. Powerful. Secure.
                </span>
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight"
                variants={itemVariants}
              >
                Take Control of Your <span className="text-primary relative">
                  Finances
                  <span className="absolute bottom-0 left-0 w-full h-[0.2em] bg-accent/60 -z-10 rounded-full translate-y-2"></span>
                </span>
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground max-w-[600px]"
                variants={itemVariants}
              >
                Monetra helps you track expenses, set budgets, and achieve your financial goals with powerful tools and beautiful visualizations.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 mt-6"
                variants={itemVariants}
              >
                <Link href="/register">
                  <Button size="lg" className="px-8 bg-primary hover:bg-primary/90 text-white gap-2">
                    Get Started — It&apos;s Free
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 border-primary/20 text-primary hover:bg-primary/5">
                    Log In
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="relative lg:ml-auto"
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}
            >
                <div className="relative overflow-hidden rounded-2xl border-2 border-accent/10 bg-card shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-60" />
                <Image 
                  src="/dashboard.png" 
                  alt="Monetra Dashboard Preview"
                  width={600}
                  height={400}
                  className="object-cover w-full aspect-video"
                  onError={(e) => {
                  // Fallback in case image doesn't exist yet
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = "#f1f5f9";
                  target.style.display = "flex";
                  target.style.alignItems = "center";
                  target.style.justifyContent = "center";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-20">
                  <p className="text-white text-center text-lg font-semibold tracking-wide drop-shadow-md">
                  Powerful dashboard with insights at a glance
                  </p>
                </div>
                </div>
              <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground p-3 rounded-xl shadow-lg">
                <Coins className="w-6 h-6" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-24 bg-secondary/5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                Features
              </span>
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold tracking-tighter"
              variants={itemVariants}
            >
              Everything You Need for <span className="text-primary">Financial Success</span>
            </motion.h2>
            <motion.p 
              className="max-w-[700px] text-muted-foreground text-lg"
              variants={itemVariants}
            >
              Our comprehensive tools help you stay organized, make informed decisions, and reach your financial goals faster.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <FeatureCard 
              title="Expense Tracking"
              description="Record and categorize all your expenses with just a few clicks. No more guessing where your money went."
              icon={<TrendingUp className="h-6 w-6" />}
              variants={featureItemVariants}
              color="primary"
            />
            <FeatureCard 
              title="Multiple Wallets"
              description="Manage all your accounts in one place - cash, bank accounts, credit cards, and more."
              icon={<Wallet className="h-6 w-6" />}
              variants={featureItemVariants}
              color="accent"
            />
            <FeatureCard 
              title="Interactive Reports"
              description="Visualize your spending patterns with beautiful charts and detailed reports."
              icon={<PieChart className="h-6 w-6" />}
              variants={featureItemVariants}
              color="primary"
            />
            <FeatureCard 
              title="Budget Planning"
              description="Set monthly budgets for different categories and stay on track with real-time alerts."
              icon={<Coins className="h-6 w-6" />}
              variants={featureItemVariants}
              color="accent"
            />
            <FeatureCard 
              title="Financial Calendar"
              description="See your upcoming bills, payments, and financial events at a glance."
              icon={<CreditCard className="h-6 w-6" />}
              variants={featureItemVariants}
              color="primary"
            />
            <FeatureCard 
              title="Secure & Private"
              description="Your financial data never leaves your device. Privacy and security are our top priorities."
              icon={<Shield className="h-6 w-6" />}
              variants={featureItemVariants}
              color="accent"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold tracking-tighter"
              variants={itemVariants}
            >
              Start Managing Your <span className="text-primary">Finances Today</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-[700px]"
              variants={itemVariants}
            >
              Join thousands of users who are taking control of their financial future with Monetra.
            </motion.p>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8" 
              variants={containerVariants}
            >
              <motion.div 
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-accent/10 shadow-sm"
                variants={featureItemVariants}
              >
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Create an Account</h3>
                <p className="text-muted-foreground text-center text-sm">Sign up in seconds with just your email</p>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-accent/10 shadow-sm"
                variants={featureItemVariants}
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Set Up Wallets</h3>
                <p className="text-muted-foreground text-center text-sm">Add your accounts and track your money</p>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-accent/10 shadow-sm"
                variants={featureItemVariants}
              >
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Track & Analyze</h3>
                <p className="text-muted-foreground text-center text-sm">Gain insights into your spending habits</p>
              </motion.div>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-8">
              <Link href="/register">
                <Button size="lg" className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-white gap-2">
                  Create Your Free Account
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold flex items-center">
                <Coins className="h-5 w-5 mr-2 text-primary" /> 
                <span>Monetra</span>
              </h3>
              <p className="text-muted-foreground">Financial management made simple</p>
            </div>
            <div className="flex space-x-8">
              <Link href="/register" className="text-sm text-foreground/80 hover:text-primary transition-colors">Sign Up</Link>
              <Link href="/login" className="text-sm text-foreground/80 hover:text-primary transition-colors">Login</Link>
              <Link href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Monetra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}



function FeatureCard({ title, description, icon, variants, color = "primary" }: FeatureCardProps) {
  return (
    <motion.div 
      className={`flex flex-col p-6 bg-card rounded-xl border border-${color}/10 shadow-sm`}
      variants={variants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className={`mb-4 p-3 rounded-lg bg-${color}/10 text-${color} self-start`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}