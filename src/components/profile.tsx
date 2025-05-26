"use client";

import { useEffect, useState } from "react";
import { Models } from "appwrite";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Clock,
  CreditCard,
  ExternalLink,
  Edit,
  Settings,
  Key
} from "lucide-react";
import appwriteService from "@src/lib/appwrite.config";
import appwriteStore from "@src/lib/store";
import Link from "next/link";

export default function Profile() {
   const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({
     wallets: 0,
     transactions: 0
   });

   useEffect(() => {
      const fetchUserData = async () => {
         try {
            const userData = await appwriteService.getCurrentUser();
            if (userData) {
               setUser(userData);
               
               // Fetch user stats
               if (userData.$id) {
                 const wallets = await appwriteStore.fetchWallets(userData.$id);
                 const transactions = await appwriteStore.fetchTransactions(userData.$id);
                 setStats({
                   wallets: wallets.length,
                   transactions: transactions.length
                 });
               }
            }
         } catch (error) {
            console.error("Error fetching user:", error);
         } finally {
            setLoading(false);
         }
      };
      
      fetchUserData();
   }, []);

   if (loading) {
      return (
         <div className="p-6 max-w-4xl mx-auto">
            <Skeleton className="h-12 w-48 mb-6" />
            <Card>
               <CardHeader>
                  <div className="flex items-center gap-4">
                     <Skeleton className="h-20 w-20 rounded-full" />
                     <div className="space-y-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-60" />
                     </div>
                  </div>
               </CardHeader>
               <CardContent>
                  <Skeleton className="h-4 w-full my-4" />
                  <Skeleton className="h-4 w-full my-4" />
                  <Skeleton className="h-4 w-full my-4" />
                  <Skeleton className="h-4 w-full my-4" />
               </CardContent>
            </Card>
         </div>
      );
   }

   if (!user) {
      return (
         <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>
            <Card className="border-red-200 bg-red-50/30 dark:bg-red-900/10">
               <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">User Not Found</CardTitle>
                  <CardDescription>Unable to retrieve your profile information</CardDescription>
               </CardHeader>
               <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                     You might need to log in again to access your profile.
                  </p>
                  <Button asChild>
                     <Link href="/login">Login</Link>
                  </Button>
               </CardContent>
            </Card>
         </div>
      );
   }

   // Format dates nicely
   const joinDate = new Date(user.$createdAt).toLocaleDateString(undefined, {
     year: 'numeric', 
     month: 'long', 
     day: 'numeric'
   });
   
   const lastLogin = new Date().toLocaleDateString(undefined, {
     year: 'numeric', 
     month: 'long', 
     day: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   });

   return (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
               <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Profile</h1>
               <p className="text-muted-foreground">Manage your account information and preferences</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" asChild className="border-primary/30 hover:border-primary/60">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main profile card */}
            <Card className="md:col-span-2 shadow-sm border rounded-xl overflow-hidden">
               <CardHeader className="pb-6 bg-gradient-to-r from-primary/10 to-accent/5 border-b">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                     <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                        <AvatarImage 
                          src={`https://avatar.vercel.sh/${user.$id}`} 
                          alt={user.name || "User"} 
                        />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/50 to-accent/50 text-white">
                          {user.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                     </Avatar>
                     <div className="text-center sm:text-left flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                           <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                           <Badge variant="secondary" className="max-w-fit mx-auto sm:mx-0 bg-primary/10 text-primary hover:bg-primary/20">Premium Member</Badge>
                        </div>
                        <CardDescription className="text-base flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                           <Mail className="h-4 w-4" /> {user.email}
                        </CardDescription>
                        
                        <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-6">
                           <div className="flex flex-col items-center sm:items-start">
                              <span className="text-xs text-muted-foreground">Joined</span>
                              <span className="font-medium">{joinDate}</span>
                           </div>
                           <Separator orientation="vertical" className="h-10 hidden sm:block" />
                           <div className="flex flex-col items-center sm:items-start">
                              <span className="text-xs text-muted-foreground">Wallets</span>
                              <span className="font-medium">{stats.wallets}</span>
                           </div>
                           <Separator orientation="vertical" className="h-10 hidden sm:block" />
                           <div className="flex flex-col items-center sm:items-start">
                              <span className="text-xs text-muted-foreground">Transactions</span>
                              <span className="font-medium">{stats.transactions}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </CardHeader>
               
               <CardContent className="p-0">
                  <Tabs defaultValue="personal" className="w-full">
                     <TabsList className="w-full rounded-none border-b h-12 bg-muted/30">
                        <TabsTrigger value="personal" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">
                           Personal Info
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">
                           Security & Access
                        </TabsTrigger>
                     </TabsList>
                     
                     <TabsContent value="personal" className="p-6">
                        <div className="space-y-5">
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">Full Name</p>
                                 <p className="text-muted-foreground">{user.name || "Not provided"}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <Mail className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">Email Address</p>
                                 <p className="text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge 
                                variant={user.emailVerification ? "secondary" : "outline"}
                                className={user.emailVerification ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40" : ""}
                              >
                                {user.emailVerification ? "Verified" : "Unverified"}
                              </Badge>
                           </div>
                           
                           <Separator />
                           
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">Member Since</p>
                                 <p className="text-muted-foreground">{joinDate}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <Clock className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">Last Login</p>
                                 <p className="text-muted-foreground">{lastLogin}</p>
                              </div>
                           </div>
                        </div>
                     </TabsContent>
                     
                     <TabsContent value="security" className="p-6">
                        <div className="space-y-5">
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <Key className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">Password</p>
                                 <p className="text-muted-foreground">Last changed: Never</p>
                              </div>
                              <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary/60">
                                 Change
                              </Button>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">Two-Factor Authentication</p>
                                 <p className="text-muted-foreground">Not enabled</p>
                              </div>
                              <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary/60">
                                 Setup
                              </Button>
                           </div>
                           
                           <Separator />
                           
                           <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                 <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium">User ID</p>
                                 <div className="mt-1 p-2 rounded-md bg-muted/50 border font-mono text-xs text-muted-foreground break-all">
                                    {user.$id}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </TabsContent>
                  </Tabs>
               </CardContent>
            </Card>

            {/* Quick actions and info card */}
            <div className="space-y-6">
               <Card className="border rounded-xl overflow-hidden shadow-sm">
                  <CardHeader className="bg-muted/30">
                     <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                     <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/20" asChild>
                        <Link href="/dashboard">
                           <CreditCard className="mr-2 h-4 w-4 text-primary" />
                           Dashboard Overview
                        </Link>
                     </Button>
                     <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/20" asChild>
                        <Link href="/transactions">
                           <CreditCard className="mr-2 h-4 w-4 text-primary" />
                           View Transactions
                        </Link>
                     </Button>
                     <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/20" asChild>
                        <Link href="/wallets">
                           <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                           Manage Wallets
                        </Link>
                     </Button>
                     <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/20" asChild>
                        <Link href="/calendar">
                           <Calendar className="mr-2 h-4 w-4 text-primary" />
                           Calendar View
                        </Link>
                     </Button>
                  </CardContent>
               </Card>
               
               <Card className="border rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-primary/5 to-accent/10">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-lg">Account Status</CardTitle>
                     <CardDescription>Your current plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Premium Access</Badge>
                        <p className="text-sm mt-2 text-muted-foreground">Active until May 26, 2026</p>
                     </div>
                     <Button variant="outline" className="w-full border-primary/30 hover:border-primary/60">
                        Manage Subscription
                     </Button>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}