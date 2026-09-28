// Quick connectivity check for DATABASE_URL in .env.local.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
const { Pool } = require("pg");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("\nDATABASE_URL is not set. Copy .env.local.example to .env.local and fill it in.\n");
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  try {
    await pool.query("SELECT 1");
    const databaseUrl = new URL(connectionString);
    console.log("\nConnected to PostgreSQL successfully.");
    console.log(`  Host: ${databaseUrl.hostname}`);
    console.log(`  Database: ${databaseUrl.pathname.slice(1)}`);
    console.log("  Tables are created automatically when the app first accesses the database.");
  } catch (error) {
    console.error("\nCould not connect to PostgreSQL.");
    console.error(`  ${error.message}`);
    console.error("  Check DATABASE_URL, database availability, and network access.\n");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
