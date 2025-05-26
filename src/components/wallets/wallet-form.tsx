"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import { Input } from "@src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@src/components/ui/select";
import { Loader2 } from "lucide-react";
import appwriteService from "@src/lib/store";
import { useToast } from "@/hooks/use-toast";

const walletTypes = ["Cash", "Bank Account", "Credit Card", "Savings", "Investment", "Other"];

// Updated schema to not allow negative balances for any wallet type
const formSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50),
  type: z.string().min(1, "Wallet type is required"),
  balance: z.coerce
    .number()
    .min(0, "Balance cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

interface WalletFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<FormValues>;
  editId?: string;
  userId: string;
}

export function WalletForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  editId, 
  userId 
}: WalletFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Set default wallet type based on initialData or default to Bank Account
  const defaultType = initialData?.type || "Bank Account";

  // Set up default values without credit limit
  const defaultValues: FormValues = {
    name: initialData?.name || "",
    type: defaultType,
    balance: initialData?.balance || 0,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      // Create wallet data object that matches the expected structure
      const walletData = {
        name: values.name,
        type: values.type,
        balance: values.balance,
      };
      
      console.log("Submitting wallet data:", walletData);
      
      if (editId) {
        // Update existing wallet
        await appwriteService.updateWallet(editId, walletData);
        
        toast({
          title: "Success",
          description: "Wallet updated successfully"
        });
      } else {
        // Create new wallet
        await appwriteService.createWallet(walletData, userId);
        
        toast({
          title: "Success",
          description: "Wallet created successfully"
        });
        
        // Reset form if creating new wallet
        form.reset({
          name: "",
          type: "Bank Account",
          balance: 0,
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting wallet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: editId 
          ? "Failed to update wallet" 
          : "Failed to create wallet"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Name</FormLabel>
              <FormControl>
                <Input placeholder="My Wallet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {walletTypes.map((type) => (
                    <SelectItem className="hover:bg-accent/20" key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {editId ? "Current Balance (MAD)" : "Initial Balance (MAD)"}
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="0.00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              className="bg-transparent hover:bg-card/20 text-muted-foreground hover:text-accent"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" className="min-w-[120px]" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {editId ? "Updating..." : "Adding..."}
              </div>
            ) : (
              editId ? "Update Wallet" : "Add Wallet"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}