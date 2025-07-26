const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Milestone 4: Core Chat API endpoint
router.post('/chat', chatController.chat);

// Legacy endpoints (for backward compatibility)
router.post('/sessions', chatController.createSession);
router.post('/messages', chatController.sendMessage);
router.get('/sessions/:sessionId/messages', chatController.getMessages);
router.get('/users/:userId/sessions', chatController.getUserSessions);

module.exports = router;
