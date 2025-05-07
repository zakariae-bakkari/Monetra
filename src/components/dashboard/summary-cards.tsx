"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { cn } from "@src/lib/utils";
import { startOfMonth, endOfMonth, format } from "date-fns";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";

export function SummaryCards() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = await account.get();
        const data = await appwriteService.fetchTransactions(user.$id);
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const monthTransactions = useMemo(() => 
    transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date >= monthStart && date <= monthEnd;
    }), 
    [transactions, monthStart, monthEnd]
  );
  
  const totalIncome = useMemo(() => 
    monthTransactions
      .filter(t => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0),
    [monthTransactions]
  );
  
  const totalExpense = useMemo(() => 
    monthTransactions
      .filter(t => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0),
    [monthTransactions]
  );
  
  const totalBalance = totalIncome - totalExpense;
  
  const pendingReturns = useMemo(() => 
    transactions
      .filter(t => t.expectedReturnDate && new Date(t.expectedReturnDate) >= now)
      .reduce((sum, t) => {
        if (t.type === "Expense") {
          // Money lent out (we expect to get back)
          return sum + t.amount;
        } else {
          // Money to be repaid (we need to give back)
          return sum - t.amount;
        }
      }, 0),
    [transactions, now]
  );

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {format(monthStart, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpense.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {format(monthStart, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <DollarSign className={cn(
            "h-4 w-4",
            totalBalance >= 0 
              ? "text-green-500" 
              : "text-red-500"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            totalBalance >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            ${Math.abs(totalBalance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            {totalBalance >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            {totalBalance >= 0 ? "Positive" : "Negative"} balance
          </p>
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
            pendingReturns >= 0 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-orange-600 dark:text-orange-400"
          )}>
            ${Math.abs(pendingReturns).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingReturns >= 0 
              ? "Expected to receive" 
              : "Expected to repay"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}