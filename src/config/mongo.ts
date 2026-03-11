import { MongoClient } from 'mongodb';
import { env } from '@/config/env';

let client: MongoClient | null = null;

if (env.MONGO_URL) {
  client = new MongoClient(env.MONGO_URL);
}

export { client as mongoClient };
