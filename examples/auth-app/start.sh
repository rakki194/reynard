#!/bin/bash

# Reynard Auth App Startup Script
echo "🦊 Starting Reynard Auth Demo App..."

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    sleep 2
fi

# Check if database exists
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw yipyap; then
    echo "📊 Database 'yipyap' not found. Creating it..."
    sudo -u postgres createdb yipyap
    sudo -u postgres psql -c "CREATE USER yipyap WITH PASSWORD 'yipyap';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE yipyap TO yipyap;"
fi

# Install Python dependencies if needed
if [ ! -d "backend/venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Setup database schema
echo "🔧 Setting up database schema..."
cd backend
source venv/bin/activate
cd ..
python setup_database.py

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "✅ Setup complete! Starting the application..."
echo "🚀 Frontend: http://localhost:3001"
echo "🚀 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start both frontend and backend
npm run dev:full


