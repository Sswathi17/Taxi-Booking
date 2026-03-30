const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Connected to Neon PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
  process.exit(1);
});

const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Query executed in ${duration}ms | Rows: ${result.rowCount}`);
  }
  return result;
};

const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  client.query = async (text, params) => {
    const start = Date.now();
    const result = await originalQuery(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Transaction query in ${duration}ms`);
    }
    return result;
  };
  return client;
};

module.exports = { pool, query, getClient };