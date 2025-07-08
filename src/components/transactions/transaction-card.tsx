"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
} from "@src/components/ui/card";
import { Badge } from "@src/components/ui/badge";
import { ArrowDown, ArrowUp, ChevronRight, ArrowLeftRight } from "lucide-react";
import { Transaction, Wallet } from "@/types/types";

interface TransactionCardProps {
  transaction: Transaction;
  wallet?: Wallet;
  onClick?: () => void;
}

export function TransactionCard({ transaction, wallet, onClick }: TransactionCardProps) {
  // Function to get border color based on transaction type
  const getBorderColor = () => {
    switch(transaction.type) {
      case "Income": return "border-l-green-500";
      case "Expense": return "border-l-red-500";
      case "Transfer": return "border-l-blue-500";
      default: return "border-l-red-500";
    }
  };
  
  // Function to get background color based on transaction type
  const getBgColor = () => {
    switch(transaction.type) {
      case "Income": return "bg-green-100";
      case "Expense": return "bg-red-100";
      case "Transfer": return "bg-blue-100";
      default: return "bg-red-100";
    }
  };
  
  // Function to get text color based on transaction type
  const getTextColor = () => {
    switch(transaction.type) {
      case "Income": return "text-green-600";
      case "Expense": return "text-red-600";
      case "Transfer": return "text-blue-600";
      default: return "text-red-600";
    }
  };
  
  return (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${getBorderColor()}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-2 flex items-center justify-center ${getBgColor()}`}>
            {transaction.type === "Income" ? (
              <ArrowDown className={`h-5 w-5 ${getTextColor()}`} />
            ) : transaction.type === "Transfer" ? (
              <ArrowLeftRight className={`h-5 w-5 ${getTextColor()}`} />
            ) : (
              <ArrowUp className={`h-5 w-5 ${getTextColor()}`} />
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
          <span className={`font-semibold whitespace-nowrap ${getTextColor()}`}>
            {transaction.type === "Income" ? "+" : transaction.type === "Transfer" ? "↔" : "-"}
            {transaction.amount} MAD
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}