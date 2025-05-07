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

export type TransactionType = "Income" | "Expense";



export interface Wallet {
  $id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
  $createdAt?: Date;
  $updatedAt?: Date;
  transactions?: string[]; // This is the Appwrite relation field name
}

export interface Transaction {
  $id: string;
  amount: number;
  type: TransactionType;
  wallets: string; 
  userId: string;
  date: Date;
  reason?: string;
  notes?: string;
  category: Category;
  expectedReturnDate?: Date | null;
  $createdAt: Date;
  $updatedAt: Date;
}

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