// Simple test to verify database connection using service role key
require('dotenv/config');
const postgres = require('postgres');

async function testConnection() {
  let sql;
  try {
    console.log('Testing database connection with service role key...');
    console.log('DATABASE_URL format:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    sql = postgres(process.env.DATABASE_URL);
    console.log('✅ Connection string parsed successfully!');
    
    // Test a simple query
    const result = await sql`SELECT version()`;
    console.log('PostgreSQL version:', result[0].version);
    
    // List tables in public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables found:', tables.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Make sure you have replaced YOUR_SERVICE_ROLE_KEY in .env file');
  } finally {
    if (sql) await sql.end();
  }
}

testConnection();