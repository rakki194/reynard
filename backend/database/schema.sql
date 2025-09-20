-- Reynard ECS Database Schema
-- PostgreSQL schema for ECS world simulation system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table - Core agent information
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    spirit VARCHAR(100) NOT NULL,
    style VARCHAR(100) NOT NULL,
    generation INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent parents table - For lineage tracking
CREATE TABLE agent_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personality traits table
CREATE TABLE personality_traits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    trait_name VARCHAR(100) NOT NULL,
    trait_value DECIMAL(5,4) NOT NULL CHECK (trait_value >= 0 AND trait_value <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, trait_name)
);

-- Physical traits table
CREATE TABLE physical_traits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    trait_name VARCHAR(100) NOT NULL,
    trait_value DECIMAL(5,4) NOT NULL CHECK (trait_value >= 0 AND trait_value <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, trait_name)
);

-- Ability traits table
CREATE TABLE ability_traits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    trait_name VARCHAR(100) NOT NULL,
    trait_value DECIMAL(5,4) NOT NULL CHECK (trait_value >= 0 AND trait_value <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, trait_name)
);

-- Agent positions table - For spatial tracking
CREATE TABLE agent_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    x DECIMAL(10,2) DEFAULT 0.0,
    y DECIMAL(10,2) DEFAULT 0.0,
    target_x DECIMAL(10,2) DEFAULT 0.0,
    target_y DECIMAL(10,2) DEFAULT 0.0,
    velocity_x DECIMAL(10,2) DEFAULT 0.0,
    velocity_y DECIMAL(10,2) DEFAULT 0.0,
    movement_speed DECIMAL(10,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id)
);

-- Agent interactions table
CREATE TABLE agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL,
    message TEXT,
    energy_level DECIMAL(5,4) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent relationships table
CREATE TABLE agent_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent1_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    agent2_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    compatibility_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent1_id, agent2_id)
);

-- Agent memories table
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    memory_type VARCHAR(100) NOT NULL,
    memory_content TEXT NOT NULL,
    importance DECIMAL(5,4) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent achievements table
CREATE TABLE agent_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent specializations table
CREATE TABLE agent_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    proficiency DECIMAL(5,4) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, specialization)
);

-- Agent domain expertise table
CREATE TABLE agent_domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    expertise_level DECIMAL(5,4) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, domain)
);

-- Agent performance metrics table
CREATE TABLE agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent workflow preferences table
CREATE TABLE agent_workflow_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    preference_name VARCHAR(100) NOT NULL,
    preference_value BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, preference_name)
);

-- Create indexes for better performance
CREATE INDEX idx_agents_agent_id ON agents(agent_id);
CREATE INDEX idx_agents_spirit ON agents(spirit);
CREATE INDEX idx_agents_active ON agents(active);
CREATE INDEX idx_agents_created_at ON agents(created_at);

CREATE INDEX idx_personality_traits_agent_id ON personality_traits(agent_id);
CREATE INDEX idx_physical_traits_agent_id ON physical_traits(agent_id);
CREATE INDEX idx_ability_traits_agent_id ON ability_traits(agent_id);

CREATE INDEX idx_agent_positions_agent_id ON agent_positions(agent_id);
CREATE INDEX idx_agent_interactions_sender ON agent_interactions(sender_id);
CREATE INDEX idx_agent_interactions_receiver ON agent_interactions(receiver_id);
CREATE INDEX idx_agent_interactions_created_at ON agent_interactions(created_at);

CREATE INDEX idx_agent_relationships_agent1 ON agent_relationships(agent1_id);
CREATE INDEX idx_agent_relationships_agent2 ON agent_relationships(agent2_id);

CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX idx_agent_memories_type ON agent_memories(memory_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personality_traits_updated_at BEFORE UPDATE ON personality_traits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physical_traits_updated_at BEFORE UPDATE ON physical_traits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ability_traits_updated_at BEFORE UPDATE ON ability_traits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_positions_updated_at BEFORE UPDATE ON agent_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_relationships_updated_at BEFORE UPDATE ON agent_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_workflow_preferences_updated_at BEFORE UPDATE ON agent_workflow_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
