"use client";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WalletCards } from "@/components/dashboard/wallet-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { UpcomingReturns } from "@/components/dashboard/upcoming-returns";
import { WalletAlerts } from "@/components/dashboard/wallet-alerts";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite.config";
import appwriteService from "@/lib/store"; // Import the direct service instead of hooks
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpFromLine, BarChart2, CalendarClock, LineChart, Loader2, PieChart, Plus, TrendingUp, Wallet2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Transaction, Wallet } from "@/types/types";

export default function DashboardPage() {
  const currentMonth = format(new Date(), "MMMM yyyy");
  // State to hold wallets and transactions
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      try {
        const user = await account.get();
        
        // Fetch data using the AppwriteService methods
        const [fetchedWallets, fetchedTransactions] = await Promise.all([
          appwriteService.fetchWallets(user.$id),
          appwriteService.fetchTransactions(user.$id)
        ]);
        
        setWallets(fetchedWallets);
        setTransactions(fetchedTransactions);

        // Check if there's data in localStorage to import
        const localTransactions = localStorage.getItem('transactions');
        setHasLocalData(!!localTransactions);
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "Error",
          description: "Failed to load your financial data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  // Function to import transactions from localStorage
  const handleImportFromLocal = async () => {
    try {
      setImporting(true);
      const user = await account.get();
      
      // Get transactions from localStorage
      const localTransactionsJson = localStorage.getItem('transactions');
      if (!localTransactionsJson) {
        toast({
          title: "No Data Found",
          description: "There are no transactions stored locally",
          variant: "destructive",
        });
        return;
      }
      
      const localTransactions = JSON.parse(localTransactionsJson);
      
      // Create a promise for each transaction to import
      const importPromises = localTransactions.map((transaction: Omit<Transaction, '$id' | 'userId'>) => 
        appwriteService.createTransaction(transaction, user.$id)
      );
      
      await Promise.all(importPromises);
      
      // Refresh transactions after import
      const updatedTransactions = await appwriteService.fetchTransactions(user.$id);
      setTransactions(updatedTransactions);
      
      // Clear local storage after successful import
      localStorage.removeItem('transactions');
      setHasLocalData(false);
      
      toast({
        title: "Import Successful",
        description: "Your local data has been imported to Appwrite successfully",
      });
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing your local data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Loading your financial data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground">Financial overview for {currentMonth}</p>
        </div>
        
        {hasLocalData && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-5 border border-accent/20 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div>
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <ArrowUpFromLine className="h-4 w-4" />
                Local data found!
              </h3>
              <p className="text-sm text-muted-foreground">We found financial data stored in your browser. Do you want to import it to your account?</p>
            </div>
            <Button 
              onClick={handleImportFromLocal} 
              disabled={importing}
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        {wallets.length > 0 && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-amber-50 dark:bg-amber-900/10 border-b p-5 flex items-start md:items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
                  <p className="text-sm text-muted-foreground">Important updates about your accounts</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 p-0 h-8 px-2">
                Dismiss All
              </Button>
            </div>
            <div className="p-5">
              <WalletAlerts wallets={wallets} />
            </div>
          </div>
        )}
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Wallet2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Wallet Overview</h2>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50">
              Manage Wallets
            </Button>
          </div>
          <WalletCards wallets={wallets} />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Financial Summary</h2>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50">
              View Details
            </Button>
          </div>
          <SummaryCards />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <LineChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Monthly Activity</h2>
                <p className="text-sm text-muted-foreground">Income and expenses over time</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs h-8 px-2">1M</Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-2">3M</Button>
              <Button variant="secondary" size="sm" className="text-xs h-8 px-2">6M</Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-2">1Y</Button>
            </div>
          </div>
          <div className="p-5">
            <ActivityChart transactions={transactions} />
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b p-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Upcoming</h2>
            </div>
            <p className="text-sm text-muted-foreground">Expected transactions and returns</p>
          </div>
          <div className="p-5">
            <UpcomingReturns transactions={transactions} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b p-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Spending Categories</h2>
            </div>
            <p className="text-sm text-muted-foreground">Where your money is going</p>
          </div>
          <div className="p-5">
            <CategoryPieChart transactions={transactions} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-accent/10 via-background to-primary/10 rounded-xl border border-accent/20 p-8 flex flex-col justify-center items-center shadow-sm">
          <div className="bg-background rounded-full p-5 shadow-md mb-5 border border-accent/20">
            <TrendingUp className="h-12 w-12 text-accent" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-center">Need More Insights?</h3>
          <p className="text-center text-muted-foreground mb-6 max-w-sm">
            Track more transactions to get detailed reports and personalized financial insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="hover:border-primary/30 border-1 bg-none hover:bg-primary/20 text-white hover:text-primary" onClick={() => window.location.href = "/transactions"}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Transaction
            </Button>
            <Button variant="outline" className="border-accent/30 border-1 bg-none hover:bg-accent/20 text-white hover:text-accent">
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}