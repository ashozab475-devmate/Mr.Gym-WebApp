// MongoDB connection helper.
//
// Set MONGODB_URI in a .env.local file, e.g.:
//   MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net
//   MONGODB_DB=mrgym
//
// In Next.js dev mode, modules can be re-evaluated on every hot reload,
// which would otherwise open a fresh MongoClient (and a new connection
// pool) on every file save. We cache the client on the global object to
// avoid that.

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "mrgym";

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI. Add it to a .env.local file — see README.md."
  );
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
