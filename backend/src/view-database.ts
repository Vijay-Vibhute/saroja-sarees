import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'saroja-store.db');
const db = new Database(dbPath);

console.log('\n==========================================');
console.log('   SAROJA-SAREE\'S DATABASE VIEWER');
console.log('==========================================\n');

// Get all table names
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all() as Array<{ name: string }>;

console.log(`📊 Database: ${dbPath}`);
console.log(`📋 Total Tables: ${tables.length}\n`);

for (const table of tables) {
  const tableName = table.name;
  
  // Get row count
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
  const rowCount = countResult.count;
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`TABLE: ${tableName.toUpperCase()} (${rowCount} rows)`);
  console.log('='.repeat(50));
  
  if (rowCount === 0) {
    console.log('(empty table)');
    continue;
  }
  
  // Get all data
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
  
  // Display each row
  rows.forEach((row, index) => {
    console.log(`\nRow ${index + 1}:`);
    console.log(JSON.stringify(row, null, 2));
  });
}

console.log('\n==========================================');
console.log('   END OF DATABASE VIEWER');
console.log('==========================================\n');

db.close();
