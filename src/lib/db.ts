import { MongoClient, Db, Collection } from 'mongodb';
import { User } from './types';

let client: MongoClient | null = null;
let db: Db | null = null;

// Don't read environment variables at module level - read them at runtime
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lockbox';

export async function connectToDatabase(): Promise<Db> {
  // Read environment variable at runtime instead of module load time
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in your environment settings');
  }

  if (db && client) {
    return db;
  }

  try {
    // Detect if using Atlas (mongodb+srv) or standard connection
    const isAtlas = MONGODB_URI.startsWith('mongodb+srv://');
    
    // Configure connection options based on connection type
    const options: any = {
      retryWrites: true,
      w: 'majority',
    };

    // Only add TLS options for Atlas connections
    // For standard mongodb:// connections, TLS is usually handled by the connection string
    if (isAtlas) {
      options.tls = true;
      options.tlsAllowInvalidCertificates = false;
    }

    client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const database = await connectToDatabase();
  return database.collection<User>('users');
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

