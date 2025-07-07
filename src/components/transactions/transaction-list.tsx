"use client";

import { useState, useEffect } from "react";
import { TransactionCard } from "@src/components/transactions/transaction-card";
import { TransactionDetails } from "@src/components/transactions/transaction-details";
import appwriteService from "@src/lib/store";
import { Input } from "@src/components/ui/input";
import { Calendar } from "@src/components/ui/calendar";
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
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { 
  BarChart, 
  CalendarIcon, 
  ChevronDown, 
  Clock, 
  FileText, 
  Filter, 
  Search, 
  SlidersHorizontal, 
  Tag, 
  Wallet, 
  X 
} from "lucide-react";
import { Badge } from "@src/components/ui/badge";
import { account } from "@src/lib/appwrite.config";
import { Transaction, Wallet as WalletType } from "@src/types/types";
import { DateRange } from "react-day-picker";
import { cn } from "@src/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import { Card, CardContent } from "@src/components/ui/card";
import { Separator } from "@src/components/ui/separator";

interface TransactionListProps {
  filter?: "all" | "income" | "expense";
}

export function TransactionList({ filter = "all" }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(filter !== "all" ? filter.charAt(0).toUpperCase() + filter.slice(1) : "all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [walletFilter, setWalletFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
  
  // Update typeFilter when the filter prop changes
  useEffect(() => {
    if (filter !== "all") {
      setTypeFilter(filter.charAt(0).toUpperCase() + filter.slice(1));
    } else {
      setTypeFilter("all");
    }
  }, [filter]);

  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.$id === id);
    if (transaction) {
      setSelectedTransactionId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter(filter !== "all" ? filter.charAt(0).toUpperCase() + filter.slice(1) : "all");
    setCategoryFilter("all");
    setWalletFilter("all");
    setDateRange(undefined);
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
      
    // Wallet filter
    const walletMatch =
      walletFilter === "all" || transaction.wallets === walletFilter;

    // Date range filter
    const dateFromMatch =
      !dateRange?.from ||
      isAfter(new Date(transaction.date), startOfDay(dateRange.from)) ||
      isSameDay(new Date(transaction.date), dateRange.from);

    // End date filter
    const dateToMatch =
      !dateRange?.to ||
      isBefore(new Date(transaction.date), endOfDay(dateRange.to)) ||
      isSameDay(new Date(transaction.date), dateRange.to);

    return (
      searchMatch && typeMatch && categoryMatch && walletMatch && dateFromMatch && dateToMatch
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

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") {
      const dateComparison = sortOrder === "desc" 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
      return dateComparison;
    }
    
    if (sortBy === "amount") {
      const amountA = a.type === "Expense" ? -a.amount : a.amount;
      const amountB = b.type === "Expense" ? -b.amount : b.amount;
      
      return sortOrder === "desc" 
        ? amountB - amountA
        : amountA - amountB;
    }
    
    if (sortBy === "category") {
      const categoryComparison = a.category.localeCompare(b.category);
      return sortOrder === "desc" 
        ? -categoryComparison
        : categoryComparison;
    }
    
    return 0;
  });

  const activeFiltersCount = [
    searchTerm !== "",
    typeFilter !== "all" && typeFilter !== (filter !== "all" ? filter.charAt(0).toUpperCase() + filter.slice(1) : "all"),
    categoryFilter !== "all",
    walletFilter !== "all",
    !!dateRange?.from,
    !!dateRange?.to,
  ].filter(Boolean).length;
  
  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  sortedTransactions.forEach(transaction => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return sortOrder === "desc" 
      ? b.localeCompare(a) 
      : a.localeCompare(b);
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filter Sidebar for Desktop */}
      <div className={cn(
        "hidden lg:block w-64 flex-shrink-0",
        showFilterBar ? "lg:block" : "lg:hidden"
      )}>
        <div className="bg-card rounded-lg border border-border p-4 sticky top-4 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3.5 w-3.5 mr-1" /> Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" /> Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full border-border/60 bg-background">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Expense">Expenses</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" /> Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full border-border/60 bg-background">
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" /> Wallet
              </label>
              <Select value={walletFilter} onValueChange={setWalletFilter}>
                <SelectTrigger className="w-full border-border/60 bg-background">
                  <SelectValue placeholder="Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All wallets</SelectItem>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.$id} value={wallet.$id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Date range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-border/60",
                      !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} -{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="border rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col gap-4 mb-6">
          {/* Search and Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-10 border-border/60"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              className="lg:hidden flex items-center gap-2 border-border/60"
              onClick={() => setShowFilterBar(!showFilterBar)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-1 items-center border-border/60">
                  <BarChart className="h-4 w-4 mr-1" /> 
                  Sort by
                  <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={sortBy === "date" && sortOrder === "desc"}
                  onCheckedChange={() => { setSortBy("date"); setSortOrder("desc"); }}
                >
                  Date (newest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === "date" && sortOrder === "asc"}
                  onCheckedChange={() => { setSortBy("date"); setSortOrder("asc"); }}
                >
                  Date (oldest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === "amount" && sortOrder === "desc"}
                  onCheckedChange={() => { setSortBy("amount"); setSortOrder("desc"); }}
                >
                  Amount (high to low)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === "amount" && sortOrder === "asc"}
                  onCheckedChange={() => { setSortBy("amount"); setSortOrder("asc"); }}
                >
                  Amount (low to high)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === "category" && sortOrder === "asc"}
                  onCheckedChange={() => { setSortBy("category"); setSortOrder("asc"); }}
                >
                  Category (A to Z)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === "category" && sortOrder === "desc"}
                  onCheckedChange={() => { setSortBy("category"); setSortOrder("desc"); }}
                >
                  Category (Z to A)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle Filters Button */}
            <Button
              variant={showFilterBar ? "secondary" : "outline"}
              className="hidden lg:flex items-center gap-1.5"
              onClick={() => setShowFilterBar(!showFilterBar)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showFilterBar ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
          
          {/* Mobile Filters (Expandable) */}
          {showFilterBar && (
            <Card className="lg:hidden border border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                      <X className="h-4 w-4 mr-1" /> Clear all
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border-border/60 bg-background">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="Expense">Expenses</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="border-border/60 bg-background">
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
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wallet</label>
                    <Select value={walletFilter} onValueChange={setWalletFilter}>
                      <SelectTrigger className="border-border/60 bg-background">
                        <SelectValue placeholder="Wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All wallets</SelectItem>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet.$id} value={wallet.$id}>
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date range</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-border/60",
                            !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                {format(dateRange.to, "MMM d, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM d, yyyy")
                            )
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                          className="border rounded-md"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {typeFilter !== "all" && typeFilter !== (filter !== "all" ? filter.charAt(0).toUpperCase() + filter.slice(1) : "all") && (
                <Badge variant="secondary" className="flex gap-1 items-center bg-secondary text-secondary-foreground">
                  Type: {typeFilter}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setTypeFilter(filter !== "all" ? filter.charAt(0).toUpperCase() + filter.slice(1) : "all")} 
                  />
                </Badge>
              )}
              
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="flex gap-1 items-center bg-secondary text-secondary-foreground">
                  Category: {categoryFilter}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setCategoryFilter("all")} 
                  />
                </Badge>
              )}
              
              {walletFilter !== "all" && (
                <Badge variant="secondary" className="flex gap-1 items-center bg-secondary text-secondary-foreground">
                  Wallet: {wallets.find(w => w.$id === walletFilter)?.name || walletFilter}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setWalletFilter("all")} 
                  />
                </Badge>
              )}
              
              {dateRange?.from && (
                <Badge variant="secondary" className="flex gap-1 items-center bg-secondary text-secondary-foreground">
                  Date: {format(dateRange.from, "MMM d")}
                  {dateRange.to && ` - ${format(dateRange.to, "MMM d")}`}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setDateRange(undefined)} 
                  />
                </Badge>
              )}
              
              {searchTerm && (
                <Badge variant="secondary" className="flex gap-1 items-center bg-secondary text-secondary-foreground">
                  Search: {searchTerm}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchTerm("")} 
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="flex justify-center items-center py-20 border border-border rounded-xl bg-card/50">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        ) : sortedTransactions.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 mb-3">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <Separator className="mt-2" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {groupedTransactions[date].map((transaction) => (
                    <TransactionCard
                      key={transaction.$id}
                      transaction={transaction}
                      wallet={wallets.find((w) => w.$id === transaction.wallets)}
                      onClick={() => setSelectedTransactionId(transaction.$id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-border rounded-xl bg-card/50">
            <h3 className="text-lg font-medium mb-2 text-foreground">No transactions found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {transactions.length > 0
                ? "Try adjusting your filters or search terms to see more results."
                : "Add your first transaction to start tracking your finances."}
            </p>
            {transactions.length > 0 && activeFiltersCount > 0 && (
              <Button variant="outline" className="mt-4 border-border/60" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

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
