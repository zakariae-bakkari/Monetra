"use client";

import { useMemo, useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";

interface DailyData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export function ActivityChart() {
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
  
  const chartData = useMemo(() => {
    // Create an array of all days in the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd
    });
    
    // Initialize data for each day
    const dailyData: Record<string, DailyData> = {};
    daysInMonth.forEach(day => {
      const dateKey = format(day, "yyyy-MM-dd");
      dailyData[dateKey] = {
        date: format(day, "MMM dd"),
        income: 0,
        expense: 0,
        balance: 0
      };
    });
    
    // Populate with transaction data
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        const dateKey = format(transactionDate, "yyyy-MM-dd");
        
        if (transaction.type === "Income") {
          dailyData[dateKey].income += transaction.amount;
        } else {
          dailyData[dateKey].expense += transaction.amount;
        }
      }
    });
    
    // Calculate running balance
    let runningBalance = 0;
    return Object.keys(dailyData)
      .sort()
      .map(dateKey => {
        const day = dailyData[dateKey];
        runningBalance += day.income - day.expense;
        return {
          ...day,
          balance: runningBalance
        };
      });
  }, [transactions, monthStart, monthEnd]);
  
  // Format for tooltip
  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            No data available for this month
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => {
                  // Show every 3rd label on smaller screens
                  return index % 3 === 0 ? value : '';
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2} 
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2} 
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2.5} 
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}