"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@src/components/ui/card";
import { Wallet, Calendar, TrendingUp} from "lucide-react";
import { cn } from "@src/lib/utils";
import { Transaction, Wallet as WalletType } from "@/types/types";

interface SummaryCardsProps {
  transactions: Transaction[];
  wallets?: WalletType[];
}

export function SummaryCards({ transactions, wallets = [] }: SummaryCardsProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            stats.netWorth >= 0 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            {stats.netWorth.toFixed(2)} MAD
          </div>
          <p className="text-xs text-muted-foreground">
            Total balance across all wallets
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Balance</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            stats.monthly.income - stats.monthly.expense >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            {(stats.monthly.income - stats.monthly.expense).toFixed(2)} MAD
          </div>
          <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
            <div>In: <span className="text-green-600">{stats.monthly.income.toFixed(2)}</span></div>
            <div>Out: <span className="text-red-600">{stats.monthly.expense.toFixed(2)}</span></div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            stats.pendingReturns >= 0 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-orange-600 dark:text-orange-400"
          )}>
            {Math.abs(stats.pendingReturns).toFixed(2)} MAD
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