const fetch = require('node-fetch');
require('dotenv').config();

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

// Azure OpenAI configuration
const AZURE_CONFIG = {
  maxTokens: 512,
  temperature: 0.7,
  systemPrompt: 'You are a helpful tech support assistant.'
};

/**
 * Get response from Azure OpenAI
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} Response object with text and metadata
 */
async function getResponse(message, conversationHistory = []) {
  if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
    return {
      text: '[Azure OpenAI credentials not set. Please set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT in your .env file]',
      error: 'MISSING_CREDENTIALS',
      metadata: { model: 'azure-openai' }
    };
  }

  const url = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-03-15-preview`;

  // Build messages array with conversation history
  const messages = [
    { role: 'system', content: AZURE_CONFIG.systemPrompt }
  ];

  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({ role: msg.role, content: msg.content });
  });

  // Add current message
  messages.push({ role: 'user', content: message });

  const body = {
    messages,
    max_tokens: AZURE_CONFIG.maxTokens,
    temperature: AZURE_CONFIG.temperature
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `[Azure OpenAI API error: ${response.status} - ${errorText}]`;
      
      return {
        text: errorMessage,
        error: 'API_ERROR',
        status: response.status,
        metadata: { model: 'azure-openai' }
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '[No response from Azure OpenAI]';

    return {
      text: reply,
      error: null,
      metadata: {
        model: 'azure-openai',
        tokens: data.usage?.total_tokens || 0,
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0
      }
    };

  } catch (err) {
    return {
      text: `[Network or processing error: ${err.message}]`,
      error: 'NETWORK_ERROR',
      metadata: { model: 'azure-openai' }
    };
  }
}

/**
 * Update Azure configuration
 * @param {Object} newConfig - New configuration parameters
 */
function updateConfig(newConfig) {
  Object.assign(AZURE_CONFIG, newConfig);
}

module.exports = { getResponse, updateConfig }; 