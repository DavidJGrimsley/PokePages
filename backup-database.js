import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import 'dotenv/config';

// Database connection using environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { 
  prepare: false, 
  ssl: 'require' 
});
const db = drizzle(client);

async function backupDatabase() {
  try {
    console.log('Starting database backup...');
    
    // Get all tables in public schema
    const tablesResult = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    let backup = `-- Database Backup Generated: ${new Date().toISOString()}\n\n`;
    
    for (const { table_name } of tablesResult) {
      console.log(`Backing up table: ${table_name}`);
      
      // Get table structure
      const columnsResult = await client`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table_name}
        ORDER BY ordinal_position
      `;
      
      // Create table backup
      backup += `-- Table: ${table_name}\n`;
      backup += `-- Structure:\n`;
      for (const col of columnsResult) {
        backup += `--   ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}\n`;
      }
      
      // Get data
      const data = await client`SELECT * FROM ${client(table_name)}`;
      
      backup += `\n-- Data for ${table_name} (${data.length} rows):\n`;
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        backup += `-- INSERT INTO ${table_name} (${columns.join(', ')}) VALUES\n`;
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });
          backup += `-- (${values.join(', ')})${i === data.length - 1 ? ';' : ','}\n`;
        }
      }
      backup += '\n';
    }
    
    // Save backup file
    const filename = `database-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.sql`;
    fs.writeFileSync(filename, backup);
    
    console.log(`✅ Backup completed: ${filename}`);
    console.log(`📊 Backup contains ${tablesResult.length} tables`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await client.end();
  }
}

backupDatabase();