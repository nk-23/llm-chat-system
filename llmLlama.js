const fetch = require('node-fetch');
require('dotenv').config();

const HF_API_KEY = process.env.HF_API_KEY;

// Llama model configuration
const MODEL_CONFIG = {
  model: 'meta-llama/Llama-2-7b-chat-hf',
  maxLength: 2048,
  temperature: 0.7,
  topP: 0.9,
  doSample: true,
  returnFullText: false
};

/**
 * Format conversation history for Llama model
 * @param {Array} conversationHistory - Array of message objects with role and content
 * @param {string} currentMessage - Current user message
 * @returns {string} Formatted prompt string
 */
function formatPrompt(conversationHistory = [], currentMessage) {
  let prompt = '<s>[INST] ';
  
  // Add conversation history
  conversationHistory.forEach((msg, index) => {
    if (msg.role === 'user') {
      prompt += msg.content;
    } else if (msg.role === 'assistant') {
      prompt += ' [/INST] ' + msg.content + ' </s><s>[INST] ';
    }
  });
  
  // Add current message
  prompt += currentMessage + ' [/INST]';
  
  return prompt;
}

/**
 * Parse Llama response to extract the assistant's reply
 * @param {string} response - Raw response from the model
 * @returns {string} Cleaned assistant response
 */
function parseResponse(response) {
  // Remove the input prompt from the response
  const lines = response.split('\n');
  const lastLine = lines[lines.length - 1].trim();
  
  // Clean up any remaining prompt artifacts
  let cleanedResponse = lastLine
    .replace(/^\[INST\].*?\[\/INST\]/s, '') // Remove any remaining prompt
    .replace(/<\/?s>/g, '') // Remove special tokens
    .trim();
  
  return cleanedResponse || response.trim();
}

/**
 * Get response from Llama model via HuggingFace API
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} Response object with text and metadata
 */
async function getResponse(message, conversationHistory = []) {
  if (!HF_API_KEY) {
    return {
      text: '[HuggingFace API key not set. Please set HF_API_KEY in your .env file]',
      error: 'MISSING_API_KEY',
      metadata: { model: MODEL_CONFIG.model }
    };
  }

  try {
    // Format the prompt with conversation history
    const formattedPrompt = formatPrompt(conversationHistory, message);
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_CONFIG.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: MODEL_CONFIG.maxLength,
          temperature: MODEL_CONFIG.temperature,
          top_p: MODEL_CONFIG.topP,
          do_sample: MODEL_CONFIG.doSample,
          return_full_text: MODEL_CONFIG.returnFullText
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `[HuggingFace API error: ${response.status} - ${errorText}]`;
      
      return {
        text: errorMessage,
        error: 'API_ERROR',
        status: response.status,
        metadata: { model: MODEL_CONFIG.model }
      };
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        text: '[No response received from model]',
        error: 'NO_RESPONSE',
        metadata: { model: MODEL_CONFIG.model }
      };
    }

    // Parse the response
    const rawResponse = data[0]?.generated_text || '';
    const cleanedResponse = parseResponse(rawResponse);

    return {
      text: cleanedResponse,
      error: null,
      metadata: {
        model: MODEL_CONFIG.model,
        tokens: data[0]?.generated_tokens || 0,
        rawResponse: rawResponse
      }
    };

  } catch (err) {
    return {
      text: `[Network or processing error: ${err.message}]`,
      error: 'NETWORK_ERROR',
      metadata: { model: MODEL_CONFIG.model }
    };
  }
}

/**
 * Get model information and status
 * @returns {Promise<Object>} Model status information
 */
async function getModelInfo() {
  if (!HF_API_KEY) {
    return {
      available: false,
      error: 'MISSING_API_KEY',
      model: MODEL_CONFIG.model
    };
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_CONFIG.model}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`
      }
    });

    if (response.ok) {
      return {
        available: true,
        model: MODEL_CONFIG.model,
        status: 'ready'
      };
    } else {
      return {
        available: false,
        error: `HTTP ${response.status}`,
        model: MODEL_CONFIG.model
      };
    }
  } catch (err) {
    return {
      available: false,
      error: err.message,
      model: MODEL_CONFIG.model
    };
  }
}

/**
 * Update model configuration
 * @param {Object} newConfig - New configuration parameters
 */
function updateConfig(newConfig) {
  Object.assign(MODEL_CONFIG, newConfig);
}

module.exports = { 
  getResponse, 
  getModelInfo, 
  updateConfig,
  formatPrompt,
  parseResponse 
}; 