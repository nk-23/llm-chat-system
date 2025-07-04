-- LLM Chat System Database Schema
-- Supports PostgreSQL, MySQL, and SQLite

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    model_used VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    model_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    issue TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER REFERENCES users(id),
    conversation_id INTEGER REFERENCES conversations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Model configurations table
CREATE TABLE model_configs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    messages_sent INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table (encrypted)
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_analytics_date_model ON analytics(date, model_name);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_configs_updated_at BEFORE UPDATE ON model_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default model configurations
INSERT INTO model_configs (model_name, provider, config) VALUES
('azure-openai', 'azure', '{"maxTokens": 512, "temperature": 0.7, "systemPrompt": "You are a helpful tech support assistant."}'),
('llama-2-7b-chat', 'huggingface', '{"maxLength": 2048, "temperature": 0.7, "topP": 0.9, "doSample": true}'),
('gpt-4', 'openai', '{"maxTokens": 1000, "temperature": 0.7, "systemPrompt": "You are a helpful tech support assistant."}'),
('claude-3', 'anthropic', '{"maxTokens": 1000, "temperature": 0.7, "systemPrompt": "You are a helpful tech support assistant."}');

-- Insert default admin user
INSERT INTO users (email, name, role) VALUES
('admin@llmchat.com', 'System Administrator', 'admin'); 