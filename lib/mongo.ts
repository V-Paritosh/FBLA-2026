import { MongoClient, type Db, type Collection } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  // Fail fast in dev if the URI is missing – avoids confusing runtime errors.
  console.warn(
    "[mongo] MONGODB_URI is not set. Database calls will fail at runtime."
  );
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("cs_learning_hub");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getCollection<T = unknown>(
  name: string
): Promise<Collection<T>> {
  const { db } = await connectToDatabase();
  return db.collection<T>(name);
}
