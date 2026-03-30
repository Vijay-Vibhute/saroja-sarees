#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'saroja-store.db');
const db = new Database(dbPath);

const args = process.argv.slice(2);
const tableName = args[0];

if (!tableName) {
  console.log('\nAvailable tables:');
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all() as Array<{ name: string }>;
  
  tables.forEach(t => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get() as { count: number };
    console.log(`  📊 ${t.name} (${count.count} rows)`);
  });
  
  console.log('\nUsage: tsx src/query-table.ts <table_name>');
  console.log('Example: tsx src/query-table.ts users\n');
  process.exit(0);
}

try {
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
  
  if (rows.length === 0) {
    console.log(`\nTable "${tableName}" is empty.\n`);
  } else {
    console.log(`\n📋 ${tableName.toUpperCase()} (${rows.length} rows)\n`);
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`);
      console.log(JSON.stringify(row, null, 2));
      console.log('');
    });
  }
} catch (err) {
  console.error(`Error: ${(err as Error).message}`);
}

db.close();
