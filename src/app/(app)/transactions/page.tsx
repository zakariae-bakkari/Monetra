"use client";
import { useState, useEffect } from "react";
import { TransactionList } from "@src/components/transactions/transaction-list";
import { Button } from "@src/components/ui/button";
import { TransactionNewDialog } from "@src/components/transactions/transaction-new-dialog";
import { Plus } from "lucide-react";
import { account } from "@src/lib/appwrite.config";

export default function TransactionsPage() {
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
    <div className="p-4 md:p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Transactions</h1>
          <p className="text-muted-foreground">
            View, add, and manage your financial transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewTransaction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle
          </Button>
        </div>
      </div>
      
      <TransactionList />

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