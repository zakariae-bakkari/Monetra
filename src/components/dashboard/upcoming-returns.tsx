"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { 
  BadgeDollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  CalendarClock,
  Loader2
} from "lucide-react";
import { format, isAfter } from "date-fns";
import { cn } from "@src/lib/utils";
import { Badge } from "@src/components/ui/badge";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";

export function UpcomingReturns() {
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
  
  const upcomingReturns = useMemo(() => {
    return transactions
      .filter(t => t.expectedReturnDate && isAfter(new Date(t.expectedReturnDate), now))
      .sort((a, b) => {
        return new Date(a.expectedReturnDate!).getTime() - new Date(b.expectedReturnDate!).getTime();
      })
      .slice(0, 5); // Limit to first 5
  }, [transactions, now]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Returns</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (upcomingReturns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Returns</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          <BadgeDollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No upcoming money returns</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Returns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingReturns.map((transaction) => (
            <div key={transaction.$id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div>
                <div className="flex items-center mb-1">
                  {transaction.type === "Expense" ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      To Receive
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 text-xs">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      To Pay
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium">{transaction.reason || transaction.category}</p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  {format(new Date(transaction.expectedReturnDate!), "MMM d, yyyy")}
                </div>
              </div>
              <div className={cn(
                "text-base font-medium",
                transaction.type === "Expense" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-orange-600 dark:text-orange-400"
              )}>
                ${transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}