const db = require('../db');

class DatabaseService {
  
  // Generic query method
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Product-related queries
  async getProducts(filters = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
      sql += ' AND category LIKE ?';
      params.push(`%${filters.category}%`);
    }

    if (filters.brand) {
      sql += ' AND brand LIKE ?';
      params.push(`%${filters.brand}%`);
    }

    if (filters.maxPrice) {
      sql += ' AND retail_price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.minPrice) {
      sql += ' AND retail_price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.department) {
      sql += ' AND department LIKE ?';
      params.push(`%${filters.department}%`);
    }

    sql += ' LIMIT 50'; // Limit results for performance

    return this.query(sql, params);
  }

  async getProductById(productId) {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const results = await this.query(sql, [productId]);
    return results[0] || null;
  }

  // User-related queries
  async getUserById(userId) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await this.query(sql, [userId]);
    return results[0] || null;
  }

  async getUsersByState(state) {
    const sql = 'SELECT * FROM users WHERE state = ? LIMIT 100';
    return this.query(sql, [state]);
  }

  // Order-related queries
  async getOrdersByUserId(userId) {
    const sql = `
      SELECT o.*, oi.product_id, p.name as product_name, p.retail_price
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    return this.query(sql, [userId]);
  }

  async getOrderById(orderId) {
    const sql = `
      SELECT o.*, oi.product_id, p.name as product_name, p.retail_price
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.order_id = ?
    `;
    return this.query(sql, [orderId]);
  }

  // Analytics queries
  async getTopSellingProducts(limit = 10) {
    const sql = `
      SELECT p.id, p.name, p.brand, p.category, COUNT(oi.product_id) as sales_count
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.brand, p.category
      ORDER BY sales_count DESC
      LIMIT ?
    `;
    return this.query(sql, [limit]);
  }

  async getSalesByCategory() {
    const sql = `
      SELECT p.category, COUNT(oi.product_id) as sales_count, 
             AVG(p.retail_price) as avg_price
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.category
      ORDER BY sales_count DESC
    `;
    return this.query(sql);
  }

  async getUserDemographics() {
    const sql = `
      SELECT 
        gender,
        COUNT(*) as count,
        AVG(age) as avg_age,
        state
      FROM users 
      WHERE gender IS NOT NULL 
      GROUP BY gender, state
      ORDER BY count DESC
      LIMIT 20
    `;
    return this.query(sql);
  }

  // Inventory queries
  async getInventoryByProduct(productId) {
    const sql = `
      SELECT * FROM inventory_items 
      WHERE product_id = ? AND sold_at IS NULL
      LIMIT 50
    `;
    return this.query(sql, [productId]);
  }

  async getLowStockProducts(threshold = 10) {
    const sql = `
      SELECT p.*, COUNT(ii.id) as stock_count
      FROM products p
      LEFT JOIN inventory_items ii ON p.id = ii.product_id AND ii.sold_at IS NULL
      GROUP BY p.id
      HAVING stock_count < ?
      ORDER BY stock_count ASC
      LIMIT 50
    `;
    return this.query(sql, [threshold]);
  }

  // Search functionality
  async searchProducts(searchTerm) {
    const sql = `
      SELECT * FROM products 
      WHERE name LIKE ? OR brand LIKE ? OR category LIKE ? OR department LIKE ?
      LIMIT 50
    `;
    const term = `%${searchTerm}%`;
    return this.query(sql, [term, term, term, term]);
  }

  // Conversation-related queries
  async createConversationSession(userId, title = 'New Chat') {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO conversation_sessions (user_id, title) VALUES (?, ?)';
      db.run(sql, [userId, title], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ sessionId: this.lastID });
        }
      });
    });
  }

  async saveMessage(sessionId, sender, content) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO messages (session_id, sender, content) VALUES (?, ?, ?)';
      db.run(sql, [sessionId, sender, content], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ messageId: this.lastID });
        }
      });
    });
  }

  async getConversationHistory(sessionId, limit = 50) {
    const sql = `
      SELECT * FROM messages 
      WHERE session_id = ? 
      ORDER BY timestamp ASC 
      LIMIT ?
    `;
    return this.query(sql, [sessionId, limit]);
  }

  async getUserSessions(userId) {
    const sql = `
      SELECT cs.*, 
             (SELECT COUNT(*) FROM messages WHERE session_id = cs.id) as message_count,
             (SELECT content FROM messages WHERE session_id = cs.id ORDER BY timestamp DESC LIMIT 1) as last_message
      FROM conversation_sessions cs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return this.query(sql, [userId]);
  }
}

module.exports = new DatabaseService();