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
      // Create transaction using AppwriteService
      await appwriteService.createTransaction(data, userId);
      
      // Update wallet balance if this is an expense or income
      if (data.type === 'Income' || data.type === 'Expense') {
        try {
          const wallet = await appwriteService.fetchWallet(data.wallets);
          if (wallet) {
            const balanceChange = data.type === 'Income' ? data.amount : -data.amount;
            await appwriteService.updateWallet(wallet.$id, { 
              balance: wallet.balance + balanceChange 
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
      }
      
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      
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