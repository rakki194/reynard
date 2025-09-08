"""
FastAPI Backend for Reynard
JWT-based authentication with proper signature verification
"""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, field_validator
import re

# Import caption generation API
from app.api.caption import router as caption_router

# Load environment variables
load_dotenv()

# Configuration
# 🐺 FIXED: Persistent JWT secret key management
def get_persistent_secret_key() -> str:
    """Get persistent JWT secret key with fallback to environment variable"""
    # First try environment variable
    env_secret = os.getenv("SECRET_KEY")
    if env_secret:
        return env_secret
    
    # Create persistent secret file
    secret_file = Path("./secrets/jwt_secret.key")
    secret_file.parent.mkdir(exist_ok=True, mode=0o700)
    
    if secret_file.exists():
        # Load existing secret
        return secret_file.read_text().strip()
    else:
        # Generate new persistent secret
        new_secret = secrets.token_urlsafe(64)  # 64 bytes for strong entropy
        secret_file.write_text(new_secret)
        secret_file.chmod(0o600)  # Secure file permissions
        return new_secret

SECRET_KEY = get_persistent_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing using PBKDF2 with HMAC-SHA256
PASSWORD_SALT_LENGTH = 32
PASSWORD_ITERATIONS = 100000

# Security scheme
security = HTTPBearer()

# FastAPI app
# 🐺 FIXED: Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Reynard API",
    description="Secure API backend for Reynard applications",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 🐺 FIXED: Secure CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
    ],  # Specific headers instead of wildcard
    expose_headers=["X-Total-Count"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"],  # Add your domains
)

# 🐺 FIXED: Add comprehensive security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add comprehensive security headers to all responses"""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://cdn.jsdelivr.net; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp
    
    # Strict Transport Security (only in production)
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Include caption generation API
app.include_router(caption_router, prefix="/api")


