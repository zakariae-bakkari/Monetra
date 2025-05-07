import { Transaction, TransactionType, Wallet } from "@src/types/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import appwriteService from "./store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates a transaction before creating or updating it
 * Checks for valid amount, sufficient funds, valid dates, etc.
 * 
 * @param transaction Transaction data to validate
 * @param walletId ID of the wallet for the transaction
 * @param isUpdate Whether this is an update to an existing transaction
 * @param originalTransaction The original transaction (needed for updates)
 * @returns Promise resolving to true if valid
 */
export async function validateTransaction(
  transaction: Partial<Transaction>,
  walletId: string,
  isUpdate: boolean = false,
  originalTransaction?: Transaction
): Promise<true> {
  // Validate required fields
  if (!isUpdate) {
    // These fields are required for new transactions
    if (!transaction.amount || !transaction.type || !transaction.date) {
      throw new Error("Missing required transaction fields");
    }
  }

  // Get wallet data
  let wallet: Wallet | null = null;
  try {
    const walletDoc = await appwriteService.fetchWallet(walletId);
    if (!walletDoc) {
      throw new Error("Wallet not found");
    }
    wallet = walletDoc as unknown as Wallet;
  } catch (error) {
    console.error("Error fetching wallet:", error);
    throw new Error("Failed to validate transaction: couldn't access wallet");
  }

  // Validate amount if present
  if (transaction.amount !== undefined) {
    const amount = parseFloat(transaction.amount.toString());
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Transaction amount must be a positive number");
    }

    // For expenses, check if there's enough balance
    // For updates, consider the net effect on balance
    if (transaction.type === "EXPENSE" as any) {
      if (isUpdate && originalTransaction) {
        // Calculate the net effect on balance for an update
        const originalAmount = originalTransaction.type === "EXPENSE" as TransactionType ? 
          originalTransaction.amount : -originalTransaction.amount;
          
        const newAmount = amount;
        const netEffect = newAmount - originalAmount;
        
        if (wallet.balance < netEffect) {
          throw new Error("Insufficient funds in wallet for this update");
        }
      } else if (!isUpdate && amount > wallet.balance) {
        // For new expense transactions
        throw new Error("Insufficient funds in wallet");
      }
    }
  }

  // Validate transaction date
  if (transaction.date) {
    const transactionDate = new Date(transaction.date);
    
    if (isNaN(transactionDate.getTime())) {
      throw new Error("Invalid transaction date format");
    }
    
    // Optional: Prevent future dates
    if (transactionDate > new Date()) {
      throw new Error("Transaction date cannot be in the future");
    }
  }

  // Validate expected return date if provided
  if (transaction.expectedReturnDate) {
    const expectedReturnDate = new Date(transaction.expectedReturnDate);
    
    if (isNaN(expectedReturnDate.getTime())) {
      throw new Error("Invalid expected return date format");
    }
    
    // If both dates are provided, ensure expected return date is after transaction date
    if (transaction.date && expectedReturnDate < new Date(transaction.date)) {
      throw new Error("Expected return date must be after the transaction date");
    }
  }
  
  // Validate transaction type if provided
  if (transaction.type && 
      !["EXPENSE", "INCOME", "TRANSFER", "LOAN", "DEBT"].includes(transaction.type as string)) {
    throw new Error("Invalid transaction type");
  }
  
  // Validate transaction reason length if provided
  if (transaction.reason && (transaction.reason.length < 2 || transaction.reason.length > 100)) {
    throw new Error("Transaction reason must be between 2 and 100 characters");
  }

  // All validations passed
  return true;
}

/**
 * Helper function to get a single wallet by ID
 * @param id Wallet ID
 * @returns Promise resolving to the wallet or null
 */
export async function getWallet(id: string): Promise<Wallet | null> {
  try {
    const wallet = await appwriteService.fetchWallet(id);
    return wallet as unknown as Wallet;
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return null;
  }
}
