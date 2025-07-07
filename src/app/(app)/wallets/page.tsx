"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Loader2,
  Wallet,
  CreditCard,
  Wallet2,
  BadgeDollarSign,
  ChevronRight,
} from "lucide-react";
import { Button } from "@src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@src/components/ui/dialog";
import { WalletForm } from "@src/components/wallets/wallet-form";
import { account } from "@src/lib/appwrite.config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@src/components/ui/card";
import appwriteService from "@src/lib/store";
import { Wallet as WalletType } from "@src/types/types";
import { cn } from "@src/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@src/components/ui/tabs";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddWallet, setShowAddWallet] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const user = await account.get();
      const currentUserId = user.$id;
      setUserId(currentUserId);
      if (!currentUserId) {
        return;
      }
      const data = await appwriteService.fetchWallets(currentUserId);
      setWallets(data);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleWalletSuccess = () => {
    setShowAddWallet(false);
    fetchWallets();
  };

  // Calculate totals
  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + wallet.balance,
    0
  );
  const totalPositive = wallets
    .filter((w) => w.balance > 0)
    .reduce((sum, w) => sum + w.balance, 0);
  const totalNegative = wallets
    .filter((w) => w.balance < 0)
    .reduce((sum, w) => sum + w.balance, 0);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "Cash":
        return <BadgeDollarSign className="h-5 w-5" />;
      case "Credit Card":
        return <CreditCard className="h-5 w-5" />;
      case "Bank Account":
        return <Wallet2 className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
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

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          My Wallets
        </h1>
        <p className="text-muted-foreground">
          Manage your accounts, track balances, and organize your finances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">
              {totalBalance.toFixed(2)} MAD
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {totalPositive.toFixed(2)} MAD
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Liabilities</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {Math.abs(totalNegative).toFixed(2)} MAD
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-3">My Accounts</h2>
          <Tabs
            value={viewType}
            onValueChange={(v) => setViewType(v as "grid" | "list")}
            className="h-8 bg-muted/60 rounded-md p-1"
          >
            <TabsList className="h-full">
              <TabsTrigger value="grid" className="text-xs px-2.5 py-1">
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2.5 py-1">
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button
          onClick={() => setShowAddWallet(true)}
          className="hover:border-primary border-primary  border-1 bg-primary hover:bg-primary text-primary-foreground "
        >
          <PlusCircle className="h-4 w-4 mr-1.5" /> New Wallet
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Loading wallets...</span>
        </div>
      ) : wallets.length === 0 ? (
        <Card className="border-dashed p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No wallets yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Create a wallet to start tracking your finances and monitor your
            spending across different accounts.
          </p>
          <Button onClick={() => setShowAddWallet(true)} className="font-medium">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Add Your First Wallet
          </Button>
        </Card>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <Link href={`/wallets/${w.$id}`} key={w.$id} className="group">
              <Card className="h-full hover:border-accent/50 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <div
                      className={cn(
                        "p-2 rounded-md",
                        w.balance < 0 && w.type !== "Credit Card"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-primary/10"
                      )}
                    >
                      <span className={getWalletColor(w.type, w.balance)}>
                        {getWalletIcon(w.type)}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <CardTitle className="text-lg">{w.name}</CardTitle>
                  <CardDescription>{w.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "text-xl font-semibold",
                      w.balance < 0 && w.type !== "Credit Card"
                        ? "text-red-600 dark:text-red-400"
                        : "text-foreground"
                    )}
                  >
                    {w.balance.toFixed(2)} MAD
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border overflow-hidden">
          <div className="divide-y">
            {wallets.map((w) => (
              <Link
                href={`/wallets/${w.$id}`}
                key={w.$id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-md",
                      w.balance < 0 && w.type !== "Credit Card"
                        ? "bg-red-100 dark:bg-red-900/20"
                        : "bg-primary/10"
                    )}
                  >
                    <span className={getWalletColor(w.type, w.balance)}>
                      {getWalletIcon(w.type)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{w.name}</h3>
                    <p className="text-sm text-muted-foreground">{w.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "font-semibold",
                      w.balance < 0 && w.type !== "Credit Card"
                        ? "text-red-600 dark:text-red-400"
                        : "text-foreground"
                    )}
                  >
                    {w.balance.toFixed(2)} MAD
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Add Wallet Dialog */}
      <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Wallet</DialogTitle>
          </DialogHeader>
          {userId && (
            <WalletForm
              onSuccess={handleWalletSuccess}
              onCancel={() => setShowAddWallet(false)}
              userId={userId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
