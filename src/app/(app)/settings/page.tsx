"use client";

import { useState, useEffect } from "react";
import { Button } from "@src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@src/components/ui/card";
import { Input } from "@src/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@src/components/ui/switch";
import { Label } from "@src/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@src/components/ui/tabs";
import { 
  User, 
  KeyRound, 
  Shield, 
  Smartphone, 
  Mail, 
  LogOut, 
  Loader2, 
  BellRing,
  Briefcase
} from "lucide-react";
import { account } from "@src/lib/appwrite.config";
import { 
  Dialog, 
  DialogClose, 
  DialogContent,
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@src/components/ui/dialog";

interface UserData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  status: boolean;
  accessedAt: string;
  passwordUpdate: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const { toast } = useToast();

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const userData = await account.get();
        console.log("User data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "Error",
          description: "Failed to load your account data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdatingPassword(true);
    
    const formData = new FormData(event.currentTarget);
    // const oldPassword = formData.get('oldPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match",
        variant: "destructive",
      });
      setUpdatingPassword(false);
      return;
    }
    
    try {
      // This is a placeholder - you'll need to implement the actual password change in your Appwrite service
      // await account.updatePassword(newPassword, oldPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed",
      });
      
      // Reset the form
      event.currentTarget.reset();
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your password",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleChangeEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdatingEmail(true);
    
    // const formData = new FormData(event.currentTarget);
    // const newEmail = formData.get('email') as string;
    // const password = formData.get('password') as string;
    
    try {
      // This is a placeholder - you'll need to implement the actual email change in your Appwrite service
      // await account.updateEmail(newEmail, password);
      
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox to complete the email change",
      });
      
      // Reset the form
      event.currentTarget.reset();
    } catch (error) {
      console.error("Error changing email:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your email",
        variant: "destructive",
      });
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleConnectProvider = (provider: string) => {
    toast({
      title: `Connect to ${provider}`,
      description: `This would connect your account to ${provider}`,
    });
    // Implement the actual OAuth connection logic here
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences, security, and connected services
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8 p-1 bg-muted/40 rounded-lg">
          <TabsTrigger value="account" className="rounded-md">Account</TabsTrigger>
          <TabsTrigger value="security" className="rounded-md">Security</TabsTrigger>
          <TabsTrigger value="connections" className="rounded-md">Connections</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-md">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card className="border rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} className="border-input/60" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Email Address</CardTitle>
                    <CardDescription>
                      Update your email address
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-email" className="text-foreground">Current Email</Label>
                    <Input id="current-email" value={user?.email} disabled className="bg-muted/50 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">New Email Address</Label>
                    <Input id="email" name="email" type="email" required className="border-input/60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Confirm Password</Label>
                    <Input id="password" name="password" type="password" required className="border-input/60" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatingEmail} className="bg-primary hover:bg-primary/90">
                      {updatingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Email'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl overflow-hidden shadow-sm border-destructive/20">
              <CardHeader className="bg-destructive/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-destructive/10 p-2 rounded-lg">
                    <LogOut className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-destructive">Delete Account</CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                    <p className="text-sm text-muted-foreground">
                      This action is permanent and cannot be undone. All your data will be erased, including:
                    </p>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                      <li>All your wallets and financial records</li>
                      <li>Transaction history and reports</li>
                      <li>Personal settings and preferences</li>
                    </ul>
                  </div>
                  <div className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                          
                          if (!password) {
                            toast({
                              title: "Password Required",
                              description: "You must enter your password to delete your account",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          try {
                            // Implement actual account deletion logic here
                            // await appwriteService.deleteAccount(password);
                            toast({
                              title: "Account Deletion Initiated",
                              description: "Your account and associated data are being deleted",
                            });
                          } catch (error) {
                            console.error("Error deleting account:", error);
                            toast({
                              title: "Deletion Failed",
                              description: "There was an error deleting your account. Please check your password and try again.",
                              variant: "destructive",
                            });
                          }
                        }}>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Confirm your password</Label>
                              <Input id="password" name="password" type="password" placeholder="Enter your password" required />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" variant="destructive">Delete Account</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card className="border rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword" className="text-foreground">Current Password</Label>
                    <Input id="oldPassword" name="oldPassword" type="password" required className="border-input/60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" required className="border-input/60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required className="border-input/60" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatingPassword} className="bg-primary hover:bg-primary/90">
                      {updatingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                  <div>
                    <h3 className="font-medium">Enable 2FA</h3>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <Switch id="2fa" />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" className="border-primary/30 hover:border-primary/60">
                    Setup Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Session Management</CardTitle>
                    <CardDescription>
                      Manage your active sessions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Current Session</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">Active</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-20">Device:</span>
                      <span>{navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Current Device'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-20">Last active:</span>
                      <span>Just now</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-20">Location:</span>
                      <span>Unknown</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" className="border-primary/30 hover:border-primary/60">
                    Sign out of all devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="connections">
          <div className="grid gap-6">
            <Card className="border rounded-xl overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>
                      Connect your account to other services for easier login
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12s4.5 10 10 10 10-4.5 10-10z"/><circle cx="12" cy="12" r="4"/></svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Google</h3>
                        <p className="text-sm text-muted-foreground">
                          Login with your Google account
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleConnectProvider('Google')} variant="outline" size="sm" className="border-primary/30 hover:border-primary/60 min-w-[100px]">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Facebook</h3>
                        <p className="text-sm text-muted-foreground">
                          Login with your Facebook account
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleConnectProvider('Facebook')} variant="outline" size="sm" className="border-primary/30 hover:border-primary/60 min-w-[100px]">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-2 rounded-lg">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                      </div>
                      <div>
                        <h3 className="font-medium">GitHub</h3>
                        <p className="text-sm text-muted-foreground">
                          Login with your GitHub account
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleConnectProvider('GitHub')} variant="outline" size="sm" className="border-primary/30 hover:border-primary/60 min-w-[100px]">
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="border rounded-xl overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BellRing className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your account via email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Notification Preferences</h3>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors">
                      <div>
                        <p className="font-medium text-sm">Account Security Alerts</p>
                        <p className="text-xs text-muted-foreground">Get notified about login attempts and security updates</p>
                      </div>
                      <Switch id="security-alerts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors">
                      <div>
                        <p className="font-medium text-sm">Low Balance Alerts</p>
                        <p className="text-xs text-muted-foreground">Get notified when your wallet balance drops below a threshold</p>
                      </div>
                      <Switch id="low-balance" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors">
                      <div>
                        <p className="font-medium text-sm">New Features and Updates</p>
                        <p className="text-xs text-muted-foreground">Be the first to know about new Monetra features</p>
                      </div>
                      <Switch id="features-updates" />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors">
                      <div>
                        <p className="font-medium text-sm">Tips and Educational Content</p>
                        <p className="text-xs text-muted-foreground">Receive financial tips and educational resources</p>
                      </div>
                      <Switch id="tips" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 py-4 px-6">
              <Button className="ml-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}