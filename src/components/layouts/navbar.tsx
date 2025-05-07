"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Settings,
  DollarSign,
  Wallet,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@src/lib/utils";
import { ModeToggle } from "../mode-toggle";
import appwriteService, { account } from "@src/lib/appwrite.config";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

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

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await account.get();
        setUsername(user.name || "Anonymous");
      } catch (err) {
        console.error("Not authenticated", err);
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
    <div className="w-64 h-full border-r bg-background max-h-screen left-0 top-0 pt-4 flex flex-col">
      <div className="flex-1 px-2">
        <nav className="space-y-1">
          {/* logo monetra */}
          <div
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative"
          >
            Monetra
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
         
          
          <DropdownMenu>
        <DropdownMenuTrigger asChild className="flex-1">
          <button className="flex items-center  gap-5 flex-1 hover:bg-muted rounded-md p-1">
             <Avatar>
        <AvatarFallback>
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
          </Avatar><p className="text-sm font-medium truncate">{username}</p>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span >Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
          </DropdownMenu>
          
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
