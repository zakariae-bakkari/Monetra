"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { Wallet, AlertTriangle, TrendingDown, CreditCard, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@src/lib/utils";
import { Progress } from "@src/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@src/components/ui/tooltip";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";

export function WalletCards() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const user = await account.get();
        const data = await appwriteService.fetchWallets(user.$id);
        setWallets(data);
      } catch (error) {
        console.error("Error fetching wallets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWallets();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex items-center justify-center h-[100px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!wallets || wallets.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">No wallets found</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 MAD</div>
            <p className="text-xs text-muted-foreground mt-1">Add a wallet to get started</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {wallets.map((wallet) => (
        <TooltipProvider key={wallet.$id}>
          <Card className={cn(
            "transition-all hover:shadow-md",
            wallet.balance < 0 && wallet.type !== "Credit Card" && "border-red-500 dark:border-red-400",
            wallet.type === "Credit Card" && wallet.creditLimit && (Math.abs(wallet.balance) / wallet.creditLimit) * 100 >= 80 && "border-yellow-500 dark:border-yellow-400"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{wallet.name}</CardTitle>
              <div className="flex items-center gap-2">
                {wallet.balance < 0 && wallet.type !== "Credit Card" && (
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Negative balance warning</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {wallet.type === "Credit Card" && wallet.creditLimit && (Math.abs(wallet.balance) / wallet.creditLimit) * 100 >= 80 && (
                  <Tooltip>
                    <TooltipTrigger>
                      <ShieldAlert className="h-4 w-4 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>High credit utilization</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {wallet.type === "Credit Card" ? (
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                wallet.balance < 0 && wallet.type !== "Credit Card" 
                  ? "text-red-500 dark:text-red-400" 
                  : wallet.type === "Credit Card" && wallet.balance < 0
                    ? "text-yellow-500 dark:text-yellow-400"
                    : ""
              )}>
                {wallet.balance.toFixed(2)} MAD
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">{wallet.type}</span>
                {wallet.balance < 0 && wallet.type !== "Credit Card" && (
                  <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Negative Balance
                  </span>
                )}
              </div>
              {wallet.type === "Credit Card" && wallet.creditLimit && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Credit Used</span>
                    <span className={cn(
                      (Math.abs(wallet.balance) / wallet.creditLimit) * 100 >= 80 
                        ? "text-yellow-500 dark:text-yellow-400"
                        : "text-muted-foreground"
                    )}>
                      {((Math.abs(wallet.balance) / wallet.creditLimit) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(Math.abs(wallet.balance) / wallet.creditLimit) * 100} 
                    className={cn(
                      "h-1",
                      (Math.abs(wallet.balance) / wallet.creditLimit) * 100 >= 80 
                        ? "bg-yellow-200 dark:bg-yellow-900 [&>div]:bg-yellow-500"
                        : "bg-slate-200 dark:bg-slate-800 [&>div]:bg-slate-500"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(wallet.creditLimit - Math.abs(wallet.balance)).toFixed(2)} MAD available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>
      ))}
    </div>
  );
}