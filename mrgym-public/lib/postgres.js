import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Add it to .env.local or the deployment environment.");
}

const poolOptions = {
  connectionString,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
};

let pool;
if (process.env.NODE_ENV === "development") {
  if (!global._postgresPool) global._postgresPool = new Pool(poolOptions);
  pool = global._postgresPool;
} else {
  pool = new Pool(poolOptions);
}

let schemaPromise;

export function getPool() {
  return pool;
}

export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          plan TEXT NOT NULL DEFAULT 'Without Cardio',
          fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
          join_date DATE NOT NULL DEFAULT CURRENT_DATE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          next_due_date_override DATE
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
          amount NUMERIC(12, 2) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS payments_member_date_idx
        ON payments (member_id, payment_date DESC)
      `);
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}
