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

export type WalletType = 
  | "Cash"
  | "CIH"
  | "AttijariWafa"
  | "AlBarid";

export interface Wallet {
  id: string;
  type: WalletType;
  balance: number;
  name: string;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  category: Category;
  reason?: string;
  expectedReturnDate?: Date | null;
  notes?: string;
  wallets: string; // This is the Appwrite relation field name
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