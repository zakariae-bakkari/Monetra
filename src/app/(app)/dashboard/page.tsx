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
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const currentMonth = format(new Date(), "MMMM yyyy");
  // State to hold wallets and transactions
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
            {/* <Button
              size="sm"
              onClick={() => router.push("/alerts")}
              variant="ghost"
              className="text-primary font-semibold"
            >
              View All
            </Button> */}
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
          <Button variant="ghost" size="sm" className="text-primary font-semibold" onClick={() => router.push("/wallets")}>
            Manage Wallets
          </Button>
        </div>
        <WalletCards wallets={wallets} />
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Financial Summary</h2>
          <Button variant="ghost" size="sm" className="text-primary font-semibold" onClick={() => router.push("/transactions")}>
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