# 🐺 FIXED: Enhanced input validation and SQL injection prevention
def validate_input_security(input_string: str, field_name: str) -> str:
    """Validate input for security threats including SQL injection"""
    if not isinstance(input_string, str):
        raise ValueError(f"{field_name} must be a string")
    
    # 🐺 ENHANCED: Comprehensive SQL injection patterns with advanced detection
    sql_patterns = [
        # Basic SQL keywords (case-insensitive)
        r'\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b',
        
        # Comment patterns (all variations)
        r'(--|#|/\*|\*/)',
        
        # Logic operators (enhanced patterns)
        r'\b(or|and)\b.*=.*\b(or|and)\b',
        r'\b(or|and)\b.*\d+\s*=\s*\d+',
        r'\b(or|and)\b\s+\d+\s*=\s*\d+',
        r'\b(or|and)\b\s+[\'"]\s*=\s*[\'"]',
        r'\b(or|and)\b\s+[\'"]\d+[\'"]\s*=\s*[\'"]\d+[\'"]',
        r'\b(or|and)\b\s+[\'"]\d+[\'"]\s*=\s*\d+',
        r'\b(or|and)\b\s+\d+\s*=\s*[\'"]\d+[\'"]',
        r'\b(or|and)\b.*1.*=.*1',
        r'\b(or|and)\b.*\'1\'.*=.*\'1\'',
        
        # UNION attacks (all variations)
        r'union.*select',
        r'union.*all.*select',
        r'union\s+select',
        r'union\s+all\s+select',
        
        # Script injection
        r'script.*>',
        r'<\s*script',
        
        # Function calls (enhanced detection)
        r'\b(char|ascii|substring|concat|version|database|user|schema|length|count|sum|avg|max|min)\s*\(',
        r'\b(sleep|waitfor|benchmark|pg_sleep|delay)\s*\(',
        r'\b(load_file|into\s+outfile|into\s+dumpfile|load\s+data)\b',
        
        # Information schema (all variations)
        r'\binformation_schema\b',
        r'\bsys\.',
        r'\bmysql\.',
        r'\bpg_',
        r'\bsqlite_',
        
        # Time-based attacks (enhanced)
        r'\bwaitfor\s+delay\b',
        r'\bsleep\s*\(',
        r'\bbenchmark\s*\(',
        r'\bdelay\s*\(',
        
        # Error-based attacks (enhanced)
        r'\bextractvalue\s*\(',
        r'\bupdatexml\s*\(',
        r'\bexp\s*\(',
        r'\bfloor\s*\(',
        r'\brand\s*\(',
        
        # Boolean-based attacks
        r'\bif\s*\(',
        r'\bcase\s+when',
        r'\bwhen\s+.*\s+then',
        
        # Stacked queries (enhanced)
        r';\s*(select|insert|update|delete|drop|create|alter|exec|execute)',
        
        # Hex encoding attempts (enhanced)
        r'0x[0-9a-f]+',
        r'0X[0-9A-F]+',
        
        # String concatenation (enhanced)
        r'[\'"]\s*\+\s*[\'"]',
        r'\bconcat\s*\(',
        r'\bconcat_ws\s*\(',
        
        # Subqueries (enhanced)
        r'\(\s*select\s+',
        r'\(\s*insert\s+',
        r'\(\s*update\s+',
        r'\(\s*delete\s+',
        
        # Privilege escalation
        r'\bgrant\b',
        r'\brevoke\b',
        r'\bprivileges\b',
        r'\badmin\b',
        r'\broot\b',
        
        # Advanced obfuscation patterns
        r'\bchr\s*\(',
        r'\bascii\s*\(',
        r'\bord\s*\(',
        r'\bhex\s*\(',
        r'\bunhex\s*\(',
        r'\bbin\s*\(',
        r'\bunbin\s*\(',
        
        # Database-specific functions
        r'\buser\s*\(',
        r'\bdatabase\s*\(',
        r'\bversion\s*\(',
        r'\bconnection_id\s*\(',
        r'\blast_insert_id\s*\(',
        
        # Advanced injection patterns
        r'\bhaving\s+.*\s*=\s*\d+',
        r'\bgroup\s+by\s+.*\s*having',
        r'\border\s+by\s+.*\s*--',
        r'\blimit\s+.*\s*--',
        
        # Blind injection patterns
        r'\bexists\s*\(',
        r'\bnot\s+exists\s*\(',
        r'\bin\s*\(',
        r'\bnot\s+in\s*\(',
        
        # Time-based blind patterns
        r'\bif\s*\(.*,\s*sleep\s*\(',
        r'\bcase\s+when.*\s+then\s+sleep\s*\(',
        
        # Error-based blind patterns
        r'\bif\s*\(.*,\s*extractvalue\s*\(',
        r'\bif\s*\(.*,\s*updatexml\s*\(',
        
        # Stacked query patterns
        r';\s*drop\s+table',
        r';\s*truncate\s+table',
        r';\s*alter\s+table',
        r';\s*create\s+table',
        
        # Advanced comment patterns
        r'\*.*\*',
        r'--.*$',
        r'#.*$',
        
        # Whitespace obfuscation
        r'\s+select\s+',
        r'\s+union\s+',
        r'\s+from\s+',
        r'\s+where\s+',
        
        # Function obfuscation
        r'\bchar\s*\(\s*\d+\s*\)',
        r'\bascii\s*\(\s*[\'"]\w+[\'"]\s*\)',
        
        # String manipulation
        r'\bsubstr\s*\(',
        r'\bsubstring\s*\(',
        r'\bmid\s*\(',
        r'\bleft\s*\(',
        r'\bright\s*\(',
        
        # Mathematical functions
        r'\bfloor\s*\(',
        r'\bceil\s*\(',
        r'\bround\s*\(',
        r'\babs\s*\(',
        r'\bmod\s*\(',
        
        # Date/time functions
        r'\bnow\s*\(',
        r'\bcurrent_date\s*\(',
        r'\bcurrent_time\s*\(',
        r'\bcurrent_timestamp\s*\(',
        
        # System functions
        r'@@version',
        r'@@datadir',
        r'@@hostname',
        r'@@port',
        r'@@socket',
        
        # Advanced injection techniques
        r'\bprocedure\s+analyse\s*\(',
        r'\binto\s+outfile',
        r'\binto\s+dumpfile',
        r'\bload\s+file\s*\(',
        
        # Boolean-based blind injection
        r'\bif\s*\(\s*length\s*\(',
        r'\bif\s*\(\s*ascii\s*\(',
        r'\bif\s*\(\s*substr\s*\(',
        
        # Time-based blind injection
        r'\bif\s*\(\s*.*\s*,\s*sleep\s*\(\s*\d+\s*\)',
        r'\bcase\s+when\s+.*\s+then\s+sleep\s*\(\s*\d+\s*\)',
        
        # Error-based blind injection
        r'\bif\s*\(\s*.*\s*,\s*extractvalue\s*\(\s*1\s*,\s*concat\s*\(',
        r'\bif\s*\(\s*.*\s*,\s*updatexml\s*\(\s*1\s*,\s*concat\s*\(',
    ]
    
    for pattern in sql_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Invalid characters detected in {field_name}")
    
    # 🐺 ENHANCED: Advanced obfuscation detection
    obfuscation_patterns = [
        # Comment obfuscation
        r'/\*.*?\*/',
        r'--.*$',
        r'#.*$',
        
        # String splitting and concatenation
        r'[\'"]\s*\+\s*[\'"]',
        r'\bconcat\s*\(',
        r'\bconcat_ws\s*\(',
        
        # Function obfuscation
        r'\bchar\s*\(',
        r'\bchr\s*\(',
        r'\bascii\s*\(',
        r'\bord\s*\(',
        
        # Hex obfuscation
        r'0x[0-9a-f]+',
        r'0X[0-9A-F]+',
        
        # Unicode obfuscation
        r'\\u[0-9a-f]{4}',
        r'\\x[0-9a-f]{2}',
        
        # Whitespace obfuscation
        r'\s+select\s+',
        r'\s+union\s+',
        r'\s+from\s+',
        r'\s+where\s+',
        r'\s+and\s+',
        r'\s+or\s+',
        
        # Tab and newline obfuscation
        r'\t',
        r'\n',
        r'\r',
        
        # Multiple consecutive spaces
        r'\s{3,}',
        
        # Null byte injection
        r'\0',
        
        # Control characters
        r'[\x00-\x1f\x7f-\x9f]',
        
        # Advanced encoding
        r'%[0-9a-f]{2}',
        r'&[a-z]+;',
        
        # SQL function obfuscation
        r'\bif\s*\(',
        r'\bcase\s+when',
        r'\bwhen\s+.*\s+then',
        
        # Mathematical obfuscation
        r'\bfloor\s*\(',
        r'\bceil\s*\(',
        r'\bround\s*\(',
        r'\babs\s*\(',
        r'\bmod\s*\(',
        
        # String manipulation obfuscation
        r'\bsubstr\s*\(',
        r'\bsubstring\s*\(',
        r'\bmid\s*\(',
        r'\bleft\s*\(',
        r'\bright\s*\(',
        
        # Date/time obfuscation
        r'\bnow\s*\(',
        r'\bcurrent_date\s*\(',
        r'\bcurrent_time\s*\(',
        r'\bcurrent_timestamp\s*\(',
        
        # System variable obfuscation
        r'@@version',
        r'@@datadir',
        r'@@hostname',
        r'@@port',
        r'@@socket',
    ]
    
    for pattern in obfuscation_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Invalid characters detected in {field_name}")
    
    # XSS patterns
    xss_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
    ]
    
    for pattern in xss_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Invalid characters detected in {field_name}")
    
    # Path traversal patterns
    if '..' in input_string or '~' in input_string:
        raise ValueError(f"Invalid characters detected in {field_name}")
    
    # Length validation
    if len(input_string) > 1000:
        raise ValueError(f"{field_name} is too long")
    
    return input_string.strip()

