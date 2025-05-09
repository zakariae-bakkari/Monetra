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
import { ArrowUpFromLine, Loader2 } from "lucide-react";
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
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Financial overview for {currentMonth}</p>
      </div>
      
      {hasLocalData && (
        <div className="mb-8 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-primary">Local data found!</h3>
            <p className="text-sm text-muted-foreground">We found financial data stored in your browser. Do you want to import it to your account?</p>
          </div>
          <Button 
            onClick={handleImportFromLocal} 
            disabled={importing}
            className="whitespace-nowrap"
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
      
      <div className="space-y-6">
        <div className="mb-8">
          <WalletAlerts wallets={wallets} />
        </div>
        
        <div className="mb-8">
          <WalletCards wallets={wallets} />
        </div>
        
        <div className="mb-8">
          <SummaryCards transactions={transactions} wallets={wallets} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ActivityChart transactions={transactions} />
        </div>
        <div>
          <UpcomingReturns transactions={transactions} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryPieChart transactions={transactions} />
        <div className="bg-muted/30 rounded-lg border p-6 flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold mb-4">Need More Insights?</h3>
          <p className="text-center text-muted-foreground mb-6">
            Track more transactions to get detailed reports and personalized financial insights.
          </p>
        </div>
      </div>
    </div>
  );
}