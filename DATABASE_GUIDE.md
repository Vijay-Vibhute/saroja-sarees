# Database Viewing Guide

Your SQLite database is located at: `backend/saroja-store.db`

## Quick Methods to View Database

### Method 1: View All Tables (Easiest)
```bash
cd backend
npm run db:view
```
This shows ALL tables and their complete data.

### Method 2: View Specific Table
```bash
cd backend
npx tsx src/query-table.ts users
npx tsx src/query-table.ts wishlist
npx tsx src/query-table.ts orders
npx tsx src/query-table.ts addresses
```

### Method 3: List All Tables
```bash
cd backend
npx tsx src/query-table.ts
```
Shows available tables with row counts.

## Current Database Contents

Based on your latest data:

### 📊 Tables Overview
- **users** - 2 users registered
- **wishlist** - 1 product saved
- **orders** - 0 orders (empty)
- **addresses** - 0 addresses (empty)
- **order_items** - 0 items (empty)

### 👥 Users
1. test@example.com (ID: 1)
2. test2205@saroja.com (ID: 2)

### ❤️ Wishlist
- User #2 has product "s1" in wishlist

## Using GUI Tools

### Option 1: DB Browser for SQLite (Free)
1. Download: https://sqlitebrowser.org/
2. Install and open
3. File → Open Database
4. Navigate to `backend/saroja-store.db`
5. Browse data in the GUI

### Option 2: VS Code Extension
1. Install "SQLite Viewer" extension
2. Right-click `backend/saroja-store.db`
3. Select "Open Database"

### Option 3: DBeaver (Free)
1. Download: https://dbeaver.io/
2. Create new SQLite connection
3. Point to `backend/saroja-store.db`

## Custom SQL Queries

Create a file `backend/src/custom-query.ts`:
```typescript
import Database from 'better-sqlite3';
const db = new Database('saroja-store.db');

// Your custom query
const result = db.prepare(`
  SELECT u.name, COUNT(w.id) as wishlist_count
  FROM users u
  LEFT JOIN wishlist w ON u.id = w.user_id
  GROUP BY u.id
`).all();

console.log(result);
db.close();
```

Run with:
```bash
cd backend
npx tsx src/custom-query.ts
```

## Common Queries

### Count users:
```sql
SELECT COUNT(*) FROM users;
```

### Get user with wishlist:
```sql
SELECT u.name, u.email, COUNT(w.id) as items
FROM users u
LEFT JOIN wishlist w ON u.id = w.user_id
GROUP BY u.id;
```

### Get all orders with items:
```sql
SELECT o.order_number, o.total_amount, oi.product_title, oi.quantity
FROM orders o
JOIN order_items oi ON o.id = oi.order_id;
```

## Database Schema

### users
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- name
- phone
- created_at
- updated_at

### addresses
- id
- user_id (FOREIGN KEY → users)
- full_name
- phone
- address
- city
- state
- postal_code
- is_default

### wishlist
- id
- user_id (FOREIGN KEY → users)
- product_id
- created_at

### orders
- id
- user_id (FOREIGN KEY → users)
- order_number (UNIQUE)
- razorpay_order_id
- razorpay_payment_id
- razorpay_signature
- total_amount
- status
- payment_status
- shipping_address_id
- created_at
- updated_at

### order_items
- id
- order_id (FOREIGN KEY → orders)
- product_id
- product_title
- quantity
- price
- created_at
