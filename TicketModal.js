import React, { useState } from 'react';
import { X, FileText, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketModal = ({ isOpen, onClose, conversationHistory }) => {
  const [formData, setFormData] = useState({
    issue: '',
    user: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.issue.trim() || !formData.user.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a summary of the conversation
      const conversationSummary = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const ticketData = {
        issue: `${formData.issue}\n\nConversation Summary:\n${conversationSummary}`,
        user: formData.user,
        priority: formData.priority
      };

      const response = await axios.post('/ticket', ticketData);
      
      toast.success(`Ticket created successfully! ID: ${response.data.ticketId}`);
      onClose();
      
      // Reset form
      setFormData({
        issue: '',
        user: '',
        priority: 'medium'
      });

    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Create Support Ticket</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* User Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="user"
                value={formData.user}
                onChange={handleChange}
                placeholder="your.email@company.com"
                className="input-field"
                required
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline h-4 w-4 mr-1" />
                Issue Description *
              </label>
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Describe the issue you're experiencing..."
                className="input-field resize-none"
                rows="4"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Conversation Preview */}
            {conversationHistory.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Conversation Summary ({conversationHistory.length} messages)
                </h3>
                <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                  {conversationHistory.slice(-3).map((msg, index) => (
                    <div key={index} className="mb-1">
                      <span className="font-medium">{msg.role}:</span> {msg.content.substring(0, 100)}
                      {msg.content.length > 100 && '...'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketModal; 