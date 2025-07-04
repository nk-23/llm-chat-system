const fetch = require('node-fetch');
require('dotenv').config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Claude configuration
const CLAUDE_CONFIG = {
  model: 'claude-3-sonnet-20240229',
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: 'You are a helpful tech support assistant.'
};

/**
 * Get response from Anthropic Claude
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} Response object with text and metadata
 */
async function getResponse(message, conversationHistory = []) {
  if (!ANTHROPIC_API_KEY) {
    return {
      text: '[Anthropic API key not set. Please set ANTHROPIC_API_KEY in your .env file]',
      error: 'MISSING_API_KEY',
      metadata: { model: CLAUDE_CONFIG.model }
    };
  }

  try {
    // Build messages array with conversation history
    const messages = [];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
        system: CLAUDE_CONFIG.systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `[Anthropic API error: ${response.status} - ${errorText}]`;
      
      return {
        text: errorMessage,
        error: 'API_ERROR',
        status: response.status,
        metadata: { model: CLAUDE_CONFIG.model }
      };
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '[No response from Claude]';

    return {
      text: reply,
      error: null,
      metadata: {
        model: CLAUDE_CONFIG.model,
        tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0
      }
    };

  } catch (err) {
    return {
      text: `[Network or processing error: ${err.message}]`,
      error: 'NETWORK_ERROR',
      metadata: { model: CLAUDE_CONFIG.model }
    };
  }
}

/**
 * Update Claude configuration
 * @param {Object} newConfig - New configuration parameters
 */
function updateConfig(newConfig) {
  Object.assign(CLAUDE_CONFIG, newConfig);
}

module.exports = { getResponse, updateConfig }; 