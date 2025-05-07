"use client";

import { useState, useEffect, useMemo } from "react";
import { Category } from "@/types/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { startOfMonth, endOfMonth } from "date-fns";
import appwriteService from "@src/lib/store";
import { account } from "@src/lib/appwrite.config";

interface ChartData {
  name: string;
  value: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  // Add more colors if needed
];

export function CategoryPieChart() {
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
  
  // Filter transactions for the current month and only expenses
  const monthlyExpenses = useMemo(() => 
    transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date >= monthStart && date <= monthEnd && transaction.type === "Expense";
    }),
    [transactions, monthStart, monthEnd]
  );
  
  // Group by category and sum
  const categoryData = useMemo(() => {
    const categorySums: Record<Category, number> = {} as Record<Category, number>;
    
    monthlyExpenses.forEach(transaction => {
      if (!categorySums[transaction.category]) {
        categorySums[transaction.category] = 0;
      }
      categorySums[transaction.category] += transaction.amount;
    });
    
    // Convert to array format for chart
    return Object.entries(categorySums)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);
  
  // Format for tooltip
  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            No expense data available for this month
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}