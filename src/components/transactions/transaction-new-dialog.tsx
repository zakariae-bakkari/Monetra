"use client";

import React, { useState, useEffect, use } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@src/lib/utils";
import appwriteService from "@src/lib/store";
import { TransactionForm } from "./transaction-form";
import { transactionFormSchema } from "./transaction-form";
import { useToast } from "@/hooks/use-toast";
import { account } from "@src/lib/appwrite.config";

export interface TransactionNewDialogProps {
  open: boolean;
  onClose: () => void;
  onTransactionAdded?: () => void;
  selectedDate?: Date | null;
}

// Radix Dialog primitives all in one file
const Dialog = DialogPrimitive.Root;
// const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal: React.FC<React.ComponentProps<typeof DialogPrimitive.Portal>> = ({ children, ...props }) => (
  <DialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" />
      {children}
    </div>
  </DialogPrimitive.Portal>
);

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentProps<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto",
        "rounded-lg bg-popover p-6 shadow-lg animate-in fade-in-90 slide-in-from-top-10",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100 focus:outline-none">
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentProps<typeof DialogPrimitive.Title>
>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

export function TransactionNewDialog({ open, onClose, onTransactionAdded,selectedDate }: TransactionNewDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: selectedDate ? selectedDate : new Date(),
      amount: 0,
      type: "Expense",
      category: "Food",
      reason: "",
      notes: "",
      wallets: "",
      expectedReturnDate: undefined,
    },
  });

  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]) //this will set the date to the selected date when the dialog opens

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

  const onSubmit = async (data: any) => {
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
        }
      }
      
      toast({ title: "Success", description: "Transaction added successfully" });
      form.reset();
      onClose();
      
      // Notify parent component that transaction was added
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not add transaction", variant: "destructive" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        {loading || isSubmitting ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TransactionForm 
            form={form} 
            onSubmit={onSubmit} 
            wallets={wallets} 
            isLoading={isSubmitting} 
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}