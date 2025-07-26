const Groq = require('groq-sdk');
require('dotenv').config();

class LLMService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async generateResponse(userMessage, conversationHistory = [], databaseContext = null) {
    try {
      // Build the system prompt with database context
      const systemPrompt = this.buildSystemPrompt(databaseContext);
      
      // Build conversation messages
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: 'llama3-8b-8192', // Using Llama 3 8B model
        temperature: 0.7,
        max_tokens: 1024,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  buildSystemPrompt(databaseContext) {
    let prompt = `You are an intelligent e-commerce assistant with access to a comprehensive database containing:

- Products (with categories, brands, prices, departments)
- Users (with demographics and location data)
- Orders (with status, dates, and items)
- Inventory items
- Distribution centers

Your role is to help users with:
1. Product inquiries and recommendations
2. Order status and history
3. Inventory availability
4. Business analytics and insights
5. General e-commerce questions

Guidelines:
- Ask clarifying questions when you need more specific information
- Provide accurate, helpful responses based on the available data
- If you need to query specific data, clearly indicate what information you need
- Be conversational and helpful
- If you cannot find specific information, explain what data you would need to help better

`;

    if (databaseContext) {
      prompt += `\nCurrent database context:\n${JSON.stringify(databaseContext, null, 2)}`;
    }

    return prompt;
  }

  async shouldQueryDatabase(userMessage, conversationHistory = []) {
    try {
      const analysisPrompt = `Analyze this user message and determine if it requires querying an e-commerce database.

User message: "${userMessage}"

Respond with JSON in this format:
{
  "needsDatabase": true/false,
  "queryType": "products|orders|users|inventory|analytics|none",
  "clarificationNeeded": true/false,
  "clarificationQuestion": "question to ask user if needed"
}

Examples of messages that need database queries:
- "Show me products under $50"
- "What's my order status?"
- "How many users are from California?"
- "What are the top selling products?"

Examples that don't need database:
- "Hello"
- "How are you?"
- "What can you help me with?"`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: analysisPrompt }],
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      try {
        return JSON.parse(response);
      } catch {
        // Fallback if JSON parsing fails
        return {
          needsDatabase: false,
          queryType: 'none',
          clarificationNeeded: false,
          clarificationQuestion: null
        };
      }
    } catch (error) {
      console.error('Database analysis error:', error);
      return {
        needsDatabase: false,
        queryType: 'none',
        clarificationNeeded: false,
        clarificationQuestion: null
      };
    }
  }
}

module.exports = new LLMService();