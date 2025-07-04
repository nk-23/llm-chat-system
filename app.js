const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// LLM modules
const llmAzure = require('./llmAzure');
const llmLlama = require('./llmLlama');
const llmOpenAI = require('./llmOpenAI');
const llmClaude = require('./llmClaude');
const ticketing = require('./ticketing');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => {
  res.send('Tech Support Chatbot Backend is running.');
});

// Chat endpoint (routes to LLMs)
app.post('/chat', async (req, res) => {
  const { message, use = 'azure', conversationHistory = [] } = req.body;
  
  try {
    let response;
    
    switch (use) {
      case 'azure':
        response = await llmAzure.getResponse(message, conversationHistory);
        break;
      case 'llama':
        response = await llmLlama.getResponse(message, conversationHistory);
        break;
      case 'openai':
        response = await llmOpenAI.getResponse(message, conversationHistory);
        break;
      case 'claude':
        response = await llmClaude.getResponse(message, conversationHistory);
        break;
      default:
        response = {
          text: 'Please specify a valid LLM: azure, llama, openai, or claude.',
          error: 'INVALID_MODEL',
          metadata: { model: 'none' }
        };
    }
    
    res.json({
      reply: response.text,
      error: response.error,
      metadata: response.metadata
    });
    
  } catch (error) {
    res.status(500).json({
      reply: 'Internal server error occurred while processing your request.',
      error: 'INTERNAL_ERROR',
      metadata: { model: 'none' }
    });
  }
});

// Model status endpoint
app.get('/models/status', async (req, res) => {
  try {
    const [azureStatus, llamaStatus, openaiStatus, claudeStatus] = await Promise.all([
      llmAzure.getResponse('test', []).then(() => ({ available: true, model: 'azure-openai' })).catch(() => ({ available: false, model: 'azure-openai' })),
      llmLlama.getModelInfo(),
      llmOpenAI.getResponse('test', []).then(() => ({ available: true, model: 'gpt-4' })).catch(() => ({ available: false, model: 'gpt-4' })),
      llmClaude.getResponse('test', []).then(() => ({ available: true, model: 'claude-3' })).catch(() => ({ available: false, model: 'claude-3' }))
    ]);
    
    res.json({
      models: {
        azure: azureStatus,
        llama: llamaStatus,
        openai: openaiStatus,
        claude: claudeStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check model status' });
  }
});

// Ticket creation endpoint
app.post('/ticket', async (req, res) => {
  const { issue, user, priority = 'medium' } = req.body;
  
  if (!issue || !user) {
    return res.status(400).json({ 
      error: 'Missing required fields: issue and user' 
    });
  }
  
  try {
    const ticketId = await ticketing.createTicket(issue, user, priority);
    res.json({ ticketId, success: true });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create ticket',
      details: error.message 
    });
  }
});

// Get all tickets endpoint
app.get('/tickets', async (req, res) => {
  try {
    const tickets = await ticketing.getAllTickets();
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve tickets',
      details: error.message 
    });
  }
});

// Update ticket status endpoint
app.put('/tickets/:ticketId/status', async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  try {
    const success = await ticketing.updateTicketStatus(ticketId, status);
    if (success) {
      res.json({ success: true, message: 'Ticket status updated' });
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update ticket status',
      details: error.message 
    });
  }
});

// Analytics endpoint
app.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // TODO: Implement analytics from database
    res.json({
      totalMessages: 0,
      totalTickets: 0,
      modelUsage: {},
      responseTimes: {}
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-chat', (data) => {
    socket.join(`chat-${data.userId}`);
    console.log(`User ${data.userId} joined chat`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { message, model, conversationHistory, userId } = data;
      
      // Emit typing indicator
      socket.emit('typing-start');
      
      // Get response from selected model
      let response;
      switch (model) {
        case 'azure':
          response = await llmAzure.getResponse(message, conversationHistory);
          break;
        case 'llama':
          response = await llmLlama.getResponse(message, conversationHistory);
          break;
        case 'openai':
          response = await llmOpenAI.getResponse(message, conversationHistory);
          break;
        case 'claude':
          response = await llmClaude.getResponse(message, conversationHistory);
          break;
        default:
          response = { text: 'Invalid model selected', error: 'INVALID_MODEL' };
      }
      
      // Emit response
      socket.emit('message-response', {
        reply: response.text,
        error: response.error,
        metadata: response.metadata
      });
      
    } catch (error) {
      socket.emit('message-error', {
        error: 'Failed to process message',
        details: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Tech Support Chatbot Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time chat`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`  GET  / - Health check`);
  console.log(`  POST /chat - Chat with LLM (azure/llama/openai/claude)`);
  console.log(`  GET  /models/status - Check model availability`);
  console.log(`  POST /ticket - Create support ticket`);
  console.log(`  GET  /tickets - Get all tickets`);
  console.log(`  PUT  /tickets/:id/status - Update ticket status`);
  console.log(`  GET  /analytics - Get system analytics`);
  console.log(`\n🔌 WebSocket events:`);
  console.log(`  join-chat - Join user chat room`);
  console.log(`  send-message - Send message to LLM`);
  console.log(`  message-response - Receive LLM response`);
  console.log(`  typing-start - Show typing indicator`);
}); 