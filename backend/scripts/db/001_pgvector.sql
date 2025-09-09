-- Enable pgvector extension
-- Idempotent: safe to run multiple times

CREATE EXTENSION IF NOT EXISTS vector;
