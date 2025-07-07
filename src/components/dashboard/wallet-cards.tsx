"use client";

import { Card, CardContent } from "@src/components/ui/card";
import { cn } from "@src/lib/utils";
import Link from "next/link";
import { Wallet } from "@/types/types";

interface WalletCardsProps {
  wallets: Wallet[];
}

export function WalletCards({ wallets }: WalletCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {wallets.map(wallet => (
        <Link key={wallet.$id} href={`/wallets/${wallet.$id}`}>
          <Card className="bg-card rounded-xl hover:bg-card/90 transition-all">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{wallet.name}</p>
                    <h3 className={cn(
                    "scroll-m-20 text-2xl font-semibold tracking-tight",
                    wallet.balance < 0 && wallet.type !== "Credit Card" 
                      ? "text-destructive" 
                      : "text-foreground"
                    )}>
                    {wallet.balance.toFixed(2)} MAD
                    </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}