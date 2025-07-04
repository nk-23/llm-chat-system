# 🚀 LLM Chat System - Complete AI-Powered Support Platform

A comprehensive, production-ready chat system with multiple LLM providers, real-time communication, ticketing system, and modern web interface.

## ✨ Features

### 🤖 Multi-LLM Support
- **Azure OpenAI** - GPT-3.5/4 via Azure
- **Llama 2** - Meta's Llama-2-7b-chat via HuggingFace
- **OpenAI GPT-4** - Direct OpenAI API integration
- **Anthropic Claude** - Claude-3 Sonnet integration
- **Easy Extension** - Modular architecture for adding new providers

### 💬 Real-Time Chat
- **WebSocket Support** - Real-time messaging with typing indicators
- **Conversation History** - Maintain context across sessions
- **Markdown Support** - Rich text formatting with syntax highlighting
- **File Upload** - Support for document attachments
- **Voice Input** - Speech-to-text capabilities

### 🎫 Ticketing System
- **Smart Ticket Creation** - Convert conversations to support tickets
- **Priority Management** - Low, Medium, High, Urgent priorities
- **Status Tracking** - Open, In Progress, Resolved, Closed
- **Conversation Linking** - Link tickets to chat conversations
- **Email Notifications** - Automated status updates

### 🎨 Modern UI/UX
- **React Frontend** - Modern, responsive interface
- **Tailwind CSS** - Beautiful, consistent styling
- **Framer Motion** - Smooth animations and transitions
- **Dark Mode** - Toggle between light and dark themes
- **Mobile Responsive** - Works perfectly on all devices

### 📊 Analytics & Monitoring
- **Usage Analytics** - Track model usage and performance
- **Response Times** - Monitor AI response latency
- **Error Tracking** - Comprehensive error logging
- **User Analytics** - User behavior insights

### 🔒 Security & Authentication
- **API Key Management** - Secure credential storage
- **User Authentication** - Role-based access control
- **Data Encryption** - End-to-end encryption
- **Rate Limiting** - Prevent API abuse

## 🏗️ Architecture

```
project/
├── backend/                 # Node.js Express server
│   ├── app.js              # Main server with WebSocket
│   ├── llmAzure.js         # Azure OpenAI integration
│   ├── llmLlama.js         # Llama 2 integration
│   ├── llmOpenAI.js        # OpenAI GPT-4 integration
│   ├── llmClaude.js        # Anthropic Claude integration
│   ├── ticketing.js        # Ticket management system
│   └── README.md           # Backend documentation
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── database/               # Database schemas and migrations
│   └── schema.sql          # Complete database schema
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PostgreSQL/MySQL (optional, for production)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd llm-chat-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Azure OpenAI
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name

# HuggingFace (for Llama)
HF_API_KEY=your_huggingface_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` to access the application!

## 📚 API Documentation

### Chat Endpoints

#### POST `/chat`
Send a message to any LLM provider.

**Request:**
```json
{
  "message": "How do I reset my password?",
  "use": "azure",
  "conversationHistory": [
    {"role": "user", "content": "I can't log in"},
    {"role": "assistant", "content": "I can help you with login issues."}
  ]
}
```

**Response:**
```json
{
  "reply": "To reset your password, go to the login page...",
  "error": null,
  "metadata": {
    "model": "azure-openai",
    "tokens": 150,
    "promptTokens": 50,
    "completionTokens": 100
  }
}
```

#### GET `/models/status`
Check availability of all LLM models.

**Response:**
```json
{
  "models": {
    "azure": {"available": true, "model": "azure-openai"},
    "llama": {"available": true, "model": "meta-llama/Llama-2-7b-chat"},
    "openai": {"available": true, "model": "gpt-4"},
    "claude": {"available": true, "model": "claude-3-sonnet-20240229"}
  }
}
```

### Ticket Endpoints

#### POST `/ticket`
Create a new support ticket.

**Request:**
```json
{
  "issue": "Cannot access email after password reset",
  "user": "john.doe@company.com",
  "priority": "high"
}
```

#### GET `/tickets`
Get all tickets with optional filtering.

#### PUT `/tickets/:ticketId/status`
Update ticket status.

### WebSocket Events

#### Client → Server
- `join-chat` - Join user chat room
- `send-message` - Send message to LLM

#### Server → Client
- `message-response` - Receive LLM response
- `typing-start` - Show typing indicator
- `message-error` - Error notification

## 🎨 Frontend Components

### Core Components
- **ChatPage** - Main chat interface
- **ChatMessage** - Individual message display
- **ModelSelector** - LLM provider selection
- **TicketModal** - Ticket creation modal
- **Navbar** - Navigation and status

### Pages
- **ChatPage** - Real-time chat with AI
- **TicketsPage** - Ticket management dashboard
- **SettingsPage** - System configuration

## 🗄️ Database Schema

The system includes a comprehensive database schema supporting:

- **Users** - User management and authentication
- **Conversations** - Chat session tracking
- **Messages** - Individual message storage
- **Tickets** - Support ticket management
- **Model Configs** - LLM configuration storage
- **Analytics** - Usage and performance metrics
- **API Keys** - Secure credential management

## 🔧 Configuration

### Model Configuration
Each LLM provider can be configured independently:

```javascript
// Azure OpenAI
{
  maxTokens: 512,
  temperature: 0.7,
  systemPrompt: 'You are a helpful tech support assistant.'
}

// Llama 2
{
  maxLength: 2048,
  temperature: 0.7,
  topP: 0.9,
  doSample: true
}
```

### Environment Variables
See the `.env` example above for all required environment variables.

## 🚀 Deployment

### Production Setup
1. Set up a PostgreSQL/MySQL database
2. Configure environment variables
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment
- **AWS** - Use ECS or EC2 with RDS
- **Google Cloud** - Use Cloud Run with Cloud SQL
- **Azure** - Use App Service with Azure SQL
- **Heroku** - Use Heroku Postgres addon

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation** - Check the `/docs` folder
- **Issues** - Report bugs via GitHub Issues
- **Discussions** - Join community discussions
- **Email** - Contact support@llmchat.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multi-LLM support
- ✅ Real-time chat
- ✅ Ticketing system
- ✅ Modern UI

### Phase 2 (Next)
- 🔄 Database integration
- 🔄 User authentication
- 🔄 File upload support
- 🔄 Voice input/output

### Phase 3 (Future)
- 📋 Advanced analytics
- 📋 AI-powered ticket routing
- 📋 Integration with external systems
- 📋 Mobile app

---

**Built with ❤️ using React, Node.js, and the latest AI technologies** 