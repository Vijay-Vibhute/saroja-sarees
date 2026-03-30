# Quick Database Query Script
# Usage: .\query-db.ps1 "SELECT * FROM users"

param(
    [string]$Query = "SELECT name FROM sqlite_master WHERE type='table'"
)

$dbPath = "backend\saroja-store.db"

Write-Host "`nQuerying database: $dbPath" -ForegroundColor Cyan
Write-Host "Query: $Query`n" -ForegroundColor Yellow

# Using Node.js tsx to query the database
$script = @"
import Database from 'better-sqlite3';
const db = new Database('$dbPath');
try {
    const rows = db.prepare('$Query').all();
    console.log(JSON.stringify(rows, null, 2));
} catch (err) {
    console.error('Error:', err.message);
}
db.close();
"@

$script | Set-Content -Path "backend\temp-query.mjs"
node backend\temp-query.mjs
Remove-Item "backend\temp-query.mjs" -ErrorAction SilentlyContinue
