"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Query } from "appwrite";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  PlusCircle, 
  Loader2, 
  ArrowUpDown,
  BadgeDollarSign,
  CreditCard,
  Wallet2
} from "lucide-react";
import { Button } from "@src/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@src/components/ui/dialog";
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@src/components/ui/card";
import { WalletForm } from "@src/components/wallets/wallet-form";
import { account, databases, DB_ID, TRANSACTIONS_COLLECTION_ID } from "@src/lib/appwrite.config";
import { format } from "date-fns";
import { Badge } from "@src/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@src/lib/utils";
import appwriteService from "@src/lib/store";
import { Transaction, Wallet } from "@src/types/types";

export default function WalletDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditWallet, setShowEditWallet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [txStats, setTxStats] = useState({ income: 0, expense: 0 });
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const loadTransactions = useCallback(async () => {
    try {
      const res = await databases.listDocuments<Transaction>(DB_ID, TRANSACTIONS_COLLECTION_ID, [
        Query.equal("wallets", id),
        Query.orderDesc("date")
      ]);
      
      const transactions = res.documents.map(doc => ({
        ...doc,
        date: new Date(doc.date)
      }));
      
      setTxs(transactions);
      
      // Calculate income and expense totals
      let totalIncome = 0;
      let totalExpense = 0;
      
      transactions.forEach(tx => {
        if (tx.type === "Income") {
          totalIncome += tx.amount;
        } else {
          totalExpense += tx.amount;
        }
      });
      
      setTxStats({ income: totalIncome, expense: totalExpense });
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }, [id]);

  useEffect(() => {
    async function load() {
      try {
        const user = await account.get();
        setUserId(user.$id);
        
        // Fetch wallet
        const w = await appwriteService.fetchWallet(id);
        if (w.userId !== user.$id) return router.push("/wallets"); // security check
        setWallet(w);
        
        // Fetch transactions
        await loadTransactions();
      } catch (error) {
        console.error("Error loading wallet data:", error);
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, toast, loadTransactions]);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "Cash":
        return <BadgeDollarSign className="h-5 w-5" />;
      case "Credit Card":
        return <CreditCard className="h-5 w-5" />;
      case "Bank Account":
        return <Wallet2 className="h-5 w-5" />;
      default:
        return <Wallet2 className="h-5 w-5" />;
    }
  };

  const getWalletColor = (type: string, balance: number) => {
    if (balance < 0 && type !== "Credit Card") return "text-red-500 dark:text-red-400";

    switch (type) {
      case "Cash":
        return "text-green-600 dark:text-green-500";
      case "Credit Card":
        return "text-purple-600 dark:text-purple-400";
      case "Bank Account":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-primary";
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    setTxs(prev => [...prev].sort((a, b) => {
      if (newOrder === 'asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }));
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await appwriteService.deleteWallet(id);
      toast({
        title: "Success",
        description: "Wallet has been deleted",
      });
      router.push("/wallets");
    } catch (error) {
      console.error("Error deleting wallet:", error);
      toast({
        title: "Error",
        description: "Failed to delete wallet",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSuccess = async () => {
    setShowEditWallet(false);
    try {
      // Refresh wallet data
      const updatedWallet = await appwriteService.fetchWallet(id);
      setWallet(updatedWallet);
      
      toast({
        title: "Success",
        description: "Wallet updated successfully",
      });
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading wallet...</p>
    </div>
  );
  
  if (!wallet) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <p className="text-destructive font-semibold mb-4">This wallet could not be found.</p>
      <Link href="/wallets">
        <Button>Return to wallets</Button>
      </Link>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="group mr-2" asChild>
            <Link href="/wallets" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> 
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {wallet.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowEditWallet(true)}
            className="hover:bg-primary/5"
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive"
            className="hover:bg-destructive/90"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className={cn(
          "col-span-3 md:col-span-1 bg-gradient-to-br border",
          wallet.balance < 0 && wallet.type !== "Credit Card" 
            ? "from-red-500/10 to-transparent border-red-500/20" 
            : "from-primary/10 to-transparent border-primary/20"
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-md",
                wallet.balance < 0 && wallet.type !== "Credit Card"
                  ? "bg-red-100 dark:bg-red-900/20"
                  : "bg-primary/10"
              )}>
                <span className={getWalletColor(wallet.type, wallet.balance)}>
                  {getWalletIcon(wallet.type)}
                </span>
              </div>
              <div>
                <CardDescription>
                  <Badge variant="secondary" className="font-normal">
                    {wallet.type}
                  </Badge>
                  {wallet.balance < 0 && wallet.type !== "Credit Card" && (
                    <Badge variant="destructive" className="ml-2 font-normal">
                      Negative Balance
                    </Badge>
                  )}
                </CardDescription>
                <CardTitle className="text-xl">Balance</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-3xl font-bold",
              wallet.balance < 0 && wallet.type !== "Credit Card" 
                ? "text-red-500 dark:text-red-400" 
                : wallet.balance < 0 
                  ? "text-yellow-500 dark:text-yellow-400"
                  : "text-foreground"
            )}>
              {wallet.balance.toFixed(2)} MAD
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              + {txStats.income.toFixed(2)} MAD
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-rose-700 dark:text-rose-400">
              - {txStats.expense.toFixed(2)} MAD
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleSort}
                className="text-xs"
              >
                <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </Button>
              
              <Link
                href={{
                  pathname: "/transactions",
                  query: { walletId: wallet.$id }
                }}
              >
                <Button size="sm" variant="outline" className="text-xs">
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> New Transaction
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {txs.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl">
              <p className="text-muted-foreground mb-4">No transactions for this wallet yet.</p>
              <Link href="/transactions">
                <Button variant="outline">
                  <PlusCircle className="h-4 w-4 mr-1" /> Add a transaction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {txs.slice(0, 10).map((tx) => (
                <div 
                  key={tx.$id} 
                  className="bg-muted p-4 rounded-xl hover:bg-muted/70 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{tx.reason || tx.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-normal text-xs">{tx.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(tx.date), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>
                    <span 
                      className={`font-semibold ${tx.type === "Income" 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "Income" ? "+" : "-"}
                      {tx.amount.toFixed(2)} MAD
                    </span>
                  </div>
                  {tx.notes && <p className="text-sm text-muted-foreground mt-2">{tx.notes}</p>}
                </div>
              ))}
              
              {txs.length > 10 && (
                <div className="text-center mt-4">
                  <Button
                    variant="link"
                    asChild
                    className="font-normal"
                  >
                    <Link
                      href={{
                        pathname: "/transactions",
                        query: { walletId: wallet.$id }
                      }}
                    >
                      View all transactions ({txs.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Wallet Dialog */}
      {userId && (
        <Dialog open={showEditWallet} onOpenChange={setShowEditWallet}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Wallet</DialogTitle>
              <DialogDescription>
                Make changes to your wallet information below
              </DialogDescription>
            </DialogHeader>
            <WalletForm 
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditWallet(false)}
              initialData={{
                name: wallet.name,
                type: wallet.type,
                balance: wallet.balance,
              }}
              editId={id}
              userId={userId}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wallet? This action cannot be undone and all associated data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" /> 
                  Delete Wallet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}