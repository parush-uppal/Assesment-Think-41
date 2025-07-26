const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const db = new sqlite3.Database('ecommerce.db');

function loadCSV(filePath, insertFn) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        for (const row of rows) {
          try {
            await insertFn(row);
          } catch (err) {
            console.error(`❌ Error inserting row:`, row, err.message);
          }
        }
        console.log(`✅ Loaded: ${filePath}`);
        resolve();
      })
      .on('error', reject);
  });
}

// ---------------- Insert Functions ----------------
const insertDistributionCenter = (row) => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO distribution_centers (id, name, latitude, longitude) VALUES (?, ?, ?, ?)`,
    [row.id, row.name, row.latitude, row.longitude],
    (err) => (err ? reject(err) : resolve())
  );
});

const insertProduct = (row) => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO products (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id, row.cost, row.category, row.name, row.brand,
      row.retail_price, row.department, row.sku, row.distribution_center_id
    ],
    (err) => (err ? reject(err) : resolve())
  );
});

const insertUser = (row) => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO users (id, first_name, last_name, email, age, gender, state, street_address, postal_code, city, country, latitude, longitude, traffic_source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id, row.first_name, row.last_name, row.email, row.age, row.gender, row.state,
      row.street_address, row.postal_code, row.city, row.country,
      row.latitude, row.longitude, row.traffic_source, row.created_at
    ],
    (err) => (err ? reject(err) : resolve())
  );
});

const insertInventoryItem = (row) => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO inventory_items (id, product_id, created_at, sold_at, cost, product_category, product_name, product_brand, product_retail_price, product_department, product_sku, product_distribution_center_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id, row.product_id, row.created_at, row.sold_at, row.cost,
      row.product_category, row.product_name, row.product_brand,
      row.product_retail_price, row.product_department,
      row.product_sku, row.product_distribution_center_id
    ],
    (err) => (err ? reject(err) : resolve())
  );
});

const insertOrder = (row) => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO orders (order_id, user_id, status, gender, created_at, returned_at, shipped_at, delivered_at, num_of_item)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.order_id, row.user_id, row.status, row.gender,
      row.created_at, row.returned_at, row.shipped_at, row.delivered_at, row.num_of_item
    ],
    (err) => (err ? reject(err) : resolve())
  );
});

const insertOrderItem = (row) => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO order_items (id, order_id, user_id, product_id, inventory_item_id, status, created_at, shipped_at, delivered_at, returned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id, row.order_id, row.user_id, row.product_id,
      row.inventory_item_id, row.status, row.created_at,
      row.shipped_at, row.delivered_at, row.returned_at
    ],
    (err) => (err ? reject(err) : resolve())
  );
});

// ---------------- Master Ingest Function ----------------
(async () => {
  try {
    await loadCSV("./dataset/distribution_centers.csv", insertDistributionCenter);
    await loadCSV("./dataset/products.csv", insertProduct);
    await loadCSV("./dataset/users.csv", insertUser);
    await loadCSV("./dataset/inventory_items.csv", insertInventoryItem);
    await loadCSV("./dataset/orders.csv", insertOrder);
    await loadCSV("./dataset/order_items.csv", insertOrderItem);
    console.log("🎉 All CSV files loaded successfully.");
  } catch (error) {
    console.error("❌ Error loading CSVs:", error);
  } finally {
    db.close();
  }
})();
