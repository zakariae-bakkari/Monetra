"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@src/components/ui/dialog";
import { Button } from "@src/components/ui/button";
import { Badge } from "@src/components/ui/badge";
import { 
  Card,
  CardContent,
  CardDescription
} from "@src/components/ui/card";
import { Pencil, Trash2, BanknoteIcon, Calendar, Tag, FileText, Wallet2, ArrowDown, ArrowUp } from "lucide-react";
import appwriteService from "@src/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Transaction, Wallet } from "@src/types/types";

interface TransactionDetailsProps {
  transactionId: string | null;
  transactions: Transaction[];
  wallets: Wallet[];
  onRefresh: () => Promise<void>;
  onEdit: (id: string) => void;
  onClose: () => void;
}

export function TransactionDetails({ 
  transactionId, 
  transactions,
  wallets,
  onRefresh,
  onEdit, 
  onClose 
}: TransactionDetailsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const transaction = transactions.find(t => t.$id === transactionId);
  const wallet = transaction ? wallets.find(w => w.$id === transaction.wallets) : null;
  
  const handleDelete = async () => {
    if (!transaction) return;
    
    setIsDeleting(true);
    try {
      // First, update the wallet balance to reflect the deletion
      if (transaction.type === 'Income' || transaction.type === 'Expense') {
        if (wallet) {
          const balanceChange = transaction.type === 'Income' ? -transaction.amount : transaction.amount;
          await appwriteService.updateWallet(wallet.$id, { 
            balance: wallet.balance + balanceChange 
          });
        }
      }
      
      // Then delete the transaction
      await appwriteService.deleteTransaction(transaction.$id);
      
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted",
      });
      
      // Refresh the transactions list
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete transaction",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={!!transactionId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {transaction.type === "Income" ? (
              <Badge className="bg-green-500 text-white">
                <ArrowDown className="h-3 w-3 mr-1" /> Income
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white">
                <ArrowUp className="h-3 w-3 mr-1" /> Expense
              </Badge>
            )}
            <span>{transaction.reason || transaction.category}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-center">
            <div className={`text-3xl font-bold ${
              transaction.type === "Income" ? "text-green-600" : "text-red-600"
            }`}>
              {transaction.type === "Income" ? "+" : "-"}{transaction.amount.toFixed(2)} MAD
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardDescription>Date</CardDescription>
                    <div>{format(new Date(transaction.date), "dd MMMM yyyy")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardDescription>Category</CardDescription>
                    <div>{transaction.category}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardDescription>Wallet</CardDescription>
                    <div>{wallet?.name || "Unknown"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {transaction.expectedReturnDate && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BanknoteIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardDescription>Expected Return Date</CardDescription>
                      <div>{format(new Date(transaction.expectedReturnDate), "dd MMMM yyyy")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {transaction.notes && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <CardDescription>Notes</CardDescription>
                    <div className="whitespace-pre-wrap">{transaction.notes}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onEdit(transaction.$id)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}