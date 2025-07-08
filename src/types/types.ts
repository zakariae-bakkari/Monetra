import { Models } from "appwrite";

export type Category = 
  | "Food" 
  | "Transportation" 
  | "Housing" 
  | "Entertainment" 
  | "Shopping" 
  | "Healthcare" 
  | "Education" 
  | "Salary" 
  | "Gift" 
  | "Loan" 
  | "Repayment" 
  | "Other";

export type TransactionType = "Income" | "Expense" | "Transfer";

export interface WalletData {
  $id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
  $createdAt?: Date;
  $updatedAt?: Date;
  transactions?: string[]; // This is the Appwrite relation field name
}
export type Wallet = WalletData & Models.Document;

export interface TransactionData {
  amount: number;
  type: TransactionType;
  wallets: string;
  userId: string;
  date: Date;
  reason?: string;
  notes?: string;
  category: Category;
  hasExpectedReturnDate?: boolean; // Changed from expectedReturnDate boolean to hasExpectedReturnDate
  expectedReturnDate?: Date | null;
}

export type Transaction = TransactionData & Models.Document;

export interface DailyTransactionSummary {
  date: Date;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategorySummary {
  category: Category;
  amount: number;
  percentage: number;
}