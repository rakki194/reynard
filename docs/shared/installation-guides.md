# Shared Installation Guides

_Standardized installation procedures for Reynard packages and services_

## Frontend Package Installation

### Core Packages

```bash
# Install core Reynard packages
pnpm install reynard-core solid-js

# Install additional packages as needed
pnpm install reynard-components reynard-chat reynard-rag reynard-auth

# For specific features
pnpm install reynard-annotating reynard-caption  # Caption generation
pnpm install reynard-charts reynard-3d          # Data visualization
pnpm install reynard-gallery reynard-file-processing  # File management
```

### Development Dependencies

```bash
# Standard development setup
pnpm install -D vite vite-plugin-solid typescript @types/node

# Testing dependencies
pnpm install -D vitest @solidjs/testing-library jsdom

# Linting dependencies
pnpm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Backend Service Installation

### Python Environment Setup

```bash
# Create virtual environment
python -m venv ~/venv
source ~/venv/bin/activate  # Linux/macOS
# or
~/venv/Scripts/activate     # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

### Database Setup

```bash
# PostgreSQL with pgvector
sudo apt-get install postgresql postgresql-contrib
# Install pgvector extension (see pgvector documentation)

# Create database
createdb reynard_rag
```

### Service Dependencies

```bash
# Ollama (for LLM services)
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
ollama pull llama3.1
ollama pull mxbai-embed-large

# FFmpeg (for audio processing)
sudo apt-get install ffmpeg  # Ubuntu/Debian
brew install ffmpeg          # macOS
# Download from https://ffmpeg.org/download.html  # Windows
```

## Project Setup

### New Reynard Application

```bash
# Create new project
mkdir my-reynard-app
cd my-reynard-app

# Initialize package.json
pnpm init

# Install dependencies
pnpm install reynard-core reynard-components solid-js @solidjs/router
pnpm install -D vite vite-plugin-solid typescript @types/node

# Create basic structure
mkdir src
touch src/main.tsx src/App.tsx src/index.html
```

### Using Reynard Test App

```bash
# Navigate to test app
cd reynard-test-app

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Environment Configuration

### Frontend Environment

```bash
# Copy environment template
cp .env.example .env

# Update with your settings
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_DEBUG=true
```

### Backend Environment

```bash
# Copy configuration template
cp backend_config_example.env .env

# Update database and service URLs
PG_DSN=postgresql://username:password@localhost:5432/reynard_rag
OLLAMA_BASE_URL=http://localhost:11434
RAG_ENABLED=true
TTS_ENABLED=true
```

## Verification

### Frontend Setup

```bash
# Start development server
pnpm run dev

# Verify at http://localhost:3001
# Should see Reynard application running
```

### Backend Setup

```bash
# Start FastAPI server
python main.py

# Verify at http://localhost:8000/api/docs
# Should see API documentation
```

### Service Health Checks

```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Check database
psql reynard_rag -c "SELECT version();"

# Check pgvector
psql reynard_rag -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

## Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check what's using port 3001
lsof -i :3001

# Use different port
pnpm run dev -- --port 3002
```

#### Python Environment Issues

```bash
# Recreate virtual environment
rm -rf ~/venv
python -m venv ~/venv
source ~/venv/bin/activate
pip install -r requirements.txt
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
psql -h localhost -U username -d reynard_rag
```

#### Ollama Service Issues

```bash
# Restart Ollama
pkill ollama
ollama serve

# Pull required models
ollama pull llama3.1
ollama pull mxbai-embed-large
```

## Cross-References

- [Configuration Examples](./configuration-examples.md)
- [Quick Start Guide](../quickstart.md)
- [Backend Environment Configuration](../development/backend/environment-configuration.md)
- [Frontend Development Setup](../development/frontend/composables.md)
