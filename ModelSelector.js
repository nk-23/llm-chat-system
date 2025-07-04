import React from 'react';
import { ChevronDown, Bot, Zap } from 'lucide-react';

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const models = [
    {
      id: 'azure',
      name: 'Azure OpenAI',
      description: 'GPT-3.5/4 via Azure',
      icon: Bot,
      color: 'text-blue-600'
    },
    {
      id: 'llama',
      name: 'Llama 2',
      description: 'Meta Llama-2-7b-chat',
      icon: Zap,
      color: 'text-orange-600'
    }
  ];

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="relative">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
      
      {/* Model Info */}
      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-3">
          {selectedModelData && (
            <>
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <selectedModelData.icon className={`h-4 w-4 ${selectedModelData.color}`} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{selectedModelData.name}</div>
                <div className="text-sm text-gray-600">{selectedModelData.description}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelSelector; 