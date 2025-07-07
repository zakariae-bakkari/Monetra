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
import appwriteService from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  BarChart2, 
  ChevronRight,  
  Loader2, 
} from "lucide-react";
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
        if (localTransactions && JSON.parse(localTransactions).length > 0) {
          setHasLocalData(true);
        }
        
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

  const importLocalData = async () => {
    setImporting(true);
    try {
      const localTransactions = localStorage.getItem('transactions');
      const localWallets = localStorage.getItem('wallets');
      
      if (!localTransactions && !localWallets) {
        toast({
          title: "No local data found",
          description: "There is no local data to import",
        });
        return;
      }
      
      const userId = (await account.get()).$id;
      
      // Import wallets first, then transactions that reference those wallets
      if (localWallets) {
        const parsedWallets = JSON.parse(localWallets);
        for (const wallet of parsedWallets) {
          // Remove any existing IDs to create fresh entries
          delete wallet.$id;
          wallet.userId = userId;
          
          await appwriteService.createWallet(wallet, userId);
        }
      }
      
      if (localTransactions) {
        const parsedTransactions = JSON.parse(localTransactions);
        // Re-fetch wallets to get their new IDs
        const updatedWallets = await appwriteService.fetchWallets(userId);
        
        // Create a mapping of local wallet name -> new wallet ID
        const walletMapping: Record<string, string> = {};
        updatedWallets.forEach(w => {
          walletMapping[w.name] = w.$id;
        });
        
        for (const tx of parsedTransactions) {
          // Remove any existing IDs to create fresh entries
          delete tx.$id;
          tx.userId = userId;
          
          // Replace wallet references with the new wallet IDs
          if (typeof tx.wallets === 'string') {
            const oldWalletName = tx.wallets;
            tx.wallets = walletMapping[oldWalletName] || tx.wallets;
          } else if (Array.isArray(tx.wallets)) {
            tx.wallets = tx.wallets.map((w: string) => walletMapping[w] || w);
          }
          
          await appwriteService.createTransaction(tx, userId);
        }
      }
      
      // Refresh the data
      const [refreshedWallets, refreshedTransactions] = await Promise.all([
        appwriteService.fetchWallets(userId),
        appwriteService.fetchTransactions(userId)
      ]);
      
      setWallets(refreshedWallets);
      setTransactions(refreshedTransactions);
      setHasLocalData(false);
      
      // Clear the local storage
      localStorage.removeItem('transactions');
      localStorage.removeItem('wallets');
      
      toast({
        title: "Import successful",
        description: "Your local data has been imported successfully",
      });
    } catch (error) {
      console.error("Error importing local data:", error);
      toast({
        title: "Import failed",
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
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Financial overview for {currentMonth}</p>
        </div>
      </div>
      
      {hasLocalData && (
        <div className="bg-card rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-500 mr-3" />
              <div>
                <p className="font-semibold">Alerts & Notifications</p>
                <p className="text-sm text-muted-foreground">Unusual payment added to your sub-accounts</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={importLocalData}
              disabled={importing}
              variant="ghost"
              className="text-primary font-semibold"
            >
              View All
            </Button>
          </div>
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
            <p className="text-sm">1 added file sharing access (500 MAD)</p>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}
      
      {!hasLocalData && <WalletAlerts wallets={wallets} />}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Wallet Overview</h2>
          <Button variant="ghost" size="sm" className="text-primary font-semibold">
            Manage Wallets
          </Button>
        </div>
        <WalletCards wallets={wallets} />
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Financial Summary</h2>
          <Button variant="ghost" size="sm" className="text-primary font-semibold">
            View Details
          </Button>
        </div>
        <SummaryCards />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl p-4">
            <h3 className="font-bold text-lg mb-1">Financial Progress</h3>
            <p className="text-sm text-muted-foreground mb-4">Track your income, expenses and balance over time.</p>
            <ActivityChart transactions={transactions} />
          </div>
        </div>
        <div>
          <UpcomingReturns transactions={transactions} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryPieChart transactions={transactions} />
        </div>
        <div className="bg-card rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
            <BarChart2 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="font-bold text-lg mb-2">Need More Insights?</h3>
          <p className="text-sm text-muted-foreground mb-4">Track more transactions to get detailed reports and personalized insights.</p>
          <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold">
            Generate Reports
          </Button>
        </div>
      </div>
    </main>
  );
}