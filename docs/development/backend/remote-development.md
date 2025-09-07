# Remote Backend Development

This guide explains how to run the frontend locally while connecting to a backend running on a remote machine.

## Overview

The yipyap frontend can be configured to connect to a backend running on a different machine (e.g., over SSH). This is useful for development scenarios where you want to:

- Run the frontend on your local machine for fast development
- Connect to a powerful remote machine for backend processing
- Share backend resources across multiple developers

## Quick Start

### Method 1: Using the Development Script

1. Make sure your backend is running on the remote machine (e.g., `otter_den`)
2. Run the development script:

```bash
# Using default values (otter_den:7000)
./scripts/dev-remote.sh

# Or specify custom host and port
./scripts/dev-remote.sh your-remote-host 8000
```

### Method 2: Using Environment Variables

1. Create a `.env.local` file in the project root:

    ```bash
    # Copy the example file
    cp env-remote.example .env.local

    # Edit the file to match your remote backend
    VITE_API_BASE_URL=http://otter_den:7000
    DEV_PORT=5173
    NODE_ENV=development
    ```

2. Start the development server:

    ```bash
    npm run dev
    ```

### Method 3: Direct Command Line

```bash
VITE_API_BASE_URL=http://otter_den:7000 npm run dev
```

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: The URL of your remote backend (e.g., `http://otter_den:7000`)
- `DEV_PORT`: The port for the local Vite development server (default: 5173)
- `NODE_ENV`: Set to `development` for development mode

### Network Requirements

1. **SSH Access**: Ensure you can SSH to your remote machine
2. **Port Accessibility**: The backend port must be accessible from your local machine
3. **Firewall**: Configure firewalls to allow connections to the backend port

### SSH Tunnel Setup (Optional)

If direct network access isn't available, you can use SSH tunneling:

```bash
# Create SSH tunnel to forward remote port to local
ssh -L 7000:localhost:7000 otter_den

# Then use localhost in your configuration
VITE_API_BASE_URL=http://localhost:7000 npm run dev
```

## Troubleshooting

### Connection Issues

1. **Check SSH connectivity**:

   ```bash
   ssh otter_den
   ```

2. **Test backend accessibility**:

   ```bash
   curl http://otter_den:7000/api/health
   ```

3. **Verify firewall settings** on the remote machine

### CORS Issues

If you encounter CORS errors, ensure the backend is configured to accept requests from your local development server. The backend should allow requests from `http://localhost:5173`.

### Performance Considerations

- Network latency may affect API response times
- Large file uploads/downloads will be slower over network
- Consider using SSH tunneling for better performance in some cases

## Development Workflow

1. **Backend Changes**: Make changes on the remote machine and restart the backend
2. **Frontend Changes**: Make changes locally and see them immediately with hot reload
3. **API Testing**: All API calls will go through the proxy to your remote backend

## Security Notes

- Ensure your remote backend is properly secured
- Use SSH keys for authentication
- Consider using VPN or SSH tunneling for sensitive development
- Don't expose development backends to the public internet
