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
import { Transaction } from "@/types/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PieChart as PieChartIcon } from "lucide-react";
import { format, subMonths, subWeeks, subYears, startOfDay, isAfter, isWithinInterval,
  startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek
} from "date-fns";
import { cn } from "@/lib/utils";

// Add DateRange type
type DateRange = {
  from: Date;
  to?: Date;
};

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
  '#7c3aed', '#5d5fef', '#22c55e', '#ff9f3c', '#ff5c5c',
  '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#6366f1', '#ef4444', '#64748b', '#a855f7', '#f97316'
];

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const [view, setView] = useState<'expense' | 'income'>('expense');
  const [timeFrame, setTimeFrame] = useState<"all" | "year" | "month" | "week" | "day" | "custom">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    return transactions.filter(transaction => {
      if (transaction.type !== (view === 'expense' ? 'Expense' : 'Income')) return false;
      
      const txDate = new Date(transaction.date);
      
      // Filter by custom date range if selected
      if (timeFrame === "custom" && dateRange?.from) {
        const isInRange = dateRange.to
          ? isWithinInterval(txDate, { start: dateRange.from, end: dateRange.to })
          : isAfter(txDate, startOfDay(dateRange.from));
        return isInRange;
      }
      
      // Filter by selected time frame
      if (timeFrame === "day") {
        return isAfter(txDate, startOfDay(now));
      } else if (timeFrame === "week") {
        return isAfter(txDate, subWeeks(now, 1));
      } else if (timeFrame === "month") {
        return isAfter(txDate, subMonths(now, 1));
      } else if (timeFrame === "year") {
        return isAfter(txDate, subYears(now, 1));
      }
      
      return true; // "all" timeframe
    });
  }, [transactions, view, timeFrame, dateRange]);

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
    return {
      items: data.sort((a, b) => b.amount - a.amount),
      total: total
    };
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
        <div className="bg-card p-3 border border-border rounded-md shadow-md">
          <p className="font-medium text-foreground">{data.category}</p>
          <p className="text-primary">{`Amount: ${data.amount.toFixed(2)} MAD`}</p>
          <p className="text-gray-300">{`${data.percentage.toFixed(2)}% of ${view}`}</p>
        </div>
      );
    }
    return null;
  };

  // Determine time period label
  const getTimeFrameLabel = () => {
    const now = new Date();
    
    if (timeFrame === "custom" && dateRange?.from) {
      return dateRange.to 
        ? `${format(dateRange.from, "d/M/yyyy")} to ${format(dateRange.to, "d/M/yyyy")}`
        : format(dateRange.from, "d/M/yyyy");
    }
    
    switch(timeFrame) {
      case "day": 
        return `Today (${format(now, "d/M/yyyy")})`;
      case "week": {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as first day
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        return `This Week (${format(weekStart, "d/M/yyyy")} to ${format(weekEnd, "d/M/yyyy")})`;
      }
      case "month": {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return `This Month (${format(monthStart, "d/M/yyyy")} to ${format(monthEnd, "d/M/yyyy")})`;
      }
      case "year": {
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);
        return `This Year (${format(yearStart, "d/M/yyyy")} to ${format(yearEnd, "d/M/yyyy")})`;
      }
      case "all": return "All Time";
      case "custom": return "Custom Range";
      default: return "All Time";
    }
  };

  return (
    <div className="bg-card rounded-xl p-4">
      <h3 className="font-bold text-lg mb-1">Spending Categories</h3>
      <p className="text-sm text-muted-foreground mb-4">Where your money goes</p>
      
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-foreground">Category Breakdown</p>
        <div className="flex items-center gap-2">
          <button
            className={`text-sm px-4 py-2 rounded-full ${
              timeFrame === 'all' 
                ? 'bg-secondary text-foreground' 
                : 'text-gray-400 hover:text-foreground'
            }`}
            onClick={() => setTimeFrame('all')}
          >
            All time
          </button>
            <button
            className={`text-sm px-4 py-2 rounded-full ${
              timeFrame === 'custom' 
              ? 'bg-primary text-foreground' 
              : 'text-gray-400 hover:text-foreground'
            }`}
            onClick={() => setTimeFrame('custom')}
            >
            Custom
            </button>

        </div>
      </div>
      
      {timeFrame === "custom" && (
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal w-full sm:w-[300px] h-10 border-border bg-secondary/30",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange(range as DateRange);
                  } else {
                    setDateRange(undefined);
                  }
                }}
                numberOfMonths={2}
                className="border border-border rounded-md bg-card"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm ${
              view === 'expense' 
                ? 'bg-primary text-foreground' 
                : 'bg-secondary/50 text-gray-300'
            }`}
            onClick={() => setView('expense')}
          >
            Expenses
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm ${
              view === 'income' 
                ? 'bg-primary text-foreground' 
                : 'bg-secondary/50 text-gray-300'
            }`}
            onClick={() => setView('income')}
          >
            Income
          </button>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block mb-1">Total {view}:</span>
          <span className={`font-bold ${view === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
            {chartData.total.toFixed(2)} MAD
          </span>
        </div>
      </div>

      <div className="h-[300px]">
        {chartData.items.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.items}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: "10px", color: "#ffffff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <PieChartIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-foreground">No data available</p>
            <p className="text-sm text-muted-foreground">No {view} transactions for {getTimeFrameLabel().toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}