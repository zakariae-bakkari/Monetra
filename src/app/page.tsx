"use client";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@src/components/ui/button";
import {
  ChevronRight,
  Coins,
  CreditCard,
  PieChart,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Feature card component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variants: Variants; // Using any for Framer Motion variants, could be typed more precisely
  color?: "primary" | "accent" | "secondary";
}

export default function HomePage() {
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const featureItemVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen">
      <Button
        size="lg"
        className="w-full sm:w-auto px-6 py-2 rounded-full bg-gradient-to-r from-primary/80 to-accent/80 text-white hover:from-primary hover:to-accent fixed top-4 right-4 z-50 shadow-lg transition-all flex items-center gap-2"
        onClick={() => router.push("/dashboard")}
      >
        <PieChart className="h-4 w-4" />
        Dashboard
      </Button>
      {/* Hero Section */}
      <motion.section
        className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex flex-col gap-6" variants={itemVariants}>
              <motion.div className="inline-block" variants={itemVariants}>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/30">
                  <span className="mr-1.5">✨</span> Smart Financial Management
                </span>
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1]"
                variants={itemVariants}
              >
                Take Control of Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent relative">
                  Financial Future
                  <span className="absolute bottom-0 left-0 w-full h-[0.2em] bg-gradient-to-r from-primary/60 to-accent/60 -z-10 rounded-full translate-y-2"></span>
                </span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground max-w-[600px] leading-relaxed"
                variants={itemVariants}
              >
                Monetra helps you track expenses, visualize spending patterns,
                and achieve your financial goals with powerful analytics and
                intuitive tools.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mt-2"
                variants={itemVariants}
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 text-primary-foreground gap-2 cursor-pointer bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md"
                  >
                    Get Started — It&apos;s Free
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 border-primary/30 text-primary hover:text-white bg-primary/5 hover:bg-primary/15 cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 mt-6 text-sm text-muted-foreground"
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full border-2 border-background bg-accent/20 flex items-center justify-center text-[10px] font-medium`}
                    >
                      {i === 4 ? "+" : ""}
                    </div>
                  ))}
                </div>
                <span>Joined by 10,000+ users worldwide</span>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative lg:ml-auto"
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-60" />
                <Image
                  src="/dashboard.png"
                  alt="Monetra Dashboard Preview"
                  width={700}
                  height={450}
                  className="object-cover w-full aspect-[4/3] md:aspect-[16/9]"
                  onError={(e) => {
                    // Fallback in case image doesn't exist yet
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = "var(--card)";
                    target.style.display = "flex";
                    target.style.alignItems = "center";
                    target.style.justifyContent = "center";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                  <p className="text-white text-center text-lg font-medium tracking-wide drop-shadow-md">
                    Real-time insights at a glance
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-primary to-accent text-white p-3 rounded-xl shadow-lg">
                <Coins className="w-6 h-6" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-24 bg-gradient-to-br from-background via-secondary/5 to-background"
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
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/30">
                Powerful Features
              </span>
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold tracking-tight max-w-[800px] leading-tight"
              variants={itemVariants}
            >
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financial Success
              </span>
            </motion.h2>
            <motion.p
              className="max-w-[700px] text-muted-foreground text-lg leading-relaxed"
              variants={itemVariants}
            >
              Our comprehensive suite of tools helps you stay organized, make
              informed decisions, and reach your financial goals faster than
              ever before.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
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
              description="Manage all your accounts in one place - cash, bank accounts, credit cards, investments, and more."
              icon={<Wallet className="h-6 w-6" />}
              variants={featureItemVariants}
              color="accent"
            />
            <FeatureCard
              title="Interactive Reports"
              description="Visualize your spending patterns with beautiful charts and detailed reports customized to your needs."
              icon={<PieChart className="h-6 w-6" />}
              variants={featureItemVariants}
              color="primary"
            />
            <FeatureCard
              title="Budget Planning"
              description="Set monthly budgets for different categories and stay on track with real-time alerts and notifications."
              icon={<Coins className="h-6 w-6" />}
              variants={featureItemVariants}
              color="accent"
            />
            <FeatureCard
              title="Financial Calendar"
              description="See your upcoming bills, payments, and financial events at a glance with our intuitive calendar view."
              icon={<CreditCard className="h-6 w-6" />}
              variants={featureItemVariants}
              color="primary"
            />
            <FeatureCard
              title="Secure & Private"
              description="Your financial data never leaves your device. Privacy and security are our top priorities at Monetra."
              icon={<Shield className="h-6 w-6" />}
              variants={featureItemVariants}
              color="accent"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-y border-border/30"
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
              className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Start Your Financial Journey Today
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-[700px] leading-relaxed"
              variants={itemVariants}
            >
              Join thousands of users who are taking control of their financial
              future with Monetra&apos;s intuitive tools.
            </motion.p>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8"
              variants={containerVariants}
            >
              <motion.div
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureItemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  Create an Account
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  Sign up in seconds with just your email address
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-accent/20 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureItemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  Set Up Your Wallets
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  Add your accounts and track your finances in one place
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-secondary/20 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureItemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  Analyze & Optimize
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  Gain valuable insights into your spending patterns
                </p>
              </motion.div>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white gap-2 cursor-pointer shadow-md"
                >
                  Create Your Free Account
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 bg-gradient-to-b from-background to-secondary/5">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center">
                <Coins className="h-5 w-5 mr-2 text-primary" />
                <span>Monetra</span>
              </h3>
              <p className="text-muted-foreground">
                Modern financial management for everyone. Simple, powerful, and
                secure tracking of your finances.
              </p>
              <div className="flex space-x-4 pt-2">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-muted-foreground hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="GitHub"
                  className="text-muted-foreground hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="text-muted-foreground hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Monetra. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Link
                href="/register"
                className="text-sm px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors mr-2"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="text-sm px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-md transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  variants,
  color = "primary",
}: FeatureCardProps) {
  const getColorClassName = (colorName: string): string => {
    switch (colorName) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "accent":
        return "bg-accent/10 text-accent";
      case "secondary":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getBorderClassName = (colorName: string): string => {
    switch (colorName) {
      case "primary":
        return "hover:border-primary/40";
      case "accent":
        return "hover:border-accent/40";
      case "secondary":
        return "hover:border-secondary/40";
      default:
        return "hover:border-primary/40";
    }
  };

  return (
    <motion.div
      className={`flex flex-col p-6 bg-card rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 ${getBorderClassName(
        color
      )}`}
      variants={variants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div
        className={`mb-5 p-3.5 rounded-lg ${getColorClassName(
          color
        )} self-start shadow-sm`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
