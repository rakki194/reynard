# Nginx Configuration for Reynard

This directory contains the organized nginx configuration files for the Reynard project, optimized for SolidJS frontend
and FastAPI backend.

## Directory Structure

```text
nginx/
├── nginx.conf                    # Main nginx configuration (2025 optimized)
├── dev/                          # Development configurations
│   └── reynard-dev.conf         # Development server config
├── prod/                         # Production configurations
│   ├── reynard-prod.conf        # Full production server config
│   └── frontend-only.conf       # Frontend-only Docker config
└── README.md                     # This file
```

## Configuration Files

### Main Configuration

- **`nginx.conf`** - Main nginx configuration with 2025 best practices:
  - Optimized worker processes and connections
  - Enhanced gzip compression
  - Rate limiting and security headers
  - Upstream backend configuration
  - Caching settings

### Development

- **`dev/reynard-dev.conf`** - Development server configuration:
  - Hot reloading support for Vite/SolidJS
  - Relaxed CORS for development
  - Debug logging enabled
  - WebSocket support for HMR
  - API proxy to FastAPI backend

### Production

- **`prod/reynard-prod.conf`** - Full production server configuration:
  - Static file serving with aggressive caching
  - Rate limiting and connection limits
  - API caching and optimization
  - Security headers and file access controls
  - SSL/HTTPS support (commented out)

- **`prod/frontend-only.conf`** - Frontend-only Docker configuration:
  - Optimized for serving static SolidJS files
  - Service worker and manifest support
  - Static asset caching
  - Security headers

## Usage

### Development

1. **Using Docker Compose:**

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Local Development Setup:**

   ```bash
   # Start development servers using the dev server manager
   dev-server start frontend
   dev-server start backend
   ```

### Production

1. **Docker Deployment:**

   ```bash
   docker-compose -f docker-compose.production.yml up
   ```

2. **Manual Server Setup (Arch Linux):**

   ```bash
   # Configure nginx and start development servers
   sudo systemctl enable nginx
   sudo systemctl start nginx
   dev-server start frontend --detached
   dev-server start backend --detached
   ```

## Features

### 2025 Optimizations

- **Performance:**
  - Optimized worker processes and connections
  - Enhanced gzip compression with modern file types
  - Brotli compression support (if available)
  - Aggressive static file caching
  - API response caching

- **Security:**
  - Rate limiting for different endpoint types
  - Connection limiting per IP and server
  - Modern security headers
  - File access controls
  - SSL/TLS best practices

- **Monitoring:**
  - Enhanced logging format with timing metrics
  - Cache status headers
  - Health check endpoints
  - Access and error logging

### SolidJS Integration

- **SPA Routing:** Proper fallback to `index.html` for client-side routing
- **Hot Module Replacement:** WebSocket support for development
- **Static Assets:** Optimized caching for JS, CSS, and media files
- **Service Worker:** Proper caching headers for PWA features

### FastAPI Integration

- **API Proxying:** Clean `/api/` route proxying to FastAPI backend
- **WebSocket Support:** Real-time features support
- **Authentication:** Stricter rate limiting for auth endpoints
- **File Uploads:** Optimized handling for file upload endpoints
- **Caching:** Intelligent API response caching

## Environment Variables

The configurations support the following environment variables:

- `DOMAIN` - Your production domain name
- `SSL_EMAIL` - Email for Let's Encrypt certificates
- `JWT_SECRET_KEY` - JWT secret for authentication
- `REDIS_PASSWORD` - Redis password for session storage
- `POSTGRES_*` - PostgreSQL connection details

## Security Considerations

- Rate limiting prevents abuse
- Security headers protect against common attacks
- File access controls prevent sensitive file exposure
- SSL/TLS configuration follows 2025 best practices
- CORS policies are environment-appropriate

## Performance Tuning

- Static files are cached for 1 year with immutable headers
- API responses are cached with appropriate TTL
- Gzip compression reduces bandwidth usage
- Connection pooling optimizes backend communication
- Worker processes are auto-scaled based on CPU cores

## Troubleshooting

### Common Issues

1. **502 Bad Gateway:** Check if FastAPI backend is running on port 8000
2. **CORS Errors:** Verify CORS headers in development configuration
3. **Static Files Not Loading:** Check file paths and permissions
4. **SSL Issues:** Ensure certificates are properly configured

### Logs

- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`
- Development logs: `/var/log/nginx/reynard-dev.*.log`

### Testing Configuration

```bash
# Test nginx configuration
nginx -t

# Reload configuration
nginx -s reload

# Check status
systemctl status nginx
```

## Migration from Old Structure

The old nginx files have been removed and replaced with this organized structure:

- `reynard.conf` → `dev/reynard-dev.conf`
- `reynard.production.conf` → `prod/reynard-prod.conf`
- `frontend.production.conf` → `prod/frontend-only.conf`
- `nginx.production.conf` → `nginx.conf` (main config)
- `complete.production.conf` → Removed (redundant)

All docker-compose files and setup scripts have been updated to use the new structure.
