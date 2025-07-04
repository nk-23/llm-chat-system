import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ChatMessage from '../components/ChatMessage';
import ModelSelector from '../components/ModelSelector';
import TicketModal from '../components/TicketModal';
import { useChat } from '../hooks/useChat';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('azure');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const messagesEndRef = useRef(null);
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversationHistory
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    
    try {
      await sendMessage(userMessage, selectedModel);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCreateTicket = () => {
    if (messages.length === 0) {
      toast.error('No conversation to create ticket from');
      return;
    }
    setShowTicketModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h1>
          <p className="text-gray-600">Get help with technical issues and support</p>
        </div>
        <div className="flex items-center space-x-3">
          <ModelSelector 
            selectedModel={selectedModel} 
            onModelChange={setSelectedModel} 
          />
          <button
            onClick={clearMessages}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={handleCreateTicket}
            className="btn-primary flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card h-96 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to AI Chat Assistant
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  I'm here to help you with technical support, troubleshooting, and any questions you might have. 
                  Feel free to ask anything!
                </p>
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatMessage message={msg} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
          
          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="typing-indicator"></div>
              <span className="text-gray-600">AI is thinking...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                className="input-field resize-none h-12"
                rows="1"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        conversationHistory={conversationHistory}
      />
    </div>
  );
};

export default ChatPage; 