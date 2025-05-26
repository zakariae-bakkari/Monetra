"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { Calendar, TrendingUp, Wallet2 } from "lucide-react";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";
import { Transaction, Wallet as WalletType } from "@/types/types";
import { cn } from "@src/lib/utils";

export function SummaryCards() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDateTime = useMemo(() => new Date(), []);
  
  const stats = useMemo(() => {
    const thisMonth = currentDateTime.getMonth();
    const thisYear = currentDateTime.getFullYear();
    
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
      pendingReturns
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 summary-cards">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <Wallet2 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="p-6">
          <div className={cn(
            "text-2xl font-bold",
            stats.netWorth >= 0 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            {loading ? (
              <div className="h-7 w-28 bg-muted animate-pulse rounded-md" />
            ) : (
              `${stats.netWorth.toFixed(2)} MAD`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Total balance across all wallets
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Balance</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="p-6">
          <div className={cn(
            "text-2xl font-bold",
            stats.monthly.income - stats.monthly.expense >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            {loading ? (
              <div className="h-7 w-28 bg-muted animate-pulse rounded-md" />
            ) : (
              `${(stats.monthly.income - stats.monthly.expense).toFixed(2)} MAD`
            )}
          </div>
          <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
            <div>In: <span className="text-green-600">{stats.monthly.income.toFixed(2)}</span></div>
            <div>Out: <span className="text-red-600">{stats.monthly.expense.toFixed(2)}</span></div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-secondary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="p-6">
          <div className={cn(
            "text-2xl font-bold",
            stats.pendingReturns >= 0 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-orange-600 dark:text-orange-400"
          )}>
            {loading ? (
              <div className="h-7 w-28 bg-muted animate-pulse rounded-md" />
            ) : (
              `${Math.abs(stats.pendingReturns).toFixed(2)} MAD`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingReturns >= 0 
              ? "Expected to receive" 
              : "Expected to repay"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}