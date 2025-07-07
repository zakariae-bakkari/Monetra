"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Settings,
  DollarSign,
  Wallet,
  BarChart,
  User,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { cn } from "@src/lib/utils";
import appwriteService, { account } from "@src/lib/appwrite.config";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Transactions", href: "/transactions", icon: DollarSign },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await account.get();
        // Extract first name or use email as fallback
        const name = userData.name || userData.email || "User";
        setUsername(name.split(' ')[0]);
      } catch (error) {
        console.error("Error loading user:", error);
        setUsername("User");
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      window.location.href = "/login"; // redirect to login page after logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  return (
    <aside className="w-16 bg-sidebar flex flex-col items-center justify-between h-screen py-6 border-r border-sidebar-border">
      <div className="flex flex-col items-center gap-10">
        <div className="text-primary">
          <BarChart className="h-6 w-6" />
        </div>
        <nav className="flex flex-col items-center space-y-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "p-3 rounded-xl transition-colors duration-200",
                  isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary/30 hover:text-primary"
                )}
                >
                <item.icon className="h-5 w-5" />
                </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="p-2 rounded-full bg-secondary/30 text-muted-foreground hover:text-primary hover:bg-secondary/50"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && (
            theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar 
              className="h-10 w-10 border-2 border-primary/30 cursor-pointer hover:border-primary/60"
            >
              <AvatarFallback className="bg-secondary text-foreground">
              {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
