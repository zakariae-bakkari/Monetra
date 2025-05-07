"use client";

import { useState, useEffect } from "react";
import { Button } from "@src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@src/components/ui/card";
import { Input } from "@src/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@src/components/ui/switch";
import { Label } from "@src/components/ui/label";
import { Separator } from "@src/components/ui/separator";
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
import appwriteService from "@src/lib/store";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@src/components/ui/dialog";
import { DialogContent, DialogTitle } from "@src/components/transactions/transaction-new-dialog";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const { toast } = useToast();

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const userData = await account.get();
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
    const oldPassword = formData.get('oldPassword') as string;
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
    
    const formData = new FormData(event.currentTarget);
    const newEmail = formData.get('email') as string;
    const password = formData.get('password') as string;
    
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
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Address</CardTitle>
                </div>
                <CardDescription>
                  Update your email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-email">Current Email</Label>
                    <Input id="current-email" value={user.email} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">New Email Address</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Confirm Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatingEmail}>
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
            
            <Card className="border-destructive/50">
              <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <LogOut className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Delete Account</CardTitle>
              </div>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
              </CardHeader>
              <CardFooter>
              <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">
                This action is permanent and cannot be undone. All your data will be erased.
                </p>
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
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <Input id="oldPassword" name="oldPassword" type="password" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatingPassword}>
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
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </div>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Enable 2FA</h3>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <Switch id="2fa" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Setup Two-Factor Authentication</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Session Management</CardTitle>
                </div>
                <CardDescription>
                  Manage your active sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Current Session</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">Active</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Device: {navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Current Device'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: Just now
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Sign out of all devices</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="connections">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>Connected Accounts</CardTitle>
                </div>
                <CardDescription>
                  Connect your account to other services for easier login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* <Google className="h-5 w-5" /> */}
                    <div>
                      <h3 className="font-medium">Google</h3>
                      <p className="text-sm text-muted-foreground">
                        Login with your Google account
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleConnectProvider('Google')} variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* <Facebook className="h-5 w-5 text-blue-600" /> */}
                    <div>
                      <h3 className="font-medium">Facebook</h3>
                      <p className="text-sm text-muted-foreground">
                        Login with your Facebook account
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleConnectProvider('Facebook')} variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* <GithubIcon className="h-5 w-5" /> */}
                    <div>
                      <h3 className="font-medium">GitHub</h3>
                      <p className="text-sm text-muted-foreground">
                        Login with your GitHub account
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleConnectProvider('GitHub')} variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BellRing className="h-5 w-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your account via email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Notification Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Account Security Alerts</p>
                  </div>
                  <Switch id="security-alerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Low Balance Alerts</p>
                  </div>
                  <Switch id="low-balance" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">New Features and Updates</p>
                  </div>
                  <Switch id="features-updates" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Tips and Educational Content</p>
                  </div>
                  <Switch id="tips" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}