# Pydantic models with enhanced validation
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v or len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return validate_input_security(v, 'username')
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long')
        return validate_input_security(v, 'password')
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        return validate_input_security(str(v), 'email')


class UserLogin(BaseModel):
    username: str
    password: str
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        return validate_input_security(v, 'username')
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        return validate_input_security(v, 'password')


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# In-memory user storage (replace with database in production)
users_db: Dict[str, Dict[str, Any]] = {}
refresh_tokens_db: Dict[str, str] = {}


def get_password_hash(password: str) -> str:
    """Hash a password using PBKDF2 with HMAC-SHA256"""
    salt = secrets.token_bytes(PASSWORD_SALT_LENGTH)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    # Store salt and hash together
    return salt.hex() + ":" + password_hash.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt_hex, password_hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        stored_hash = bytes.fromhex(password_hash_hex)

        # Hash the provided password with the same salt
        password_hash = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), salt, PASSWORD_ITERATIONS
        )

        # Use constant-time comparison to prevent timing attacks
        return hmac.compare_digest(stored_hash, password_hash)
    except (ValueError, IndexError):
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT refresh token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type_from_payload: str = payload.get("type")

        if username is None or token_type_from_payload != token_type:
            return None

        token_data = TokenData(username=username)
        return token_data
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """Get the current authenticated user"""
    token = credentials.credentials
    token_data = verify_token(token, "access")

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = users_db.get(token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get the current active user"""
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


# Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Reynard API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


@app.post("/api/auth/register", response_model=UserResponse)
@limiter.limit("5/minute")  # 🐺 FIXED: Rate limit registration attempts
async def register(request: Request, user: UserCreate):
    """Register a new user"""
    try:
        if user.username in users_db:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed",  # Generic error message
            )

        # Check if email is already registered
        for existing_user in users_db.values():
            if existing_user["email"] == user.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Registration failed",  # Generic error message
                )
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error for debugging but don't expose it
        print(f"Registration error: {e}")  # In production, use proper logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

    # Create user
    user_id = len(users_db) + 1
    hashed_password = get_password_hash(user.password)

    users_db[user.username] = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }

    return UserResponse(
        id=user_id,
        username=user.username,
        email=user.email,
        is_active=True,
        created_at=users_db[user.username]["created_at"],
    )


@app.post("/api/auth/login", response_model=Token)
@limiter.limit("10/minute")  # 🐺 FIXED: Rate limit login attempts
async def login(request: Request, user_credentials: UserLogin):
    """Login and get access token"""
    user = users_db.get(user_credentials.username)

    if not user or not verify_password(
        user_credentials.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )

    # Store refresh token
    refresh_tokens_db[user["username"]] = refresh_token

    return Token(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )


@app.post("/api/auth/refresh", response_model=Token)
@limiter.limit("20/minute")  # 🐺 FIXED: Rate limit token refresh
async def refresh_token(request: Request, refresh_request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    token_data = verify_token(refresh_request.refresh_token, "refresh")

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = users_db.get(token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if refresh token matches stored one
    stored_refresh_token = refresh_tokens_db.get(token_data.username)
    if stored_refresh_token != request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )

    # Update stored refresh token
    refresh_tokens_db[user["username"]] = new_refresh_token

    return Token(
        access_token=access_token, refresh_token=new_refresh_token, token_type="bearer"
    )


@app.post("/api/auth/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Logout and invalidate refresh token"""
    # Remove refresh token
    if current_user["username"] in refresh_tokens_db:
        del refresh_tokens_db[current_user["username"]]

    return {"message": "Successfully logged out"}


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
    )


@app.get("/api/protected")
async def protected_route(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
):
    """Protected route that requires authentication"""
    return {
        "message": f"Hello {current_user['username']}!",
        "user_id": current_user["id"],
        "timestamp": datetime.utcnow(),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
