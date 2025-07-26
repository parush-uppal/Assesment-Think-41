// Simple test script for the Chat API
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testChatAPI() {
  try {
    console.log('🧪 Testing Chat API...\n');

    // Test 1: Simple greeting
    console.log('Test 1: Simple greeting');
    const response1 = await axios.post(`${BASE_URL}/chat`, {
      message: "Hello! What can you help me with?",
      user_id: 1
    });
    console.log('Response:', response1.data.response);
    console.log('Conversation ID:', response1.data.conversation_id);
    console.log('---\n');

    const conversationId = response1.data.conversation_id;

    // Test 2: Product inquiry
    console.log('Test 2: Product inquiry');
    const response2 = await axios.post(`${BASE_URL}/chat`, {
      message: "Show me products under $50",
      user_id: 1,
      conversation_id: conversationId
    });
    console.log('Response:', response2.data.response);
    console.log('Context used:', response2.data.context_used);
    console.log('---\n');

    // Test 3: Analytics question
    console.log('Test 3: Analytics question');
    const response3 = await axios.post(`${BASE_URL}/chat`, {
      message: "What are the top selling products?",
      user_id: 1,
      conversation_id: conversationId
    });
    console.log('Response:', response3.data.response);
    console.log('Context used:', response3.data.context_used);
    console.log('---\n');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testChatAPI();