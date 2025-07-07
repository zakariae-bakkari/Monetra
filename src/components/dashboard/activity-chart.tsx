"use client";

import { useMemo } from "react";
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
import { format } from "date-fns";
import { Transaction } from "@/types/types";

interface ActivityChartProps {
  transactions: Transaction[];
}

export function ActivityChart({ transactions }: ActivityChartProps) {
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    // Sort all transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Create a map to aggregate transactions by date
    const dateMap = new Map();
    
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    let cumulativeNet = 0;
    
    // Process each transaction to build cumulative totals
    sortedTransactions.forEach(transaction => {
      const date = format(new Date(transaction.date), "yyyy-MM-dd");
      
      if (transaction.type === "Income") {
        cumulativeIncome += transaction.amount;
        cumulativeNet += transaction.amount;
      } else {
        cumulativeExpense += transaction.amount;
        cumulativeNet -= transaction.amount;
      }
      
      dateMap.set(date, {
        date,
        displayDate: format(new Date(transaction.date), "dd MMM yyyy"),
        cumulativeIncome,
        cumulativeExpense,
        cumulativeNet
      });
    });
    
    return Array.from(dateMap.values());
  }, [transactions]);

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-md shadow-md">
          <p className="font-medium text-white">{payload[0]?.payload.displayDate}</p>
          <p style={{ color: '#22c55e' }}>{`Total Income: ${payload[0].value?.toFixed(2)} MAD`}</p>
          <p style={{ color: '#ff5c5c' }}>{`Total Expense: ${payload[1].value?.toFixed(2)} MAD`}</p>
          <p style={{ color: payload[2].value && payload[2].value >= 0 ? '#7c3aed' : '#ff5c5c' }}>
            {`Net Balance: ${payload[2].value?.toFixed(2)} MAD`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#3a3a45" />
            <XAxis 
              dataKey="displayDate"
              tickFormatter={(value) => {
                return format(new Date(value), "dd/MM");
              }}
              interval="preserveStartEnd"
              stroke="#a1a1aa"
              tick={{ fill: "#a1a1aa" }}
            />
            <YAxis stroke="#a1a1aa" tick={{ fill: "#a1a1aa" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "10px", 
                color: "#ffffff"
              }}
            />
            <Line 
              type="monotone" 
              name="Income"
              dataKey="cumulativeIncome" 
              stroke="#22c55e" 
              strokeWidth={2} 
              dot={{ r: 2, fill: "#22c55e" }}
              activeDot={{ r: 5, fill: "#22c55e" }}
            />
            <Line 
              type="monotone" 
              name="Expense"
              dataKey="cumulativeExpense" 
              stroke="#ff5c5c" 
              strokeWidth={2} 
              dot={{ r: 2, fill: "#ff5c5c" }}
              activeDot={{ r: 5, fill: "#ff5c5c" }}
            />
            <Line 
              type="monotone" 
              name="Net Balance"
              dataKey="cumulativeNet" 
              stroke="#7c3aed" 
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#7c3aed" }}
              activeDot={{ r: 6, fill: "#7c3aed" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No transaction data available</p>
        </div>
      )}
    </div>
  );
}