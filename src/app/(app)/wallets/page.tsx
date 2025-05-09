"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@src/components/ui/dialog";
import { WalletForm } from "@src/components/wallets/wallet-form";
import { account } from "@src/lib/appwrite.config";
import { Card } from "@src/components/ui/card";
import appwriteService from "@src/lib/store";
import { Wallet } from "@src/types/types";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddWallet, setShowAddWallet] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const user = await account.get();
      const currentUserId = user.$id;
      setUserId(currentUserId);
      console.log("Current user ID:", currentUserId);
      if (!currentUserId) {
        return;
      }
      const data = await appwriteService.fetchWallets(currentUserId);
      console.log("Fetched wallets:", data);
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

  return (
    <section className="min-h-screen flex flex-col items-center bg-background py-8 px-4">
      <Card className="p-8 w-full max-w-2xl border shadow-sm">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mes portefeuilles</h1>
          <Button size="sm" onClick={() => setShowAddWallet(true)}>
            <PlusCircle className="h-4 w-4 mr-1" /> Nouveau
          </Button>
        </header>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Aucun portefeuille.</p>
            <Button variant="outline" onClick={() => setShowAddWallet(true)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Ajouter un portefeuille
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {wallets.map((w) => (
              <li
                key={w.$id}
                className="p-4 bg-muted rounded-xl flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{w.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {w.type}
                    </span>
                    <span className="text-sm font-medium">
                      {w.balance.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
                <Button variant="link" asChild>
                  <Link href={`/wallets/${w.$id}`}>Détails</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Add Wallet Dialog */}
      <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Ajouter un portefeuille</DialogTitle>
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
    </section>
  );
}
