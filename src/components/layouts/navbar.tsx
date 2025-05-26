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
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 h-full border-r bg-background max-h-screen left-0 top-0 pt-4 flex-col">
        <div className="flex-1 px-2">
          <nav className="space-y-1">
            {/* logo monetra */}
            <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative">
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
                <button className="flex items-center gap-5 flex-1 hover:bg-muted rounded-md p-1">
                  <Avatar>
                    <AvatarFallback>
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium truncate">{username}</p>
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
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
          </div>
        </div>
      </div>
      
      {/* Tablet Sidebar (Icons Only) */}
      <div className="hidden sm:flex md:hidden w-16 h-full border-r bg-background max-h-screen left-0 top-0 pt-4 flex-col">
        <div className="flex-1 px-2">
          <nav className="space-y-1">
            {/* logo monetra */}
            <div className="flex justify-center items-center py-2 text-sm rounded-md transition-colors relative">
              M
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex justify-center items-center py-3 text-sm rounded-md transition-colors relative",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isActive && (
                    <span className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t p-2">
          <div className="flex flex-col items-center gap-3 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:bg-muted rounded-md p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
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
                  <span>Logout</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <ModeToggle />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Button and Drawer */}
      <div className="sm:hidden fixed top-4 left-4 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md bg-background border">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" className="w-64 p-2">
            <div className="flex-1">
              <nav className="space-y-1 py-2">
                <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-md mb-2">
                  Monetra
                </div>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : ""
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                        {isActive && (
                          <span className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </nav>
            </div>
            <DropdownMenuSeparator />
            <div className="py-2">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive mt-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
              <div className="pt-2 flex justify-between items-center">
                <span>Theme</span>
                <ModeToggle />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
