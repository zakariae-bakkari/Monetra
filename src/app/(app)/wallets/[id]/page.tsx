"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Query } from "appwrite";
import { ArrowLeft, Edit, Trash2, PlusCircle, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@src/components/ui/dialog";
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from "@src/components/ui/card";
import { WalletForm } from "@src/components/wallets/wallet-form";
import { account, databases, DB_ID, TRANSACTIONS_COLLECTION_ID } from "@src/lib/appwrite.config";
import { format } from "date-fns";
import { Badge } from "@src/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@src/lib/utils";
import appwriteService from "@src/lib/store";
import { Wallet } from "@src/types/types";

export default function WalletDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditWallet, setShowEditWallet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [txStats, setTxStats] = useState({ income: 0, expense: 0 });
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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
  }, [id, router, toast]);

  const loadTransactions = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, TRANSACTIONS_COLLECTION_ID, [
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
      <p className="text-foreground">Chargement du portefeuille...</p>
    </div>
  );
  
  if (!wallet) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <p className="text-destructive font-semibold mb-4">Ce portefeuille est introuvable.</p>
      <Link href="/wallets">
        <Button>Retour aux portefeuilles</Button>
      </Link>
    </div>
  );

  return (
    <section className="min-h-screen flex flex-col items-center bg-background py-8 px-4">
      <Card className={cn(
        "p-8 w-full max-w-2xl border shadow-sm",
        wallet.balance < 0 && wallet.type !== "Credit Card" && "border-red-500 dark:border-red-400"
      )}>
        <div className="flex justify-between items-center mb-6">
          <Button variant="link" className="p-0" asChild>
            <Link href="/wallets" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Link>
          </Button>
          
          <div className="space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowEditWallet(true)}
            >
              <Edit className="h-4 w-4 mr-1" /> Modifier
            </Button>
            
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">{wallet.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary">{wallet.type}</Badge>
            {wallet.balance < 0 && wallet.type !== "Credit Card" && (
              <Badge variant="destructive">Negative Balance Warning</Badge>
            )}
            {wallet.type === "Credit Card" && wallet.creditLimit && (
              <Badge variant="outline">
                Limit: {wallet.creditLimit.toFixed(2)} MAD
              </Badge>
            )}
          </div>
          <div className="mt-4">
            <p className={cn(
              "text-2xl font-semibold",
              wallet.balance < 0 && wallet.type !== "Credit Card" 
                ? "text-red-500 dark:text-red-400" 
                : wallet.balance < 0 
                  ? "text-yellow-500 dark:text-yellow-400"
                  : ""
            )}>
              {wallet.balance.toFixed(2)} MAD
            </p>
            
            {wallet.type === "Credit Card" && wallet.creditLimit && (
              <p className="text-sm text-muted-foreground mt-1">
                Available: {(wallet.creditLimit - Math.abs(Math.min(0, wallet.balance))).toFixed(2)} MAD
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className={cn(
            "bg-emerald-50 dark:bg-emerald-950",
            txStats.income > 0 && "border-emerald-500"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                + {txStats.income.toFixed(2)} MAD
              </p>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "bg-rose-50 dark:bg-rose-950",
            txStats.expense > 0 && "border-rose-500"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">Dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                - {txStats.expense.toFixed(2)} MAD
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Transactions</h2>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSort}
              >
                <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
              </Button>
              
              <Link
                href={{
                  pathname: "/transactions",
                  query: { walletId: wallet.$id }
                }}
              >
                <Button size="sm" variant="outline">
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> Nouvelle
                </Button>
              </Link>
            </div>
          </div>

          {txs.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl">
              <p className="text-muted-foreground mb-4">Aucune transaction pour ce portefeuille.</p>
              <Link href="/transactions">
                <Button variant="outline">
                  <PlusCircle className="h-4 w-4 mr-1" /> Ajouter une transaction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {txs.slice(0, 10).map((tx) => (
                <div key={tx.$id} className="bg-muted p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{tx.reason || tx.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{tx.category}</Badge>
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
                  >
                    <Link
                      href={{
                        pathname: "/transactions",
                        query: { walletId: wallet.$id }
                      }}
                    >
                      Voir toutes les transactions ({txs.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Wallet Dialog */}
      {userId && (
        <Dialog open={showEditWallet} onOpenChange={setShowEditWallet}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Modifier le portefeuille</DialogTitle>
            </DialogHeader>
            <WalletForm 
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditWallet(false)}
              initialData={{
                name: wallet.name,
                type: wallet.type,
                balance: wallet.balance,
                creditLimit: wallet.creditLimit
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce portefeuille ? Cette action est irréversible et toutes les données associées seront perdues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" /> 
                  Confirmer la suppression
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}