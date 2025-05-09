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
    <div className="p-4 md:p-6 w-full ">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Calendar View</h1>
        <p className="text-muted-foreground">
          Track your financial activity day by day
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h2 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
      </div>

      <div className="border rounded-lg m-auto overflow-hidden bg-card">
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 h-[550px]">
          {daysInCalendar.map((day, i) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTransactions = transactionsByDate[dateKey] || [];
            const dayBalance = dailyBalances[dateKey] || {
              income: 0,
              expense: 0,
            };
            const net = dayBalance.income - dayBalance.expense;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[100px] p-2 border-r border-b relative cursor-pointer transition-colors hover:bg-accent/50",
                  !isSameMonth(day, currentMonth) &&
                    "bg-muted/50 text-muted-foreground",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday(day) &&
                        "bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {dayTransactions.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            Transactions on {format(day, "MMM d, yyyy")}
                          </h4>
                          <div className="space-y-1">
                            {dayTransactions.map((t) => (
                              <div
                                key={t.$id}
                                className="flex justify-between items-center text-sm p-1.5 rounded-md hover:bg-muted"
                              >
                                <span>{t.reason || t.category}</span>
                                <span
                                  className={
                                    t.type === "Income"
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }
                                >
                                  {t.type === "Income" ? "+" : "-"}
                                  {t.amount.toFixed(2)} MAD
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 mt-2 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Income</span>
                              <span className="text-green-600 dark:text-green-400 text-sm">
                                +{dayBalance.income.toFixed(2)} MAD
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Expense</span>
                              <span className="text-red-600 dark:text-red-400 text-sm">
                                -{dayBalance.expense.toFixed(2)} MAD
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t">
                              <span className="font-medium">Net</span>
                              <span
                                className={
                                  net >= 0
                                    ? "text-green-600 dark:text-green-400 font-medium"
                                    : "text-red-600 dark:text-red-400 font-medium"
                                }
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

                {dayTransactions.length > 0 && (
                  <div className="mt-2 flex justify-between">
                    {dayBalance.expense !== 0 && (
                      <div
                        className={cn(
                          "text-xs font-medium rounded-sm px-1.5 py-0.5 inline-block",
                            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        )}
                      >
                        -{dayBalance.expense.toFixed(2)} MAD
                      </div>
                    )}
                    {dayBalance.income !== 0 && (
                      <div
                        className={cn(
                          "text-xs font-medium rounded-sm px-1.5 py-0.5 inline-block",
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
                  className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClick(day);
                  }}
                >
                  <Plus className="h-4 w-4" />
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
