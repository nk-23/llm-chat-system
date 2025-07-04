const fetch = require('node-fetch');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI configuration
const OPENAI_CONFIG = {
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: 'You are a helpful tech support assistant.'
};

/**
 * Get response from OpenAI GPT-4
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} Response object with text and metadata
 */
async function getResponse(message, conversationHistory = []) {
  if (!OPENAI_API_KEY) {
    return {
      text: '[OpenAI API key not set. Please set OPENAI_API_KEY in your .env file]',
      error: 'MISSING_API_KEY',
      metadata: { model: OPENAI_CONFIG.model }
    };
  }

  try {
    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: OPENAI_CONFIG.systemPrompt }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages,
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `[OpenAI API error: ${response.status} - ${errorText}]`;
      
      return {
        text: errorMessage,
        error: 'API_ERROR',
        status: response.status,
        metadata: { model: OPENAI_CONFIG.model }
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '[No response from OpenAI]';

    return {
      text: reply,
      error: null,
      metadata: {
        model: OPENAI_CONFIG.model,
        tokens: data.usage?.total_tokens || 0,
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0
      }
    };

  } catch (err) {
    return {
      text: `[Network or processing error: ${err.message}]`,
      error: 'NETWORK_ERROR',
      metadata: { model: OPENAI_CONFIG.model }
    };
  }
}

/**
 * Update OpenAI configuration
 * @param {Object} newConfig - New configuration parameters
 */
function updateConfig(newConfig) {
  Object.assign(OPENAI_CONFIG, newConfig);
}

module.exports = { getResponse, updateConfig }; 