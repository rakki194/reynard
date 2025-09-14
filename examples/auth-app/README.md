# 🦊 Reynard Auth Demo App

A comprehensive authentication demonstration app built with the Reynard framework,
featuring PostgreSQL backend integration with the Gatekeeper authentication library.

## 🚀 Features

- **🔐 Complete Authentication**: Login, registration, and session management
- **🗄️ PostgreSQL Backend**: Persistent user storage with Gatekeeper library
- **🎨 Reynard UI**: Beautiful, responsive interface with Reynard components
- **🛡️ JWT Security**: Secure token-based authentication with refresh tokens
- **📱 Responsive Design**: Mobile-first design with modern UI/UX
- **⚡ Real-time Updates**: Live authentication state management

## 🏗️ Architecture

### Frontend (SolidJS + Reynard)

- **reynard-auth**: Authentication components and hooks
- **reynard-core**: Theme and notification system
- **reynard-components**: UI components
- **Vite**: Fast development server with hot reload

### Backend (FastAPI + Gatekeeper)

- **FastAPI**: Modern Python web framework
- **Gatekeeper**: Authentication and authorization library
- **PostgreSQL**: Persistent database storage
- **JWT**: Secure token management

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **PostgreSQL** 12+ (running locally)

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd /home/kade/runeset/reynard-auth-app
npm install
```

### 2. Database Setup

#### Install PostgreSQL (Arch Linux)

```bash
sudo pacman -S postgresql
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database and User

```bash
# Create database
sudo -u postgres createdb yipyap

# Create user
sudo -u postgres psql -c "CREATE USER yipyap WITH PASSWORD 'yipyap';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE yipyap TO yipyap;"
```

#### Initialize Database Schema

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Setup database and create initial users
python setup_database.py
```

### 3. Environment Configuration

Create a `.env` file (optional):

```bash
# Database
DATABASE_URL=postgresql://yipyap:yipyap@localhost:5432/yipyap

# Security
SECRET_KEY=your-secret-key-here-change-in-production
```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev:full
```

This will start:

- **Frontend**: <http://localhost:3001>
- **Backend**: <http://localhost:8000>
- **API Docs**: <http://localhost:8000/docs>

### Individual Services

#### Frontend Only

```bash
npm run dev
```

#### Backend Only

```bash
npm run backend
```

## 🧪 Testing the App

### Default Test Accounts

After running the database setup, you can use these accounts:

> _Admin User:_

- Username: `admin`
- Password: `Admin123!`
- Role: Administrator

> _Demo User:_

- Username: `demo`
- Password: `Demo123!`
- Role: Regular User

### Test Scenarios

1. **Registration**: Create a new account
2. **Login**: Authenticate with existing credentials
3. **Dashboard**: View user information and session details
4. **Logout**: End the current session
5. **Token Refresh**: Automatic token renewal

## 📁 Project Structure

```
reynard-auth-app/
├── src/                    # Frontend source code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── backend/               # Backend server
│   ├── main.py           # FastAPI application
│   └── requirements.txt  # Python dependencies
├── setup_database.py     # Database initialization script
├── package.json          # Node.js dependencies
├── vite.config.ts        # Vite configuration
└── README.md            # This file
```

## 🔧 Configuration

### Frontend Configuration

The app uses Reynard's AuthProvider with the following configuration:

```typescript
<AuthProvider
  config={{
    apiBaseUrl: "/api",
    autoRefresh: true,
    loginRedirectPath: "/dashboard",
  }}
  callbacks={{
    onLoginSuccess: (user) => console.log("Welcome:", user.username),
    onLogout: () => console.log("Goodbye!"),
    onSessionExpired: () => console.log("Session expired"),
  }}
>
```

### Backend Configuration

The FastAPI server is configured with:

- CORS enabled for localhost:3001
- PostgreSQL backend with Gatekeeper
- JWT token management
- Automatic database health checks

## 🛡️ Security Features

- **Password Hashing**: Argon2-based password security
- **JWT Tokens**: Secure access and refresh token system
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Comprehensive error management

## 🎨 UI/UX Features

- **Modern Design**: Glassmorphism and gradient backgrounds
- **Responsive Layout**: Mobile-first design approach
- **Theme Integration**: Reynard theme system
- **Loading States**: User feedback during operations
- **Error Handling**: Clear error messages and success notifications

## 🔍 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Current user info

### Administration

- `GET /api/auth/users` - List all users (admin only)

### System

- `GET /health` - Health check

## 🐛 Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL Status**:

   ```bash
   sudo systemctl status postgresql
   ```

2. **Verify Database Exists**:

   ```bash
   sudo -u postgres psql -l | grep yipyap
   ```

3. **Test Connection**:

   ```bash
   psql -h localhost -U yipyap -d yipyap
   ```

### Frontend Issues

1. **Clear Node Modules**:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Port Availability**:

   ```bash
   lsof -i :3001
   ```

### Backend Issues

1. **Install Dependencies**:

   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Check Python Path**:

   ```bash
   python -c "import sys; print(sys.path)"
   ```

## 🤝 Contributing

This is a demonstration app showcasing Reynard framework capabilities. For contributions to
the main Reynard framework, see the main repository.

## 📄 License

MIT License - see the main Reynard repository for details.

---

**Built with 🔐 for secure SolidJS applications** 🛡️🦊
