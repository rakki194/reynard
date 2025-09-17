"""
Gunicorn Production Configuration for Reynard Backend

This configuration optimizes Gunicorn for production deployment with:
- Optimal worker processes based on CPU cores
- Uvicorn worker class for async FastAPI support
- Proper timeouts and keepalive settings
- Memory leak prevention with worker recycling
- Comprehensive logging configuration
- Security settings for production environment
"""

import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "reynard-backend"

# Server mechanics
daemon = False
pidfile = "/var/run/gunicorn.pid"
user = "reynard"
group = "reynard"
tmp_upload_dir = None

# Preload application for better performance
preload_app = True

# SSL (uncomment and configure if needed)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Environment variables
raw_env = [
    "ENVIRONMENT=production",
    "DEBUG=false",
]
