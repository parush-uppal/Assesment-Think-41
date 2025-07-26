const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a persistent database connection
const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
  // Existing tables
  db.run(`CREATE TABLE IF NOT EXISTS distribution_centers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    latitude REAL,
    longitude REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    cost REAL,
    category TEXT,
    name TEXT,
    brand TEXT,
    retail_price REAL,
    department TEXT,
    sku TEXT,
    distribution_center_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    created_at TEXT,
    sold_at TEXT,
    cost REAL,
    product_category TEXT,
    product_name TEXT,
    product_brand TEXT,
    product_retail_price REAL,
    product_department TEXT,
    product_sku TEXT,
    product_distribution_center_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    age INTEGER,
    gender TEXT,
    state TEXT,
    street_address TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT,
    latitude REAL,
    longitude REAL,
    traffic_source TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    user_id INTEGER,
    status TEXT,
    gender TEXT,
    created_at TEXT,
    returned_at TEXT,
    shipped_at TEXT,
    delivered_at TEXT,
    num_of_item INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id TEXT,
    user_id INTEGER,
    product_id INTEGER,
    inventory_item_id INTEGER,
    status TEXT,
    created_at TEXT,
    shipped_at TEXT,
    delivered_at TEXT,
    returned_at TEXT
  )`);

  // 💬 New tables for conversation tracking
  db.run(`CREATE TABLE IF NOT EXISTS conversation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS conversation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    sender TEXT, -- 'user' or 'ai'
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES conversation_sessions(id)
  )`);

      console.log("✅ Tables created successfully.");
      resolve();
    });
  });
};

// Initialize the database when the module is loaded
initializeDatabase().catch(console.error);

module.exports = db;
