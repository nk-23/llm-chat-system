# Tech Support Chatbot Backend (Node.js)

A comprehensive backend system for a tech support chatbot with multiple LLM providers and ticketing functionality.

## Features
- **Multi-LLM Support**: Azure OpenAI and Llama (HuggingFace) integration
- **Conversation History**: Maintains context across chat sessions
- **Ticketing System**: Create and manage support tickets
- **RESTful API**: Clean endpoints for chat and ticket management
- **Error Handling**: Comprehensive error handling and status reporting
- **Modular Architecture**: Easy to extend with new LLM providers

## Setup

1. **Install dependencies:**
   ```bash
   npm install express body-parser dotenv node-fetch
   ```

2. **Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   
   # HuggingFace Configuration (for Llama)
   HF_API_KEY=your_huggingface_api_key_here
   
   # Server Configuration
   PORT=3001
   ```

3. **Run the server:**
   ```bash
   node app.js
   ```

## API Endpoints

### Chat Endpoint
**POST** `/chat`
- Send messages to either Azure OpenAI or Llama model
- Supports conversation history for context

**Request:**
```json
{
  "message": "How do I reset my password?",
  "use": "azure",  // or "llama"
  "conversationHistory": [
    {"role": "user", "content": "I can't log in"},
    {"role": "assistant", "content": "I can help you with login issues."}
  ]
}
```

**Response:**
```json
{
  "reply": "To reset your password, go to the login page and click 'Forgot Password'...",
  "error": null,
  "metadata": {
    "model": "azure-openai",
    "tokens": 150,
    "promptTokens": 50,
    "completionTokens": 100
  }
}
```

### Model Status
**GET** `/models/status`
- Check availability of both LLM models

**Response:**
```json
{
  "models": {
    "azure": {"available": true, "model": "azure-openai"},
    "llama": {"available": true, "model": "meta-llama/Llama-2-7b-chat-hf"}
  }
}
```

### Ticket Management

**POST** `/ticket` - Create a new ticket
```json
{
  "issue": "Cannot access email",
  "user": "john.doe@company.com"
}
```

**GET** `/tickets` - Get all tickets

## LLM Configuration

### Azure OpenAI
- **Model**: GPT-3.5-turbo or GPT-4 (via Azure)
- **Features**: Conversation history, system prompts, token usage tracking
- **Configuration**: Adjustable temperature, max tokens, system prompt

### Llama (HuggingFace)
- **Model**: Llama-2-7b-chat-hf
- **Features**: Conversation history, proper Llama chat formatting
- **Configuration**: Adjustable temperature, top-p, max tokens

## Usage Examples

### Basic Chat
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello, I need help with my computer',
    use: 'azure'
  })
});
```

### Chat with History
```javascript
const conversationHistory = [
  { role: 'user', content: 'My computer is slow' },
  { role: 'assistant', content: 'I can help you troubleshoot that. What operating system are you using?' }
];

const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Windows 10',
    use: 'llama',
    conversationHistory
  })
});
```

### Create Support Ticket
```javascript
const ticketResponse = await fetch('/ticket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    issue: 'Printer not working after Windows update',
    user: 'jane.smith@company.com'
  })
});
```

## Error Handling

The API returns structured error responses:
```json
{
  "reply": "Error message for user",
  "error": "ERROR_TYPE",
  "metadata": {"model": "model-name"}
}
```

Common error types:
- `MISSING_CREDENTIALS` - API keys not configured
- `API_ERROR` - External API error
- `NETWORK_ERROR` - Network connectivity issues
- `INVALID_MODEL` - Unsupported model specified

## Development

### Adding New LLM Providers
1. Create a new module (e.g., `llmOpenAI.js`)
2. Implement `getResponse(message, conversationHistory)` function
3. Return structured response object
4. Add to app.js routing logic

### Extending Ticketing System
- Currently uses file-based storage
- Can be extended to use databases (MongoDB, PostgreSQL)
- Add authentication and authorization
- Implement ticket assignment and escalation

## Health Check
**GET** `/` - Returns server status message 