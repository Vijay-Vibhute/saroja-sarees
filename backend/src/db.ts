import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, '..', 'saroja-store.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Addresses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Wishlist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      shipping_address_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shipping_address_id) REFERENCES addresses(id)
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully');
}

// Initialize database tables BEFORE creating prepared statements
initializeDatabase();

// Prepared statements
const userStmts = {
  create: db.prepare(`
    INSERT INTO users (email, password, name, phone)
    VALUES (?, ?, ?, ?)
  `),
  
  findByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),
  
  findById: db.prepare(`
    SELECT id, email, name, phone, created_at FROM users WHERE id = ?
  `),
  
  update: db.prepare(`
    UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  updateLastLogin: db.prepare(`
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `),
};

const addressStmts = {
  create: db.prepare(`
    INSERT INTO addresses (user_id, full_name, phone, address, city, state, postal_code, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  
  findByUserId: db.prepare(`
    SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC
  `),
  
  findById: db.prepare(`
    SELECT * FROM addresses WHERE id = ? AND user_id = ?
  `),
  
  setDefault: db.prepare(`
    UPDATE addresses SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END
    WHERE user_id = ?
  `),
  
  delete: db.prepare(`
    DELETE FROM addresses WHERE id = ? AND user_id = ?
  `),
};

const wishlistStmts = {
  add: db.prepare(`
    INSERT OR IGNORE INTO wishlist (user_id, product_id)
    VALUES (?, ?)
  `),
  
  remove: db.prepare(`
    DELETE FROM wishlist WHERE user_id = ? AND product_id = ?
  `),
  
  findByUserId: db.prepare(`
    SELECT product_id, created_at FROM wishlist WHERE user_id = ? ORDER BY created_at DESC
  `),
  
  exists: db.prepare(`
    SELECT COUNT(*) as count FROM wishlist WHERE user_id = ? AND product_id = ?
  `),
};

const orderStmts = {
  create: db.prepare(`
    INSERT INTO orders (user_id, order_number, razorpay_order_id, razorpay_payment_id, total_amount, status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  addItem: db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_title, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  findByUserId: db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `),
  
  findById: db.prepare(`
    SELECT * FROM orders WHERE id = ? AND user_id = ?
  `),
  
  getItems: db.prepare(`
    SELECT * FROM order_items WHERE order_id = ?
  `),
  
  updatePayment: db.prepare(`
    UPDATE orders 
    SET razorpay_order_id = ?, razorpay_payment_id = ?, razorpay_signature = ?,
        payment_status = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
};

// User queries
export const userQueries = {
  create: (email: string, password: string, name: string, phone?: string) => 
    userStmts.create.run(email, password, name, phone || null),
  getByEmail: (email: string) => 
    userStmts.findByEmail.get(email) as any,
  getById: (id: number) => 
    userStmts.findById.get(id) as any,
  update: (id: number, name: string, phone?: string) => 
    userStmts.update.run(name, phone || null, id),
  updateLastLogin: (id: number) => 
    userStmts.updateLastLogin.run(id),
};

// Address queries  
export const addressQueries = {
  create: (userId: number, fullName: string, phone: string, address: string, city: string, state: string, postalCode: string, isDefault: number = 0) =>
    addressStmts.create.run(userId, fullName, phone, address, city, state, postalCode, isDefault),
  getByUserId: (userId: number) =>
    addressStmts.findByUserId.all(userId) as any[],
  getById: (id: number, userId: number) =>
    addressStmts.findById.get(id, userId) as any,
  setDefault: (id: number, userId: number) =>
    addressStmts.setDefault.run(id, userId),
  delete: (userId: number, id: number) =>
    addressStmts.delete.run(id, userId),
};

// Wishlist queries
export const wishlistQueries = {
  add: (userId: number, productId: string) =>
    wishlistStmts.add.run(userId, productId),
  remove: (userId: number, productId: string) =>
    wishlistStmts.remove.run(userId, productId),
  getByUserId: (userId: number) =>
    wishlistStmts.findByUserId.all(userId) as any[],
  exists: (userId: number, productId: string) =>
    wishlistStmts.exists.get(userId, productId) as any,
};

// Order queries
export const orderQueries = {
  create: (userId: number, razorpayOrderId: string, razorpayPaymentId: string, totalAmount: number, status: string) => {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return orderStmts.create.run(userId, orderNumber, razorpayOrderId, razorpayPaymentId, totalAmount, status, 'paid');
  },
  addItem: (orderId: number, productId: string, quantity: number, price: number, productTitle: string) =>
    orderStmts.addItem.run(orderId, productId, productTitle, quantity, price),
  getByUserId: (userId: number) =>
    orderStmts.findByUserId.all(userId) as any[],
  getById: (id: number, userId: number) =>
    orderStmts.findById.get(id, userId) as any,
  getOrderItems: (orderId: number) =>
    orderStmts.getItems.all(orderId) as any[],
  updatePayment: (id: number, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, paymentStatus: string, status: string) =>
    orderStmts.updatePayment.run(razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentStatus, status, id),
};
