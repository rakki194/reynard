#!/bin/bash
# 🦊 Reynard Auth Demo App Startup Script - RBAC Integrated

set -e

echo "🦊 Starting Reynard Auth Demo App with RBAC Integration..."
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Check if PostgreSQL is running
print_status "🔍 Checking PostgreSQL status..."
if ! systemctl is-active --quiet postgresql; then
    print_warning "PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    if [ $? -eq 0 ]; then
        print_success "✅ PostgreSQL started successfully"
    else
        print_error "❌ Failed to start PostgreSQL"
        exit 1
    fi
else
    print_success "✅ PostgreSQL is running"
fi

# Create database if it doesn't exist
print_status "📊 Setting up database 'reynard_auth_demo'..."
sudo -u postgres psql -c "CREATE DATABASE reynard_auth_demo;" 2>/dev/null || print_warning "Database 'reynard_auth_demo' already exists or creation failed"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE reynard_auth_demo TO reynard;" 2>/dev/null || print_warning "Could not grant privileges (user may not exist)"

print_success "✅ Database setup complete"

# Set up Python virtual environment
print_status "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "✅ Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate
print_success "✅ Virtual environment activated"

# Install Python dependencies
print_status "📦 Installing Python dependencies..."
pip install -q -r backend/requirements.txt
print_success "✅ Python dependencies installed"

# Set up database and create demo users
print_status "🔐 Setting up database with RBAC and demo users..."
python setup_database.py
if [ $? -eq 0 ]; then
    print_success "✅ Database setup with RBAC complete"
else
    print_error "❌ Database setup failed"
    exit 1
fi

# Install Node.js dependencies
print_status "📦 Installing Node.js dependencies..."
npm install --silent
print_success "✅ Node.js dependencies installed"

# Start the application
print_status "🚀 Starting Reynard Auth Demo App..."
echo ""
echo "============================================================"
echo "🦊 Reynard Auth Demo App - RBAC Integrated"
echo "============================================================"
echo ""
echo "🔐 Demo Credentials:"
echo "   Admin:     admin / Admin123!"
echo "   Moderator: moderator / Moderator123!"
echo "   User:      user / User123!"
echo "   Guest:     guest / Guest123!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:  http://localhost:3001"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "🔐 RBAC Features:"
echo "   ✅ Role-based access control"
echo "   ✅ Permission management"
echo "   ✅ JWT token authentication"
echo "   ✅ Audit logging"
echo "   ✅ Demo users with different roles"
echo ""
echo "============================================================"
echo ""

# Start both frontend and backend
print_status "Starting frontend and backend services..."

# Start backend in background
print_status "🔧 Starting backend server..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
print_status "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    print_status "🧹 Cleaning up..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    print_success "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_success "🎉 Reynard Auth Demo App started successfully!"
print_status "Press Ctrl+C to stop the application"

# Wait for processes
wait