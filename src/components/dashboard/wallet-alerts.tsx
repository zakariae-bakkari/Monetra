"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@src/components/ui/alert";
import { AlertTriangle, TrendingDown, CreditCard, ShieldAlert } from "lucide-react";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";

export function WalletAlerts() {
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

  if (loading) return null;
  if (!wallets || wallets.length === 0) return null;

  const alerts = [];

  // Check for negative balances in non-credit card wallets
  const negativeWallets = wallets.filter(w => w.balance < 0 && w.type !== "Credit Card");
  if (negativeWallets.length > 0) {
    alerts.push({
      type: "error",
      icon: <AlertTriangle className="h-4 w-4" />,
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
      icon: <ShieldAlert className="h-4 w-4" />,
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
      icon: <TrendingDown className="h-4 w-4" />,
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
      icon: <CreditCard className="h-4 w-4" />,
      title: "Credit Limit Warning",
      description: `${nearLimitCards.length} credit card${nearLimitCards.length > 1 ? 's are' : ' is'} near the credit limit.`
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={alert.type === "error" ? "destructive" : "warning"}>
          <div className="flex items-center gap-2">
            {alert.icon}
            <AlertTitle>{alert.title}</AlertTitle>
          </div>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}