"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@src/components/ui/dialog";
import { TransactionForm, FormValues } from "@src/components/transactions/transaction-form";
import appwriteService from "@src/lib/store";
import { useToast } from "@/hooks/use-toast";
import { account } from "@src/lib/appwrite.config";
import { Wallet } from "@/types/types";

export interface TransactionNewDialogProps {
  open: boolean;
  onClose: () => void;
  onTransactionAdded?: () => void;
  selectedDate?: Date | null;
}

export function TransactionNewDialog({ open, onClose, onTransactionAdded, selectedDate }: TransactionNewDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Set up form with validation
  const form = useForm<FormValues>({
    defaultValues: {
      date: selectedDate || new Date(),
      amount: 0,
      type: "Expense",
      category: "Other",
      wallets: "",
      destinationWallet: "",
      reason: "",
      hasExpectedReturnDate: false,
      expectedReturnDate: null,
      notes: "",
    },
  });

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]);

  // Load user and wallets when dialog opens
  useEffect(() => {
    const fetchUserAndWallets = async () => {
      try {
        setLoading(true);
        const user = await account.get();
        setUserId(user.$id);
        
        // Fetch wallets
        const fetchedWallets = await appwriteService.fetchWallets(user.$id);
        setWallets(fetchedWallets);
        
        // Set first wallet as default if available
        if (fetchedWallets.length > 0) {
          form.setValue("wallets", fetchedWallets[0].$id);
        }
      } catch (error) {
        console.error("Error fetching user or wallets:", error);
        toast({
          title: "Error",
          description: "Failed to load your account data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchUserAndWallets();
    }
  }, [form, open, toast]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      onClose();
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!userId) {
      toast({ title: "Error", description: "User not logged in", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Store destinationWallet ID for transfers before removing it
      const destinationWalletId = data.destinationWallet;
      
      // For all transaction types, ensure proper formatting of data before sending to Appwrite
      const transactionData = {
        date: data.date,
        amount: Number(data.amount), // Ensure amount is a number
        type: data.type,
        category: data.type === 'Transfer' ? "Other" : data.category, // Use "Other" for Transfer transactions
        wallets: data.wallets,
        reason: data.reason || "",
        notes: data.notes || "",
        hasExpectedReturnDate: data.hasExpectedReturnDate,
        expectedReturnDate: data.expectedReturnDate
      };
      
      // Only add expectedReturnDate if hasExpectedReturnDate is true
      if (data.hasExpectedReturnDate && data.expectedReturnDate) {
        transactionData.expectedReturnDate = data.expectedReturnDate;
      }
      
      // Handle wallet balance updates based on transaction type
      if (data.type === 'Income') {
        // For Income: Add to wallet balance
        try {
          const wallet = await appwriteService.fetchWallet(data.wallets);
          if (wallet) {
            await appwriteService.updateWallet(wallet.$id, { 
              balance: wallet.balance + Number(data.amount) 
            });
            
            // Create transaction after successful wallet update
            await appwriteService.createTransaction(transactionData, userId);
            
            toast({
              title: "Income Added",
              description: `Successfully added ${data.amount} MAD to ${wallet.name}`
            });
          }
        } catch (err) {
          console.error("Error updating wallet balance:", err);
          toast({
            title: "Warning",
            description: "Transaction created but wallet balance update failed",
            variant: "destructive",
          });
        }
      } else if (data.type === 'Expense') {
        // For Expense: Subtract from wallet balance
        try {
          const wallet = await appwriteService.fetchWallet(data.wallets);
          if (wallet) {
            await appwriteService.updateWallet(wallet.$id, { 
              balance: wallet.balance - Number(data.amount) 
            });
            
            // Create transaction after successful wallet update
            await appwriteService.createTransaction(transactionData, userId);
            
            toast({
              title: "Expense Recorded",
              description: `Successfully recorded expense of ${data.amount} MAD from ${wallet.name}`
            });
          }
        } catch (err) {
          console.error("Error updating wallet balance:", err);
          toast({
            title: "Warning",
            description: "Transaction created but wallet balance update failed",
            variant: "destructive",
          });
        }
      } else if (data.type === 'Transfer' && destinationWalletId) {
        // For Transfer: Subtract from source wallet and add to destination wallet
        try {
          // First get both wallets
          const [sourceWallet, destWallet] = await Promise.all([
            appwriteService.fetchWallet(data.wallets),
            appwriteService.fetchWallet(destinationWalletId)
          ]);
          
          // Verify source wallet has sufficient funds (additional safety check)
          if (sourceWallet && sourceWallet.type !== "Credit Card" && sourceWallet.balance < Number(data.amount)) {
            toast({
              title: "Transfer Failed",
              description: `Insufficient funds in ${sourceWallet.name}. Available: ${sourceWallet.balance.toFixed(2)} MAD`,
              variant: "destructive",
            });
            return; // Stop processing if insufficient funds
          }
          
          // For credit cards, check against credit limit if set
          if (sourceWallet && sourceWallet.type === "Credit Card" && sourceWallet.creditLimit) {
            const potentialBalance = sourceWallet.balance - Number(data.amount);
            if (Math.abs(potentialBalance) > sourceWallet.creditLimit) {
              toast({
                title: "Transfer Failed",
                description: `This transfer would exceed the credit limit of ${sourceWallet.creditLimit.toFixed(2)} MAD`,
                variant: "destructive",
              });
              return; // Stop processing if exceeding credit limit
            }
          }
          
          // Update both wallets in parallel
          if (sourceWallet && destWallet) {
            await Promise.all([
              // Subtract from source wallet
              appwriteService.updateWallet(sourceWallet.$id, {
                balance: sourceWallet.balance - Number(data.amount)
              }),
              // Add to destination wallet
              appwriteService.updateWallet(destWallet.$id, {
                balance: destWallet.balance + Number(data.amount)
              })
            ]);
            
            // Create transaction after successful wallet updates
            await appwriteService.createTransaction(transactionData, userId);
            
            toast({
              title: "Transfer Complete",
              description: `Successfully transferred ${data.amount} MAD from ${sourceWallet.name} to ${destWallet.name}`,
            });
          }
        } catch (err) {
          console.error("Error processing wallet transfer:", err);
          toast({
            title: "Warning",
            description: "Transaction failed. Please check your wallet balances and try again.",
            variant: "destructive",
          });
          return; // Stop processing on error
        }
      }
      
      // Reset form and close dialog
      form.reset();
      onClose();
      
      // Notify parent about the new transaction
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm 
          form={form}
          onSubmit={onSubmit}
          wallets={wallets}
          isLoading={isSubmitting || loading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}