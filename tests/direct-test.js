// Direct connection test without env variable substitution
require('dotenv/config');
const postgres = require('postgres');

async function testDirectConnection() {
  console.log('Enter your database password when prompted...');
  
  // You can manually paste the password here for testing
  const password = 'PASTE_YOUR_PASSWORD_HERE'; // Replace this
  
  const connectionString = `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true`;
  
  let sql;
  try {
    console.log('Testing direct connection...');
    sql = postgres(connectionString);
    
    const result = await sql`SELECT version()`;
    console.log('✅ SUCCESS! PostgreSQL version:', result[0].version);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables found:', tables.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔍 This usually means:');
      console.log('1. Wrong database password');
      console.log('2. Password has special characters that need URL encoding');
      console.log('3. You might need to use the service_role key instead of DB password for pooled connections');
    }
  } finally {
    if (sql) await sql.end();
  }
}

testDirectConnection();