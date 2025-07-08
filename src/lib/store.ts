import { Query, ID, Models } from "appwrite";
import { Transaction, Wallet } from "@/types/types";
import { databases, DB_ID, WALLETS_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID } from "./appwrite.config";

export class AppwriteService {

  // ============== WALLET OPERATIONS ===============
  async createWallet(data: Omit<Wallet, "$id" | "userId">, userId: string) {
    try {
      const doc = await databases.createDocument(
        DB_ID,
        WALLETS_COLLECTION_ID,
        ID.unique(),
        { ...data, userId } // Add userId to the document
      );
      return doc;
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  }

  async fetchWallets(userId: string) {
    try {
      const res = await databases.listDocuments<Wallet>(
        DB_ID,
        WALLETS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      return res.documents;
    } catch (error) {
      console.error("Error fetching wallets:", error);
      throw error;
    }
  }

  async fetchWallet(id: string) {
    try {
      const doc = await databases.getDocument<Wallet>(
        DB_ID,
        WALLETS_COLLECTION_ID,
        id
      );
      return doc;
    } catch (error) {
      console.error("Error fetching wallet:", error);
      throw error;
    }
  }
  async updateWallet(id: string, data: Partial<Wallet>) {
    try {
      const doc = await databases.updateDocument(
        DB_ID,
        WALLETS_COLLECTION_ID,
        id,
        data
      );
      return doc;
    } catch (error) {
      console.error("Error updating wallet:", error);
      throw error;
    }
  }

  async deleteWallet(id: string) {
    try {
      await databases.deleteDocument(
        DB_ID,
        WALLETS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error("Error deleting wallet:", error);
      throw error;
    }
  }

  // ============== TRANSACTION OPERATIONS ===============
  async createTransaction(data: Omit<Transaction, '$id' | 'userId'>, userId: string) {
    try {
      // Create a clean object with only the fields that exist in Appwrite schema
      const cleanData: Omit<Transaction, '$id'> = {
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        amount: Number(data.amount), // Ensure amount is a valid number
        type: data.type,
        category: data.category,
        wallets: data.wallets,
        userId,
        reason: data.reason || "",
        notes: data.notes || "",
      };

      // Only include expectedReturnDate if it exists and is valid
      if (data.expectedReturnDate) {
        cleanData.expectedReturnDate = data.expectedReturnDate instanceof Date ? 
          data.expectedReturnDate.toISOString() : data.expectedReturnDate;
      }

      // Log the clean data being sent to Appwrite
      console.log("Creating transaction with data:", cleanData);
      
      const doc = await databases.createDocument(
        DB_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        cleanData
      );
      return doc;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async fetchTransactions(userId: string) {
    try {
      const res = await databases.listDocuments<Transaction>(
        DB_ID,
        TRANSACTIONS_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(50)]  // Add limit as part of the query
      );
      
      // Convert dates from strings to Date objects
      const transactions = res.documents.map(doc => ({
        ...doc,
        date: new Date(doc.date),
        expectedReturnDate: doc.expectedReturnDate ? new Date(doc.expectedReturnDate) : null
      }));
      
      console.log("Fetched transactions:", transactions);

      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  async fetchTransaction(id: string) {
    try {
      const transaction:Models.Document = await databases.getDocument(
        DB_ID,
        TRANSACTIONS_COLLECTION_ID,
        id
      );
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
  }

  async updateTransaction(id: string, data: Partial<Transaction>) {
    try {
      // Format dates for Appwrite
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        expectedReturnDate: data.expectedReturnDate instanceof Date ? 
          data.expectedReturnDate.toISOString() : data.expectedReturnDate
      };

      const doc = await databases.updateDocument(
        DB_ID,
        TRANSACTIONS_COLLECTION_ID,
        id,
        formattedData
      );
      
      // Convert dates back to Date objects
      return {
        ...doc,
        date: new Date(doc.date),
        expectedReturnDate: doc.expectedReturnDate ? new Date(doc.expectedReturnDate) : null
      };
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  async deleteTransaction(id: string) {
    try {
      await databases.deleteDocument(
        DB_ID,
        TRANSACTIONS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }
}

// Create an instance of AppwriteService
const appwriteService = new AppwriteService();
export default appwriteService;