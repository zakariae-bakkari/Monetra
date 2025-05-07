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
      <div className="p-6 max-w-4xl mx-auto">
         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main profile card */}
            <Card className="md:col-span-2 shadow-sm">
               <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                     <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage 
                          src={`https://avatar.vercel.sh/${user.$id}`} 
                          alt={user.name || "User"} 
                        />
                        <AvatarFallback className="text-xl">
                          {user.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                     </Avatar>
                     <div className="text-center sm:text-left flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                           <CardTitle className="text-2xl">{user.name}</CardTitle>
                           <Badge variant="outline" className="max-w-fit mx-auto sm:mx-0">Member</Badge>
                        </div>
                        <CardDescription className="text-base">{user.email}</CardDescription>
                        
                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-4">
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
               
               <Separator />
               
               <CardContent className="pt-6">
                  <Tabs defaultValue="personal" className="w-full">
                     <TabsList className="mb-4">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                     </TabsList>
                     
                     <TabsContent value="personal">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">Full Name</p>
                                 <p className="text-sm text-muted-foreground">{user.name || "Not provided"}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <Mail className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">Email Address</p>
                                 <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge 
                                variant={user.emailVerification ? "success" : "outline"}
                                className={user.emailVerification ? "bg-green-500" : ""}
                              >
                                {user.emailVerification ? "Verified" : "Unverified"}
                              </Badge>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">Member Since</p>
                                 <p className="text-sm text-muted-foreground">{joinDate}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <Clock className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">Last Login</p>
                                 <p className="text-sm text-muted-foreground">{lastLogin}</p>
                              </div>
                           </div>
                        </div>
                     </TabsContent>
                     
                     <TabsContent value="security">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <Key className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">Password</p>
                                 <p className="text-sm text-muted-foreground">Last changed: Never</p>
                              </div>
                              <Button size="sm" variant="outline">Change</Button>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">Two-Factor Authentication</p>
                                 <p className="text-sm text-muted-foreground">Not enabled</p>
                              </div>
                              <Button size="sm" variant="outline">Setup</Button>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                 <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium">User ID</p>
                                 <p className="text-xs font-mono text-muted-foreground">{user.$id}</p>
                              </div>
                           </div>
                        </div>
                     </TabsContent>
                  </Tabs>
               </CardContent>
            </Card>

            {/* Quick actions and info card */}
            <Card className="shadow-sm h-fit">
               <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/transaction">
                        <CreditCard className="mr-2 h-4 w-4" />
                        View Transactions
                     </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/wallets">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Manage Wallets
                     </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/calendar">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar View
                     </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/settings/security">
                        <Shield className="mr-2 h-4 w-4" />
                        Security Settings
                     </Link>
                  </Button>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}