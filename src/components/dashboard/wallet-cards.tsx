"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@src/components/ui/card";
import { AlertTriangle, ShieldAlert, CreditCard, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@src/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@src/components/ui/tooltip";
import Link from "next/link";
import { Wallet } from "@/types/types";

interface WalletCardsProps {
  wallets: Wallet[];
}

export function WalletCards({ wallets }: WalletCardsProps) {
  if (!wallets || wallets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No wallets found</p>
            <Link href="/wallets" className="text-primary hover:underline">
              Add your first wallet
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {wallets.map(wallet => (
        <Link key={wallet.$id} href={`/wallets/${wallet.$id}`}>
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
                  <WalletIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                wallet.balance < 0 && wallet.type !== "Credit Card" 
                  ? "text-red-500 dark:text-red-400" 
                  : wallet.type === "Credit Card" && wallet.balance < 0
                    ? "text-primary dark:text-primary-foreground" 
                    : "text-foreground"
              )}>
                {wallet.balance.toFixed(2)} MAD
              </div>
              <p className="text-xs text-muted-foreground">{wallet.type}</p>
              {wallet.type === "Credit Card" && wallet.creditLimit && (
                <div className="mt-2">
                  <div className="w-full bg-secondary h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={cn(
                        "h-full", 
                        (Math.abs(wallet.balance) / wallet.creditLimit) * 100 >= 80 
                          ? "bg-red-500" 
                          : "bg-primary"
                      )}
                      style={{ 
                        width: `${Math.min(Math.abs(wallet.balance) / wallet.creditLimit * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Credit: {Math.abs(wallet.balance).toFixed(2)} / {wallet.creditLimit.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}