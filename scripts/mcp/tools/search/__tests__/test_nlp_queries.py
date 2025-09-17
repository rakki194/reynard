#!/usr/bin/env python3
"""
Tests for NLP Query Processing
=============================

Test natural language query processing and ripgrep syntax construction.
"""

import shutil
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

import pytest

from ..search_tools import SearchTools


class TestNLPQueryProcessing:
    """Test natural language query processing capabilities."""

    @pytest.fixture
    def temp_project(self):
        """Create a comprehensive temporary project structure for testing."""
        temp_dir = tempfile.mkdtemp()
        project_path = Path(temp_dir)

        # Create project structure
        (project_path / "src").mkdir()
        (project_path / "src" / "api").mkdir()
        (project_path / "src" / "models").mkdir()
        (project_path / "src" / "services").mkdir()
        (project_path / "src" / "utils").mkdir()
        (project_path / "tests").mkdir()
        (project_path / "tests" / "unit").mkdir()
        (project_path / "tests" / "integration").mkdir()
        (project_path / "docs").mkdir()
        (project_path / "scripts").mkdir()
        (project_path / "config").mkdir()
        (project_path / "migrations").mkdir()

        # Create backend API files
        (project_path / "src" / "api" / "users.py").write_text(
            """
from flask import Blueprint, request, jsonify
from src.models.user import User
from src.services.user_service import UserService
from src.utils.auth import require_auth
import logging

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

@users_bp.route('/users', methods=['GET'])
@require_auth
def get_users():
    '''Get all users from the database.'''
    try:
        users = UserService.get_all_users()
        return jsonify({'users': [user.to_dict() for user in users]})
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/users', methods=['POST'])
@require_auth
def create_user():
    '''Create a new user.'''
    try:
        data = request.get_json()
        user = UserService.create_user(data)
        return jsonify({'user': user.to_dict()}), 201
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return jsonify({'error': 'Invalid user data'}), 400

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    '''Get a specific user by ID.'''
    try:
        user = UserService.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user.to_dict()})
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500
"""
        )

        (project_path / "src" / "api" / "auth.py").write_text(
            """
from flask import Blueprint, request, jsonify
from src.services.auth_service import AuthService
from src.utils.jwt import generate_token, verify_token
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    '''Authenticate user and return JWT token.'''
    try:
        data = request.get_json()
        user = AuthService.authenticate_user(data['username'], data['password'])
        if user:
            token = generate_token(user.id)
            return jsonify({'token': token, 'user': user.to_dict()})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({'error': 'Authentication failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    '''Logout user and invalidate token.'''
    try:
        # In a real app, you'd invalidate the token
        return jsonify({'message': 'Logged out successfully'})
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        return jsonify({'error': 'Logout failed'}), 500
"""
        )

        # Create model files
        (project_path / "src" / "models" / "user.py").write_text(
            """
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import hashlib

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password_hash = self._hash_password(password)
    
    def _hash_password(self, password):
        '''Hash password using SHA-256.'''
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password):
        '''Verify password against hash.'''
        return self.password_hash == self._hash_password(password)
    
    def to_dict(self):
        '''Convert user to dictionary.'''
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
"""
        )

        (project_path / "src" / "models" / "database.py").write_text(
            """
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

Base = declarative_base()

class Database:
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
    
    def connect(self, database_url=None):
        '''Connect to database.'''
        if not database_url:
            database_url = os.getenv('DATABASE_URL', 'sqlite:///app.db')
        
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create all tables
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        '''Get database session.'''
        return self.SessionLocal()
    
    def close(self):
        '''Close database connection.'''
        if self.engine:
            self.engine.dispose()

# Global database instance
db = Database()
"""
        )

        # Create service files
        (project_path / "src" / "services" / "user_service.py").write_text(
            """
from src.models.user import User
from src.models.database import db
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    def get_all_users():
        '''Get all users from database.'''
        session = db.get_session()
        try:
            users = session.query(User).all()
            return users
        finally:
            session.close()
    
    @staticmethod
    def get_user_by_id(user_id):
        '''Get user by ID.'''
        session = db.get_session()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            return user
        finally:
            session.close()
    
    @staticmethod
    def create_user(user_data):
        '''Create new user.'''
        session = db.get_session()
        try:
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password']
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Error creating user: {e}")
            raise ValueError("User already exists")
        finally:
            session.close()
    
    @staticmethod
    def update_user(user_id, user_data):
        '''Update user.'''
        session = db.get_session()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            
            for key, value in user_data.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            
            session.commit()
            session.refresh(user)
            return user
        finally:
            session.close()
    
    @staticmethod
    def delete_user(user_id):
        '''Delete user.'''
        session = db.get_session()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            session.delete(user)
            session.commit()
            return True
        finally:
            session.close()
"""
        )

        (project_path / "src" / "services" / "auth_service.py").write_text(
            """
from src.models.user import User
from src.models.database import db
import logging

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def authenticate_user(username, password):
        '''Authenticate user with username and password.'''
        session = db.get_session()
        try:
            user = session.query(User).filter(User.username == username).first()
            if user and user.verify_password(password):
                return user
            return None
        finally:
            session.close()
    
    @staticmethod
    def get_user_by_token(token):
        '''Get user by JWT token.'''
        # In a real app, you'd decode the JWT token
        # For now, just return a mock user
        session = db.get_session()
        try:
            # This is a simplified version
            user = session.query(User).first()
            return user
        finally:
            session.close()
"""
        )

        # Create utility files
        (project_path / "src" / "utils" / "auth.py").write_text(
            """
from functools import wraps
from flask import request, jsonify
from src.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)

def require_auth(f):
    '''Decorator to require authentication.'''
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        user = AuthService.get_user_by_token(token)
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function
"""
        )

        (project_path / "src" / "utils" / "jwt.py").write_text(
            """
import jwt
import datetime
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def generate_token(user_id):
    '''Generate JWT token for user.'''
    try:
        payload = {
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        token = jwt.encode(payload, 'secret_key', algorithm='HS256')
        return token
    except Exception as e:
        logger.error(f"Error generating token: {e}")
        return None

def verify_token(token):
    '''Verify JWT token.'''
    try:
        payload = jwt.decode(token, 'secret_key', algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return None
    except jwt.InvalidTokenError:
        logger.error("Invalid token")
        return None
"""
        )

        # Create test files
        (project_path / "tests" / "unit" / "test_user_service.py").write_text(
            """
import pytest
from src.services.user_service import UserService
from src.models.user import User
from unittest.mock import Mock, patch

class TestUserService:
    def test_get_all_users(self):
        '''Test getting all users.'''
        with patch('src.services.user_service.db') as mock_db:
            mock_session = Mock()
            mock_db.get_session.return_value = mock_session
            mock_session.query.return_value.all.return_value = []
            
            users = UserService.get_all_users()
            assert users == []
    
    def test_get_user_by_id(self):
        '''Test getting user by ID.'''
        with patch('src.services.user_service.db') as mock_db:
            mock_session = Mock()
            mock_db.get_session.return_value = mock_session
            mock_user = Mock()
            mock_session.query.return_value.filter.return_value.first.return_value = mock_user
            
            user = UserService.get_user_by_id(1)
            assert user == mock_user
    
    def test_create_user(self):
        '''Test creating user.'''
        with patch('src.services.user_service.db') as mock_db:
            mock_session = Mock()
            mock_db.get_session.return_value = mock_session
            mock_user = Mock()
            mock_session.add.return_value = None
            mock_session.commit.return_value = None
            mock_session.refresh.return_value = None
            
            user_data = {
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
            
            user = UserService.create_user(user_data)
            assert user is not None
"""
        )

        (project_path / "tests" / "integration" / "test_api.py").write_text(
            """
import pytest
from src.api.users import users_bp
from src.api.auth import auth_bp
from flask import Flask
import json

@pytest.fixture
def app():
    '''Create test Flask app.'''
    app = Flask(__name__)
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.config['TESTING'] = True
    return app

def test_get_users_endpoint(app):
    '''Test GET /api/users endpoint.'''
    with app.test_client() as client:
        response = client.get('/api/users')
        assert response.status_code == 401  # No auth token
        
def test_create_user_endpoint(app):
    '''Test POST /api/users endpoint.'''
    with app.test_client() as client:
        response = client.post('/api/users', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        })
        assert response.status_code == 401  # No auth token
        
def test_login_endpoint(app):
    '''Test POST /api/login endpoint.'''
    with app.test_client() as client:
        response = client.post('/api/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        assert response.status_code == 500  # Database not connected
"""
        )

        # Create configuration files
        (project_path / "config" / "database.py").write_text(
            """
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class DatabaseConfig:
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL', 'sqlite:///app.db')
        self.engine = None
        self.SessionLocal = None
    
    def get_engine(self):
        '''Get database engine.'''
        if not self.engine:
            self.engine = create_engine(self.database_url)
        return self.engine
    
    def get_session(self):
        '''Get database session.'''
        if not self.SessionLocal:
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.get_engine())
        return self.SessionLocal()
    
    def init_db(self):
        '''Initialize database.'''
        from src.models.user import Base
        Base.metadata.create_all(bind=self.get_engine())

# Global database config
db_config = DatabaseConfig()
"""
        )

        (project_path / "config" / "app.py").write_text(
            """
import os
from flask import Flask
from src.api.users import users_bp
from src.api.auth import auth_bp
from config.database import db_config

def create_app():
    '''Create Flask application.'''
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['DATABASE_URL'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    
    # Initialize database
    db_config.init_db()
    
    # Register blueprints
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    return app
"""
        )

        # Create migration files
        (project_path / "migrations" / "001_create_users_table.py").write_text(
            """
from sqlalchemy import create_engine, text
import os

def upgrade():
    '''Create users table.'''
    database_url = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        '''))
        conn.commit()

def downgrade():
    '''Drop users table.'''
    database_url = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        conn.execute(text('DROP TABLE IF EXISTS users'))
        conn.commit()
"""
        )

        # Create documentation
        (project_path / "docs" / "API.md").write_text(
            """
# API Documentation

## Authentication

All API endpoints require authentication via JWT token in the Authorization header.

## Endpoints

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Authentication

- `POST /api/login` - Login user
- `POST /api/logout` - Logout user

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes.
"""
        )

        # Create ignored directories
        (project_path / "__pycache__").mkdir()
        (project_path / "__pycache__" / "main.pyc").write_text("compiled")
        (project_path / ".git").mkdir()
        (project_path / ".git" / "config").write_text("[core]")
        (project_path / "venv").mkdir()
        (project_path / "node_modules").mkdir()

        yield project_path

        # Cleanup
        shutil.rmtree(temp_dir)

    def test_backend_analysis_nlp_query(self, temp_project):
        """Test natural language query about backend analysis."""
        search_tools = SearchTools()

        # Test various NLP queries about the backend
        nlp_queries = [
            "What is the backend look like?",
            "How does the API work?",
            "Where are the database models?",
            "Show me the authentication system",
            "What endpoints are available?",
            "How is the database configured?",
            "What services are implemented?",
            "Show me the user management system",
            "How are errors handled?",
            "What dependencies are used?",
            "Show me the test files",
            "How is the application structured?",
            "What utilities are available?",
            "Show me the configuration files",
            "How are migrations handled?",
        ]

        for query in nlp_queries:
            result = search_tools.search_enhanced(
                query=query, project_root=str(temp_project), top_k=10
            )

            assert "results" in result
            assert "query" in result
            assert "total_results" in result
            assert "search_time" in result

            # Should return some results for each query
            assert result["total_results"] >= 0

            # Should not find files in ignored directories
            results = result["results"]
            file_paths = [r.get("file_path", "") for r in results]
            assert not any("__pycache__" in path for path in file_paths)
            assert not any(".git" in path for path in file_paths)
            assert not any("venv" in path for path in file_paths)
            assert not any("node_modules" in path for path in file_paths)

    def test_specific_backend_queries(self, temp_project):
        """Test specific backend-related queries."""
        search_tools = SearchTools()

        # Test API-related queries
        api_result = search_tools.search_enhanced(
            query="API endpoints and routes", project_root=str(temp_project), top_k=5
        )

        assert api_result["total_results"] > 0
        file_paths = [r.get("file_path", "") for r in api_result["results"]]
        assert any("users.py" in path for path in file_paths)
        assert any("auth.py" in path for path in file_paths)

        # Test database-related queries
        db_result = search_tools.search_enhanced(
            query="database models and configuration",
            project_root=str(temp_project),
            top_k=5,
        )

        assert db_result["total_results"] > 0
        file_paths = [r.get("file_path", "") for r in db_result["results"]]
        assert any("user.py" in path for path in file_paths)
        assert any("database.py" in path for path in file_paths)

        # Test authentication-related queries
        auth_result = search_tools.search_enhanced(
            query="authentication and authorization",
            project_root=str(temp_project),
            top_k=5,
        )

        assert auth_result["total_results"] > 0
        file_paths = [r.get("file_path", "") for r in auth_result["results"]]
        assert any("auth.py" in path for path in file_paths)
        assert any("jwt.py" in path for path in file_paths)

        # Test service-related queries
        service_result = search_tools.search_enhanced(
            query="business logic and services", project_root=str(temp_project), top_k=5
        )

        assert service_result["total_results"] > 0
        file_paths = [r.get("file_path", "") for r in service_result["results"]]
        assert any("user_service.py" in path for path in file_paths)
        assert any("auth_service.py" in path for path in file_paths)

        # Test test-related queries
        test_result = search_tools.search_enhanced(
            query="test files and testing", project_root=str(temp_project), top_k=5
        )

        assert test_result["total_results"] > 0
        file_paths = [r.get("file_path", "") for r in test_result["results"]]
        assert any("test_user_service.py" in path for path in file_paths)
        assert any("test_api.py" in path for path in file_paths)

    def test_ripgrep_syntax_construction(self, temp_project):
        """Test that ripgrep syntax is constructed correctly for various queries."""
        search_tools = SearchTools()

        # Test different types of searches
        test_cases = [
            {"query": "def ", "file_types": [".py"], "expected_pattern": "def "},
            {"query": "class ", "file_types": [".py"], "expected_pattern": "class "},
            {"query": "import ", "file_types": [".py"], "expected_pattern": "import "},
            {
                "query": "@app.route",
                "file_types": [".py"],
                "expected_pattern": "@app.route",
            },
            {"query": "TODO", "file_types": None, "expected_pattern": "TODO"},
            {"query": "FIXME", "file_types": None, "expected_pattern": "FIXME"},
        ]

        for test_case in test_cases:
            with patch("subprocess.run") as mock_subprocess:
                mock_subprocess.return_value = Mock(
                    returncode=0, stdout=b"test.py:1:test content\n", stderr=b""
                )

                result = search_tools.search_content(
                    query=test_case["query"],
                    file_types=test_case["file_types"],
                    directories=[str(temp_project)],
                )

                # Verify subprocess was called
                mock_subprocess.assert_called_once()
                call_args = mock_subprocess.call_args

                # Should include ripgrep command
                assert "rg" in call_args[0][0]

                # Should include the query pattern
                assert test_case["expected_pattern"] in call_args[0][0]

                # Should include file type filter if specified
                if test_case["file_types"]:
                    assert "--type" in call_args[0][0] or "--glob" in call_args[0][0]

    def test_code_pattern_search_syntax(self, temp_project):
        """Test that code pattern search syntax is constructed correctly."""
        search_tools = SearchTools()

        # Test different code patterns
        test_cases = [
            {"pattern_type": "function", "language": "py", "expected_pattern": "def "},
            {"pattern_type": "class", "language": "py", "expected_pattern": "class "},
            {"pattern_type": "import", "language": "py", "expected_pattern": "import "},
            {"pattern_type": "todo", "language": "py", "expected_pattern": "TODO"},
            {"pattern_type": "fixme", "language": "py", "expected_pattern": "FIXME"},
        ]

        for test_case in test_cases:
            with patch("subprocess.run") as mock_subprocess:
                mock_subprocess.return_value = Mock(
                    returncode=0, stdout=b"test.py:1:test content\n", stderr=b""
                )

                result = search_tools.search_code_patterns(
                    pattern_type=test_case["pattern_type"],
                    language=test_case["language"],
                    directories=[str(temp_project)],
                )

                # Verify subprocess was called
                mock_subprocess.assert_called_once()
                call_args = mock_subprocess.call_args

                # Should include ripgrep command
                assert "rg" in call_args[0][0]

                # Should include the expected pattern
                assert test_case["expected_pattern"] in call_args[0][0]

    def test_ignore_system_integration(self, temp_project):
        """Test that the ignore system works correctly with all search tools."""
        search_tools = SearchTools()

        # Test that ignored directories are not searched
        ignored_dirs = ["__pycache__", ".git", "venv", "node_modules"]

        for ignored_dir in ignored_dirs:
            # Create a file in the ignored directory
            ignored_file = temp_project / ignored_dir / "test_file.py"
            ignored_file.parent.mkdir(exist_ok=True)
            ignored_file.write_text("print('This should be ignored')")

            # Search for the content
            result = search_tools.search_content(
                query="This should be ignored", directories=[str(temp_project)]
            )

            # Should not find the file in ignored directory
            results = result["results"]
            file_paths = [r.get("file_path", "") for r in results]
            assert not any(ignored_dir in path for path in file_paths)

    def test_performance_with_large_project(self, temp_project):
        """Test search performance with a larger project structure."""
        search_tools = SearchTools()

        # Create more files to simulate a larger project
        for i in range(50):
            (temp_project / "src" / f"module_{i}.py").write_text(
                f"""
def function_{i}():
    '''Function {i} for testing.'''
    return {i}

class Class{i}:
    '''Class {i} for testing.'''
    def __init__(self):
        self.value = {i}
"""
            )

        # Test search performance
        import time

        start_time = time.time()

        result = search_tools.search_enhanced(
            query="function definition", project_root=str(temp_project), top_k=20
        )

        end_time = time.time()
        search_time = end_time - start_time

        # Should complete within reasonable time (less than 5 seconds)
        assert search_time < 5.0

        # Should find results
        assert result["total_results"] > 0

        # Should not find files in ignored directories
        results = result["results"]
        file_paths = [r.get("file_path", "") for r in results]
        assert not any("__pycache__" in path for path in file_paths)
        assert not any(".git" in path for path in file_paths)
        assert not any("venv" in path for path in file_paths)
        assert not any("node_modules" in path for path in file_paths)
