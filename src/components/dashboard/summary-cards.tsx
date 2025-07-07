"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@src/components/ui/card";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";
import { Transaction, Wallet as WalletType } from "@/types/types";
import { cn } from "@src/lib/utils";
import { format } from "date-fns";

export function SummaryCards() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDateTime = useMemo(() => new Date(), []);
  
  const stats = useMemo(() => {
    const thisMonth = currentDateTime.getMonth();
    const thisYear = currentDateTime.getFullYear();
    
    // Monthly calculation
    const monthly = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      })
      .reduce(
        (acc, t) => {
          if (t.type === "Income") {
            acc.income += t.amount;
          } else {
            acc.expense += t.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );
    
    // Total balance from all time
    const allTimeBalance = transactions.reduce(
      (acc, t) => {
        if (t.type === "Income") {
          acc.income += t.amount;
        } else {
          acc.expense += t.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    
    const netWorth = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    
    const pendingReturns = transactions
      .filter(t => t.expectedReturnDate && new Date(t.expectedReturnDate) > currentDateTime)
      .reduce((sum, t) => {
        // If it's an expense that will be returned, it's incoming (positive)
        // If it's an income that will be returned, it's outgoing (negative)
        return sum + (t.type === "Expense" ? t.amount : -t.amount);
      }, 0);
    
    return {
      monthly,
      netWorth,
      pendingReturns,
      allTimeBalance
    };
  }, [transactions, wallets, currentDateTime]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await account.get();
        const [fetchedTransactions, fetchedWallets] = await Promise.all([
          appwriteService.fetchTransactions(user.$id),
          appwriteService.fetchWallets(user.$id),
        ]);

        setTransactions(fetchedTransactions);
        setWallets(fetchedWallets);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-card rounded-xl">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Net Worth</p>
          {loading ? (
            <div className="h-7 w-28 bg-secondary/50 animate-pulse rounded-md my-1" />
          ) : (
            <p className={cn(
              "text-2xl font-bold",
              stats.netWorth >= 0 
                ? "text-primary" 
                : "text-destructive"
            )}>
              {stats.netWorth.toFixed(2)} MAD
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            +10.4% this month
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card rounded-xl">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Monthly Balance</p>
          {loading ? (
            <div className="h-7 w-28 bg-secondary/50 animate-pulse rounded-md my-1" />
          ) : (
            <p className={cn(
              "text-2xl font-bold",
              stats.monthly.income - stats.monthly.expense >= 0 
                ? "text-foreground" 
                : "text-destructive"
            )}>
              {(stats.monthly.income - stats.monthly.expense).toFixed(2)} MAD
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card rounded-xl">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">All-Time Balance</p>
          {loading ? (
            <div className="h-7 w-28 bg-secondary/50 animate-pulse rounded-md my-1" />
          ) : (
            <p className={cn(
              "text-2xl font-bold",
              stats.allTimeBalance.income - stats.allTimeBalance.expense >= 0 
                ? "text-foreground" 
                : "text-destructive"
            )}>
              {(stats.allTimeBalance.income - stats.allTimeBalance.expense).toFixed(2)} MAD
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Total till {format(new Date(), 'dd/MM/yy')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}