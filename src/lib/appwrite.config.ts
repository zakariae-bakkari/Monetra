import { Client, Account, Databases, ID } from "appwrite";

type CreateUserAccount = {
  email: string;
  password: string;
  name: string;
};

type loginUserAccount = {
  email: string;
  password: string;
};
// Set up properly with fallbacks for debugging
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const walletsCollectionId = process.env.NEXT_PUBLIC_WALLETS_COLLECTION_ID;
const transactionsCollectionId =
  process.env.NEXT_PUBLIC_TRANSACTIONS_COLLECTION_ID;

// Create client with the fixed values
const client = new Client().setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);
// Export configuration values along with clients
export {
  client,
  account,
  databases,
  databaseId as DB_ID,
  walletsCollectionId as WALLETS_COLLECTION_ID,
  transactionsCollectionId as TRANSACTIONS_COLLECTION_ID,
};

export class AppwriteService {
  async createUserAccount({ email, password, name }: CreateUserAccount) {
    try {
      const user = await account.create(ID.unique(), email, password, name);
      if (user) {
        return this.login({ email, password });
      } else {
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  async login({ email, password }: loginUserAccount) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const session = await account.getSession("current");
      if (session) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const session = await account.deleteSession("current");
      if (session) {
        return session;
      } else {
        return session;
      }
    } catch (error) {
      throw error;
    }
  }
}

const appwriteService = new AppwriteService();
export default appwriteService;
