"use client";

// import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/card";
import { Transaction } from "@/types/types";

interface ActivityChartProps {
  transactions: Transaction[];
}

export function ActivityChart({ transactions }: ActivityChartProps) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  
  const dailyData = eachDayOfInterval({ start, end }).map(day => {
    const dayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getDate() === day.getDate() &&
        transactionDate.getMonth() === day.getMonth() &&
        transactionDate.getFullYear() === day.getFullYear()
      );
    });
    
    const income = dayTransactions
      .filter(t => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = dayTransactions
      .filter(t => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: format(day, "dd/MM"),
      income,
      expense,
      balance: income - expense
    };
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{`Date: ${label}`}</p>
          <p style={{ color: '#10b981' }}>{`Income: ${payload[0].value?.toFixed(2)} MAD`}</p>
          <p style={{ color: '#ef4444' }}>{`Expense: ${payload[1].value?.toFixed(2)} MAD`}</p>
          <p style={{ color: payload[2].value && payload[2].value >= 0 ? '#10b981' : '#ef4444' }}>
            {`Balance: ${payload[2].value?.toFixed(2)} MAD`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-4 activity-chart">
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}