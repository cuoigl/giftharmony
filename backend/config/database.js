const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Supabase yêu cầu SSL, nhưng không cần CA
  },
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    client.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

module.exports = { pool, testConnection };
