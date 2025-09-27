#!/bin/bash

# Reynard Error Demo Startup Script
# Starts both backend and frontend servers

echo "🦊 Starting Reynard Error Demo..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "   Please install Python 3 and try again."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js and try again."
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is required but not installed."
    echo "   Please install pnpm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install Python dependencies
#echo "📦 Installing Python dependencies..."
#cd backend
#if [[ -f "requirements.txt" ]; then
#    pip3 install -r requirements.txt
#    if [[ $? -ne 0 ]; then
#        echo "❌ Failed to install Python dependencies"
#        exit 1
#    fi
#    echo "✅ Python dependencies installed"
#else
#    echo "⚠️  No requirements.txt found, skipping Python dependencies"
#fi
#cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if ! pnpm install; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi
echo "✅ Node.js dependencies installed"
echo ""

# Start the application
echo "🚀 Starting Reynard Error Demo..."
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3002"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
pnpm run dev:full
