const databaseService = require('../services/databaseService');
const llmService = require('../services/llmService');

// Milestone 4: Core Chat API - POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { message, conversation_id, user_id } = req.body;

    // Validation
    if (!message || !user_id) {
      return res.status(400).json({ 
        error: 'Message and user_id are required' 
      });
    }

    let sessionId = conversation_id;

    // Create new session if not provided
    if (!sessionId) {
      const session = await databaseService.createConversationSession(user_id, 'New Chat');
      sessionId = session.sessionId;
    }

    // Save user message
    await databaseService.saveMessage(sessionId, 'user', message);

    // Get conversation history
    const conversationHistory = await databaseService.getConversationHistory(sessionId);

    // Milestone 5: LLM Integration and Business Logic
    // Analyze if we need to query the database
    const analysis = await llmService.shouldQueryDatabase(message, conversationHistory);

    let databaseContext = null;
    let aiResponse = '';

    if (analysis.clarificationNeeded) {
      // Ask clarifying questions
      aiResponse = analysis.clarificationQuestion;
    } else if (analysis.needsDatabase) {
      // Query database based on the type of request
      databaseContext = await this.queryDatabaseForContext(analysis.queryType, message);
      
      // Generate AI response with database context
      aiResponse = await llmService.generateResponse(message, conversationHistory, databaseContext);
    } else {
      // Generate general response without database context
      aiResponse = await llmService.generateResponse(message, conversationHistory);
    }

    // Save AI response
    await databaseService.saveMessage(sessionId, 'ai', aiResponse);

    // Return response
    res.json({
      success: true,
      conversation_id: sessionId,
      response: aiResponse,
      context_used: !!databaseContext
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Helper method to query database based on context
exports.queryDatabaseForContext = async (queryType, message) => {
  try {
    switch (queryType) {
      case 'products':
        // Extract filters from message (simplified approach)
        const filters = this.extractProductFilters(message);
        return await databaseService.getProducts(filters);

      case 'orders':
        // Try to extract user ID or order ID from message
        const orderMatch = message.match(/order[:\s]+(\w+)/i);
        if (orderMatch) {
          return await databaseService.getOrderById(orderMatch[1]);
        }
        return null;

      case 'users':
        // Extract user-related queries
        const stateMatch = message.match(/users?\s+(?:from|in)\s+(\w+)/i);
        if (stateMatch) {
          return await databaseService.getUsersByState(stateMatch[1]);
        }
        return await databaseService.getUserDemographics();

      case 'inventory':
        return await databaseService.getLowStockProducts();

      case 'analytics':
        // Return various analytics data
        const [topProducts, salesByCategory] = await Promise.all([
          databaseService.getTopSellingProducts(),
          databaseService.getSalesByCategory()
        ]);
        return { topProducts, salesByCategory };

      default:
        return null;
    }
  } catch (error) {
    console.error('Database context query error:', error);
    return null;
  }
};

// Helper method to extract product filters from message
exports.extractProductFilters = (message) => {
  const filters = {};
  
  // Extract price filters
  const priceMatch = message.match(/under\s+\$?(\d+)/i) || message.match(/less\s+than\s+\$?(\d+)/i);
  if (priceMatch) {
    filters.maxPrice = parseInt(priceMatch[1]);
  }

  const minPriceMatch = message.match(/over\s+\$?(\d+)/i) || message.match(/more\s+than\s+\$?(\d+)/i);
  if (minPriceMatch) {
    filters.minPrice = parseInt(minPriceMatch[1]);
  }

  // Extract category/brand (simplified)
  const categoryKeywords = ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty'];
  for (const keyword of categoryKeywords) {
    if (message.toLowerCase().includes(keyword)) {
      filters.category = keyword;
      break;
    }
  }

  return filters;
};

// Legacy endpoints (keeping for backward compatibility)
exports.createSession = async (req, res) => {
  try {
    const { user_id, title } = req.body;
    const result = await databaseService.createConversationSession(user_id, title || 'New Session');
    res.json({ session_id: result.sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { session_id, sender, content } = req.body;
    await databaseService.saveMessage(session_id, sender, content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const messages = await databaseService.getConversationHistory(sessionId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessions = await databaseService.getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
