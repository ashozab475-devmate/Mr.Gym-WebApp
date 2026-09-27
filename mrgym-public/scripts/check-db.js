// Quick connectivity check: run `npm run db:check` after setting
// MONGODB_URI in .env.local, before starting the app for the first time.
// This catches connection problems with a clear message instead of a
// confusing stack trace from inside a page request.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "mrgym";

async function main() {
  if (!uri) {
    console.error("\n❌ MONGODB_URI is not set.");
    console.error("   Copy .env.local.example to .env.local and fill it in.\n");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  console.log(`  URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")}`);
  console.log(`  Database: ${dbName}`);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    const collections = await client.db(dbName).listCollections().toArray();

    console.log("\n✅ Connected successfully.");
    console.log(
      collections.length
        ? `   Existing collections: ${collections.map((c) => c.name).join(", ")}`
        : "   No collections yet — they'll be created automatically on first use."
    );
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Could not connect to MongoDB.");
    console.error(`   ${err.message}`);
    console.error("\n   Checklist:");
    console.error("   - Is MongoDB actually running locally? (Windows: check the 'MongoDB Server' service is started; macOS: `brew services list`; Docker: `docker ps`)");
    console.error("   - Is MONGODB_URI in .env.local spelled correctly? Default local value is mongodb://localhost:27017");
    console.error("   - Try connecting with MongoDB Compass using the same URI to confirm the server itself is reachable.");
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
