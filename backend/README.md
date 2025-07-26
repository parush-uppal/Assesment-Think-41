# E-commerce Chat API with LLM Integration

This backend implements a sophisticated chat API that integrates with an LLM (Large Language Model) to provide intelligent responses about e-commerce data.

## Features

### Milestone 4: Core Chat API ✅
- **POST /api/chat** - Primary chat endpoint
- Accepts user messages and optional conversation_id
- Persists both user messages and AI responses to database
- Automatic conversation session management

### Milestone 5: LLM Integration and Business Logic ✅
- Integration with Groq's free API using Llama 3 8B model
- Intelligent query analysis to determine when database queries are needed
- Contextual responses based on e-commerce data
- Clarifying questions when more information is needed

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
GROQ_API_KEY=your_groq_api_key_here
DB_PATH=./ecommerce.db
PORT=3001
```

**Get your Groq API key:**
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

### 3. Initialize Database
```bash
node db.js
```

### 4. Load Sample Data (if available)
```bash
node load_data.js
```

### 5. Start the Server
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Primary Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Show me products under $50",
  "user_id": 1,
  "conversation_id": "optional-existing-conversation-id"
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": "123",
  "response": "Here are some products under $50...",
  "context_used": true
}
```

### Legacy Endpoints (Backward Compatibility)
- `POST /api/sessions` - Create conversation session
- `POST /api/messages` - Send message
- `GET /api/sessions/:sessionId/messages` - Get conversation history
- `GET /api/users/:userId/sessions` - Get user's sessions

## How It Works

### 1. Message Analysis
When a user sends a message, the system:
- Analyzes if the query requires database information
- Determines the type of query (products, orders, analytics, etc.)
- Identifies if clarifying questions are needed

### 2. Database Context Retrieval
Based on the analysis, the system queries relevant data:
- **Products**: Filters by price, category, brand, etc.
- **Orders**: User order history and status
- **Analytics**: Sales data, top products, demographics
- **Inventory**: Stock levels and availability

### 3. LLM Response Generation
The LLM generates responses using:
- User's message
- Conversation history
- Relevant database context
- System prompts for e-commerce assistance

### 4. Persistence
Both user messages and AI responses are saved to the database for conversation continuity.

## Example Interactions

### Product Inquiries
```
User: "Show me electronics under $100"
AI: "Here are some electronics under $100 from our inventory..."
```

### Order Status
```
User: "What's the status of my recent orders?"
AI: "Let me check your order history. I can see you have..."
```

### Analytics Questions
```
User: "What are our top selling products this month?"
AI: "Based on our sales data, here are the top selling products..."
```

### Clarifying Questions
```
User: "I want to buy something"
AI: "I'd be happy to help! What type of product are you looking for? Are you interested in a specific category like electronics, clothing, or home goods?"
```

## Database Schema

The system uses SQLite with the following key tables:
- `products` - Product catalog
- `users` - Customer information
- `orders` - Order data
- `order_items` - Order line items
- `inventory_items` - Stock information
- `conversation_sessions` - Chat sessions
- `messages` - Chat messages

## Testing

Run the test script to verify functionality:
```bash
node test-chat.js
```

Make sure the server is running before executing tests.

## Error Handling

The API includes comprehensive error handling:
- Input validation
- Database connection errors
- LLM API failures
- Graceful fallbacks for service unavailability

## Performance Considerations

- Database queries are limited to prevent performance issues
- Conversation history is limited to recent messages
- Efficient indexing on frequently queried fields
- Connection pooling for database operations

## Security Notes

- API keys should be kept secure in environment variables
- Input sanitization is implemented
- Rate limiting should be added for production use
- CORS is configured for frontend integration