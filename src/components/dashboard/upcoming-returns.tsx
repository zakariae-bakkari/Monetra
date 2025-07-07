"use client";

import { useMemo } from "react";
import { 
  CalendarClock,
  Calendar,
} from "lucide-react";
import { format, isAfter } from "date-fns";
import { cn } from "@src/lib/utils";
import { Transaction } from "@/types/types";

interface UpcomingReturnsProps {
  transactions: Transaction[];
}

export function UpcomingReturns({ transactions }: UpcomingReturnsProps) {
  const currentDateTime = useMemo(() => new Date(), []);
  
  const upcomingReturns = useMemo(() => {
    return transactions
      .filter(t => t.expectedReturnDate && isAfter(new Date(t.expectedReturnDate), currentDateTime))
      .sort((a, b) => {
        return new Date(a.expectedReturnDate!).getTime() - new Date(b.expectedReturnDate!).getTime();
      })
      .slice(0, 5); // Limit to first 5
  }, [transactions, currentDateTime]);
  
  if (upcomingReturns.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 h-full">
        <h3 className="font-bold text-lg mb-1">Upcoming</h3>
        <p className="text-sm text-muted-foreground mb-4">Monitor your future transactions</p>
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-secondary/50 rounded-full mx-auto flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-semibold text-white">No upcoming transactions</p>
          <p className="text-sm text-muted-foreground">No upcoming recurring bills.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 h-full">
      <h3 className="font-bold text-lg mb-1">Upcoming</h3>
      <p className="text-sm text-muted-foreground mb-4">Monitor your future transactions</p>
      
      <div className="space-y-3">
        {upcomingReturns.map((transaction) => (
          <div key={transaction.$id} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
            <div>
              <div className="flex items-center mb-1">
                <p className="text-sm font-medium">
                  {transaction.reason || transaction.category}
                </p>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarClock className="h-3 w-3 mr-1 text-gray-400" />
                {format(new Date(transaction.expectedReturnDate!), "MMM d, yyyy")}
              </div>
            </div>
            <div className={cn(
              "text-base font-medium",
              transaction.type === "Expense" 
                ? "text-green-500" 
                : "text-orange-500"
            )}>
              {transaction.amount.toFixed(2)} MAD
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}