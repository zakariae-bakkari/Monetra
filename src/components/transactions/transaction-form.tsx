"use client";

import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, Receipt, Wallet } from "lucide-react";
import { cn } from "@src/lib/utils";
import { Button } from "@src/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import { Input } from "@src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@src/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@src/components/ui/select";
import { Checkbox } from "@src/components/ui/checkbox";
import { Textarea } from "@src/components/ui/textarea";
import appwriteService from "@src/lib/store";
import { Wallet as WalletType } from "@src/types/types";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { motion } from "framer-motion";

export const transactionFormSchema = z
  .object({
    date: z.date({
      required_error: "A date is required",
    }),
    amount: z.coerce
      .number()
      .positive("Amount must be positive")
      .min(0.01, "Amount must be at least 0.01"),
    type: z.enum(["Income", "Expense"]),
    category: z.string().min(1, "Please select a category"),
    wallets: z.string().min(1, "Please select a wallet"),
    reason: z.string().optional(),
    hasExpectedReturnDate: z.boolean().default(false),
    expectedReturnDate: z.date().optional().nullable(),
    notes: z.string().optional(),
  })
  .superRefine(async (data, ctx) => {
    try {
      const wallet = await appwriteService.fetchWallet(data.wallets);
      
      if (wallet && data.type === "Expense") {
        if (wallet.type !== "Credit Card") {
          const currentBalance = wallet.balance;
          if (currentBalance < data.amount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Insufficient funds in ${wallet.name}. Available: ${currentBalance.toFixed(2)} MAD`,
              path: ["amount"],
            });
          }
        } else {
          // For credit cards, check against credit limit if set
          if (wallet.creditLimit) {
            const potentialBalance = wallet.balance - data.amount;
            if (Math.abs(potentialBalance) > wallet.creditLimit) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `This expense would exceed the credit limit of ${wallet.creditLimit.toFixed(2)} MAD`,
                path: ["amount"],
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error validating wallet balance:", error);
    }
  });

export type FormValues = z.infer<typeof transactionFormSchema>;
interface TransactionFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  wallets: WalletType[];
  isLoading?: boolean;
  onCancel?: () => void;
}

export function TransactionForm({
  form,
  onSubmit,
  wallets,
  isLoading = false,
  onCancel,
}: TransactionFormProps) {
  const categories = [
    "Food",
    "Transportation",
    "Housing",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Education",
    "Salary",
    "Gift",
    "Loan",
    "Repayment",
    "Other",
  ];

  const watchHasExpectedReturnDate = form.watch("hasExpectedReturnDate");
  const watchTransactionType = form.watch("type");
  
  // Animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };
  
  const fieldVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <Form {...form}>
      <motion.form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fieldVariants} className="flex items-center justify-center mb-4">
          <div className={`
            flex items-center gap-4 p-2 px-4 rounded-full bg-secondary/5 border border-border
          `}>
            <Button
              type="button"
              variant={watchTransactionType === 'Expense' ? "default" : "ghost"}
              className={`
                rounded-full px-4 gap-2 text-sm
                ${watchTransactionType === 'Expense' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
              `}
              onClick={() => form.setValue("type", "Expense")}
            >
              <Receipt className="h-4 w-4" />
              Expense
            </Button>
            <Button
              type="button"
              variant={watchTransactionType === 'Income' ? "default" : "ghost"}
              className={`
                rounded-full px-4 gap-2 text-sm
                ${watchTransactionType === 'Income' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
              `}
              onClick={() => form.setValue("type", "Income")}
            >
              <Wallet className="h-4 w-4" />
              Income
            </Button>
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="flex gap-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal border-border/60 hover:bg-secondary/5",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (MAD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="border-border/60 focus-visible:ring-primary/30"
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        field.onChange(value);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter the transaction amount in MAD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>
        
        <motion.div variants={fieldVariants} className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border/60 focus-visible:ring-primary/30">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="wallets"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Wallet
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-border/60 focus-visible:ring-primary/30">
                      <SelectValue placeholder="Select a wallet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.$id} value={wallet.$id} className="flex items-center">
                        {wallet.name} ({wallet.balance.toFixed(2)} MAD)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Why did you spend/receive this money?"
                    className="border-border/60 focus-visible:ring-primary/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="hasExpectedReturnDate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border/60 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    This transaction has an expected return date
                  </FormLabel>
                  <FormDescription>
                    Use for loans, refunds, or any money you expect to get back
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </motion.div>

        {watchHasExpectedReturnDate && (
          <motion.div
            variants={fieldVariants}
            initial="hidden" 
            animate="visible"
          >
            <FormField
              control={form.control}
              name="expectedReturnDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expected Return Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal border-border/60 hover:bg-secondary/5",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When do you expect this money to be returned?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}

        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this transaction"
                    className="border-border/60 focus-visible:ring-primary/30 resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fieldVariants} className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-border/60"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className={watchTransactionType === 'Income' ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Save ${watchTransactionType === 'Income' ? 'Income' : 'Expense'}`
            )}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
}