"use client";

import { useState, useEffect } from "react";
import { TransactionCard } from "@src/components/transactions/transaction-card";
import { TransactionDetails } from "@src/components/transactions/transaction-details";
import appwriteService from "@src/lib/store";
import { Input } from "@src/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@src/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@src/components/ui/popover";
import { Button } from "@src/components/ui/button";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@src/components/ui/badge";
import { account } from "@src/lib/appwrite.config";
import { Transaction, Wallet } from "@src/types/types";
import { Calendar } from "../ui/calendar";

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  // Edit transaction
  // const [showEditDialog, setShowEditDialog] = useState(false);
  // const [transactionToEdit, setTransactionToEdit] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = await account.get();
      // Fetch transactions and wallets in parallel
      const [fetchedTransactions, fetchedWallets] = await Promise.all([
        appwriteService.fetchTransactions(user.$id),
        appwriteService.fetchWallets(user.$id),
      ]);

      setTransactions(fetchedTransactions);
      setWallets(fetchedWallets);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditTransaction = (id: string) => {
    // just give a modal with the transaction data
    const transaction = transactions.find((t) => t.$id === id);
    if (transaction) {
      setSelectedTransactionId(null);
      // setShowEditDialog(true);
      // setTransactionToEdit(transaction);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  // Extract unique categories for filter
  const uniqueCategories = Array.from(
    new Set(transactions.map((t) => t.category))
  ).sort();

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const typeMatch = typeFilter === "all" || transaction.type === typeFilter;

    // Category filter
    const categoryMatch =
      categoryFilter === "all" || transaction.category === categoryFilter;

    // Start date filter
    const dateFromMatch =
      !dateFrom ||
      isAfter(new Date(transaction.date), startOfDay(dateFrom)) ||
      isSameDay(new Date(transaction.date), dateFrom);

    // End date filter
    const dateToMatch =
      !dateTo ||
      isBefore(new Date(transaction.date), endOfDay(dateTo)) ||
      isSameDay(new Date(transaction.date), dateTo);

    return (
      searchMatch && typeMatch && categoryMatch && dateFromMatch && dateToMatch
    );
  });

  // Helper for comparing days
  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const activeFiltersCount = [
    searchTerm !== "",
    typeFilter !== "all",
    categoryFilter !== "all",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[180px]">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Expense">Expenses</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-sm text-muted-foreground mb-2 block">
                Start date
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[180px] justify-start text-left font-normal ${
                      !dateFrom && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <span className="text-sm text-muted-foreground mb-2 block">
                End date
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[180px] justify-start text-left font-normal ${
                      !dateTo && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sortedTransactions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {sortedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.$id}
              transaction={transaction}
              wallet={wallets.find((w) => w.$id === transaction.wallets)}
              onClick={() => setSelectedTransactionId(transaction.$id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No transactions found</h3>
          <p className="text-muted-foreground">
            {transactions.length > 0
              ? "Try adjusting your filters."
              : "Add your first transaction to start tracking your finances."}
          </p>
        </div>
      )}

      {selectedTransactionId && (
        <TransactionDetails
          transactionId={selectedTransactionId}
          transactions={transactions}
          wallets={wallets}
          onRefresh={fetchData}
          onEdit={handleEditTransaction}
          onClose={() => setSelectedTransactionId(null)}
        />
      )}
    </div>
  );
}
