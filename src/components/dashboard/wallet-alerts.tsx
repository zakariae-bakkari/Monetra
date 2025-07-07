"use client";

import { AlertTriangle, ChevronRight, CreditCard, ShieldAlert, TrendingDown } from "lucide-react";
import { Wallet } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletAlertsProps {
  wallets: Wallet[];
}

export function WalletAlerts({ wallets }: WalletAlertsProps) {
  if (!wallets || wallets.length === 0) return null;

  const alerts = [];

  // Check for negative balances in non-credit card wallets
  const negativeWallets = wallets.filter(w => w.balance < 0 && w.type !== "Credit Card");
  if (negativeWallets.length > 0) {
    alerts.push({
      type: "error",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      title: "Negative Balance Warning",
      description: `${negativeWallets.length} wallet${negativeWallets.length > 1 ? 's have' : ' has'} a negative balance. Please review your transactions.`
    });
  }

  // Check for high credit utilization
  const highUtilizationCards = wallets.filter(w => 
    w.type === "Credit Card" && 
    w.creditLimit && 
    (Math.abs(w.balance) / w.creditLimit) * 100 >= 80
  );
  if (highUtilizationCards.length > 0) {
    alerts.push({
      type: "warning",
      icon: <ShieldAlert className="h-5 w-5 text-yellow-500" />,
      title: "High Credit Utilization",
      description: `${highUtilizationCards.length} credit card${highUtilizationCards.length > 1 ? 's have' : ' has'} high utilization. Consider reducing the balance to improve your credit score.`
    });
  }

  // Check for low balance warnings
  const lowBalanceWallets = wallets.filter(w => 
    w.type !== "Credit Card" && 
    w.balance > 0 && 
    w.balance < 500
  );
  if (lowBalanceWallets.length > 0) {
    alerts.push({
      type: "warning",
      icon: <TrendingDown className="h-5 w-5 text-yellow-500" />,
      title: "Low Balance Alert",
      description: `${lowBalanceWallets.length} wallet${lowBalanceWallets.length > 1 ? 's have' : ' has'} a balance below 500 MAD.`
    });
  }

  // Check for credit cards near limit
  const nearLimitCards = wallets.filter(w => 
    w.type === "Credit Card" && 
    w.creditLimit && 
    (Math.abs(w.balance) / w.creditLimit) * 100 >= 90
  );
  if (nearLimitCards.length > 0) {
    alerts.push({
      type: "error",
      icon: <CreditCard className="h-5 w-5 text-yellow-500" />,
      title: "Credit Limit Warning",
      description: `${nearLimitCards.length} credit card${nearLimitCards.length > 1 ? 's are' : ' is'} near the credit limit.`
    });
  }

  if (alerts.length === 0) return null;

  return (
    <Card className="bg-card rounded-xl mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <p className="font-semibold">Alerts & Notifications</p>
              <p className="text-sm text-muted-foreground">Unusual payment added to your sub-accounts</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary font-semibold"
          >
            View All
          </Button>
        </div>

        <div className="space-y-2 mt-4">
          {alerts.map((alert, index) => (
            <div key={index} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
              <p className="text-sm">{alert.description}</p>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}