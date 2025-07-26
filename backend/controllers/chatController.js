const db = require('../db');

exports.createSession = (req, res) => {
  const { user_id, title } = req.body;
  const stmt = db.prepare(`INSERT INTO conversation_sessions (user_id, title) VALUES (?, ?)`);
  const result = stmt.run(user_id, title || 'New Session');
  res.json({ session_id: result.lastInsertRowid });
};

exports.sendMessage = (req, res) => {
  const { session_id, sender, content } = req.body;
  const stmt = db.prepare(`INSERT INTO messages (session_id, sender, content) VALUES (?, ?, ?)`);
  stmt.run(session_id, sender, content);
  res.json({ success: true });
};

exports.getMessages = (req, res) => {
  const sessionId = req.params.sessionId;
  const stmt = db.prepare(`SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC`);
  const messages = stmt.all(sessionId);
  res.json(messages);
};

exports.getUserSessions = (req, res) => {
  const userId = req.params.userId;
  const stmt = db.prepare(`SELECT * FROM conversation_sessions WHERE user_id = ? ORDER BY created_at DESC`);
  const sessions = stmt.all(userId);
  res.json(sessions);
};
