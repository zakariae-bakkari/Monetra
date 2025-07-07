"use client";
import { useState, useEffect } from "react";
import { TransactionList } from "@src/components/transactions/transaction-list";
import { Button } from "@src/components/ui/button";
import { TransactionNewDialog } from "@src/components/transactions/transaction-new-dialog";
import { ArrowUpDown, BarChart2, Download, Plus, Upload } from "lucide-react";
import { account } from "@src/lib/appwrite.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@src/components/ui/tabs";
import { Card, CardContent } from "@src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUserId();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            View, add, and manage your financial transactions
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="group">
                <Download className="h-4 w-4 mr-1" /> Export
                <ArrowUpDown className="h-3.5 w-3.5 ml-1.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="hover:bg-secondary">
                <Download className="h-4 w-4 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-secondary">
                <Download className="h-4 w-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-secondary">
                <Upload className="h-4 w-4 mr-2" /> Import transactions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            className="hover:border-primary border-primary  border-1 bg-primary hover:bg-primary text-primary-foreground"
            onClick={() => setShowNewTransaction(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Transaction
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <Tabs
          defaultValue="all"
          value={view}
          onValueChange={(value) => setView(value as "all" | "income" | "expense")}
          className="w-full"
        >
          <TabsList className="bg-muted/40 p-1 w-full sm:w-auto rounded-lg grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="all" className="rounded-md px-5 data-[state=active]:bg-background">All</TabsTrigger>
            <TabsTrigger value="income" className="rounded-md px-5 data-[state=active]:bg-background">Income</TabsTrigger>
            <TabsTrigger value="expense" className="rounded-md px-5 data-[state=active]:bg-background">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 data-[state=active]:animate-in data-[state=inactive]:animate-out">
            <TransactionList filter="all" />
          </TabsContent>
          
          <TabsContent value="income" className="mt-6 data-[state=active]:animate-in data-[state=inactive]:animate-out">
            <TransactionList filter="income" />
          </TabsContent>
          
          <TabsContent value="expense" className="mt-6 data-[state=active]:animate-in data-[state=inactive]:animate-out">
            <TransactionList filter="expense" />
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-12">
        <Card className="rounded-xl border border-primary/10 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-transparent border-b p-5 flex gap-3 items-center">
            <div className="bg-primary/10 p-2.5 rounded-lg">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Transaction Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Track spending patterns and understand your financial habits
              </p>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Visualize spending trends, compare categories, and identify opportunities to save more.
              </p>
              <Button variant="outline">
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {userId && (
        <>
          <TransactionNewDialog
            open={showNewTransaction}
            onClose={() => setShowNewTransaction(false)}
          />
        </>
      )}
    </div>
  );
}