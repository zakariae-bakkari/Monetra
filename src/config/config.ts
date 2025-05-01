type AppwriteConfig = {
   appwriteUrl: string;
   appwriteProject: string;
   appwriteDatabase: string;
   appwriteWalletsCollection: string;
   appwriteTransactionsCollection: string;
}
const conf = {
   appwriteUrl: String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
   appwriteProject: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
   appwriteDatabase: String(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID),
   appwriteWalletsCollection: String(process.env.NEXT_PUBLIC_WALLETS_COLLECTION_ID),
   appwriteTransactionsCollection: String(process.env.NEXT_PUBLIC_TRANSACTIONS_COLLECTION_ID),
}

export default conf;