import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get conversation history for ticket creation
  const conversationHistory = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const sendMessage = useCallback(async (content, model = 'azure') => {
    setIsLoading(true);
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: content,
        use: model,
        conversationHistory: conversationHistory
      });

      const { reply, error, metadata } = response.data;

      if (error) {
        throw new Error(reply || 'Failed to get response');
      }

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Check model status
  const { data: modelStatus } = useQuery(
    'modelStatus',
    async () => {
      const response = await axios.get(`${API_BASE_URL}/models/status`);
      return response.data;
    },
    {
      refetchInterval: 30000, // Check every 30 seconds
      retry: 2,
      onError: (error) => {
        console.error('Failed to check model status:', error);
      }
    }
  );

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversationHistory,
    modelStatus
  };
}; 