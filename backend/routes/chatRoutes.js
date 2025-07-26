const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/sessions', chatController.createSession);
router.post('/messages', chatController.sendMessage);
router.get('/sessions/:sessionId/messages', chatController.getMessages);
router.get('/users/:userId/sessions', chatController.getUserSessions);

module.exports = router;
