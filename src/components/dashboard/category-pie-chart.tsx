"use client";

import { useState, useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { Transaction } from "@/types/types";

// Define a custom type for chart data that's compatible with recharts
interface ChartCategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF',
  '#FF6B6B', '#4ECDC4', '#C7F464', '#FF9F1C', '#CBB3E6',
  '#81B29A', '#F2CC8F'
];

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const [view, setView] = useState<'expense' | 'income'>('expense');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timeFrame, setTimeFrame] = useState<"month" | "year" | "all">("month");
  
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    return transactions.filter(transaction => {
      if (transaction.type !== (view === 'expense' ? 'Expense' : 'Income')) return false;
      
      const txDate = new Date(transaction.date);
      
      if (timeFrame === "month") {
        return txDate.getMonth() === now.getMonth() && 
               txDate.getFullYear() === now.getFullYear();
      } else if (timeFrame === "year") {
        return txDate.getFullYear() === now.getFullYear();
      }
      
      return true; // "all" timeframe
    });
  }, [transactions, view, timeFrame]);

  const chartData = useMemo(() => {
    const categoryData = filteredTransactions
      .reduce((acc, transaction) => {
        const category = transaction.category;
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        
        acc[category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Calculate total for percentages
    const total = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
    
    // Format data for the pie chart
    const data: ChartCategorySummary[] = Object.entries(categoryData).map(([category, amount]) => ({
      category,
      amount,
      percentage: total ? (amount / total) * 100 : 0
    }));

    // Sort by amount descending
    return data.sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Define the tooltip type more precisely
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: ChartCategorySummary;
      value: number;
    }>;
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{data.category}</p>
          <p>{`Amount: ${data.amount.toFixed(2)} MAD`}</p>
          <p>{`${data.percentage.toFixed(2)}% of ${view}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="col-span-2 category-pie-chart">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Category Breakdown</CardTitle>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              view === 'expense' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
            onClick={() => setView('expense')}
          >
            Expenses
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              view === 'income' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
            onClick={() => setView('income')}
          >
            Income
          </button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No {view} transactions to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}