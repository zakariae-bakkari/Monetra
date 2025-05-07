"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
} from "@src/components/ui/card";
import { Badge } from "@src/components/ui/badge";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Transaction } from "@/types/types";

interface TransactionCardProps {
  transaction: Transaction;
  wallet?: any;
  onClick?: () => void;
}

export function TransactionCard({ transaction, wallet, onClick }: TransactionCardProps) {
  return (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${
        transaction.type === "Income" ? "border-l-green-500" : "border-l-red-500"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-2 flex items-center justify-center ${
            transaction.type === "Income" ? "bg-green-100" : "bg-red-100"
          }`}>
            {transaction.type === "Income" ? (
              <ArrowDown className={`h-5 w-5 text-green-600`} />
            ) : (
              <ArrowUp className={`h-5 w-5 text-red-600`} />
            )}
          </div>
          
          <div>
            <h3 className="font-medium line-clamp-1">
              {transaction.reason || transaction.category}
            </h3>
            <div className="flex gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              <span>
                {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
              </span>
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline">{transaction.category}</Badge>
              {wallet && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span>{wallet.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-semibold whitespace-nowrap ${
            transaction.type === "Income" ? "text-green-600" : "text-red-600"
          }`}>
            {transaction.type === "Income" ? "+" : "-"}
            {transaction.amount} MAD
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}