"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  isSameMonth,
  isToday,
  startOfWeek,
  addDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@src/components/ui/button";
import { cn } from "@src/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@src/components/ui/popover";
import { account } from "@src/lib/appwrite.config";
import appwriteService from "@src/lib/store";
import { TransactionNewDialog } from "@src/components/transactions/transaction-new-dialog";
import { Transaction } from "@src/types/types";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    try {
      const user = await account.get();
      const data = await appwriteService.fetchTransactions(user.$id);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }
  useEffect(() => {
    fetchTransactions()
      .then(() => setLoading(false))
  }, []);

  const monthStart = startOfMonth(currentMonth);
  // const monthEnd = endOfMonth(currentMonth);
  // const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // For full weeks display
  const calendarStartDate = startOfWeek(monthStart);
  const daysInCalendar = [];

  for (let i = 0; i < 42; i++) {
    daysInCalendar.push(addDays(calendarStartDate, i));
  }

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const dateKey = format(new Date(transaction.date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    return grouped;
  }, [transactions]);

  // Calculate daily balances
  const dailyBalances = useMemo(() => {
    const balances: Record<string, { income: number; expense: number }> = {};

    for (const dateKey in transactionsByDate) {
      const dayTransactions = transactionsByDate[dateKey];
      const income = dayTransactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTransactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);

      balances[dateKey] = { income, expense };
    }

    return balances;
  }, [transactionsByDate]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowTransactionDialog(true);
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Loading calendar data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Calendar View</h1>
        <p className="text-muted-foreground">Track your financial activity day by day</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-lg">
          <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 rounded-md">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <h2 className="text-lg font-semibold px-2">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 rounded-md">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="hover:border-accent/30 border-1 bg-none hover:bg-accent/20 text-white hover:text-accent">
            Today
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => {
              setSelectedDate(new Date());
              setShowTransactionDialog(true);
            }}
            className="hover:border-primary/30 border-primary/60  border-1 bg-primary/40 hover:bg-primary/20 text-white hover:text-primary"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-muted/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-semibold text-foreground/70"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr bg-background">
          {daysInCalendar.map((day, i) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTransactions = transactionsByDate[dateKey] || [];
            const dayBalance = dailyBalances[dateKey] || {
              income: 0,
              expense: 0,
            };
            const net = dayBalance.income - dayBalance.expense;
            const hasTransactions = dayTransactions.length > 0;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "group min-h-[90px] md:min-h-[120px] p-2 border border-border/40 relative cursor-pointer transition-all",
                  !isSameMonth(day, currentMonth) && "bg-muted/30 text-muted-foreground",
                  isToday(day) && "bg-primary/5 border-primary/30",
                  "hover:bg-accent/10 hover:border-accent/30",
                  hasTransactions && "bg-gradient-to-b from-transparent to-accent/5",
                  i % 7 === 0 && "border-l-0", // Left edge
                  i < 7 && "border-t-0", // Top edge
                  i % 7 === 6 && "border-r-0", // Right edge
                  i >= 35 && "border-b-0" // Bottom edge
                )}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "text-sm font-medium h-6 w-6 flex items-center justify-center",
                      isToday(day) && "bg-primary text-primary-foreground rounded-full",
                      !isToday(day) && !isSameMonth(day, currentMonth) && "text-muted-foreground/60"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {hasTransactions && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full border-primary/20 bg-background"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-2">
                          <h4 className="font-medium border-b pb-1 mb-2">
                            {format(day, "MMMM d, yyyy")}
                          </h4>
                          <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
                            {dayTransactions.map((t) => (
                              <div
                                key={t.$id}
                                className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-accent/10"
                              >
                                <span className="font-medium">{t.reason || t.category}</span>
                                <span
                                  className={cn(
                                    "font-semibold",
                                    t.type === "Income" 
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  )}
                                >
                                  {t.type === "Income" ? "+" : "-"}
                                  {t.amount.toFixed(2)} MAD
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 mt-2 bg-muted/30 rounded-lg p-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Income</span>
                              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                +{dayBalance.income.toFixed(2)} MAD
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Expense</span>
                              <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                                -{dayBalance.expense.toFixed(2)} MAD
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t">
                              <span className="font-medium">Net</span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  net >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                )}
                              >
                                {net >= 0 ? "+" : ""}
                                {net.toFixed(2)} MAD
                              </span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {hasTransactions && (
                  <div className="mt-2 flex flex-col gap-1">
                    {dayBalance.expense !== 0 && (
                      <div
                        className={cn(
                          "text-xs font-medium rounded-md px-1.5 py-0.5 inline-flex justify-center items-center",
                          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        )}
                      >
                        -{dayBalance.expense.toFixed(2)} MAD
                      </div>
                    )}
                    {dayBalance.income !== 0 && (
                      <div
                        className={cn(
                          "text-xs font-medium rounded-md px-1.5 py-0.5 inline-flex justify-center items-center",
                          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        )}
                      >
                        +{dayBalance.income.toFixed(2)} MAD
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 bottom-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-accent/20 hover:bg-accent/30 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClick(day);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* TransactionNewDialog component with proper props */}
      {selectedDate && (
        <TransactionNewDialog
          open={showTransactionDialog}
          onClose={() => setShowTransactionDialog(false)}
          onTransactionAdded={handleTransactionAdded}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
