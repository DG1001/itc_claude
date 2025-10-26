# Development Environment Guide for AI Agents

This document describes the development environment for AI agents working on projects in the XaresAICoder setup.

## Environment Overview

We use a cloud-based development environment based on the **XaresAICoder** project (https://github.com/DG1001/XaresAICoder). This environment provides:

- **Docker containerized workspace**: Each project runs in an isolated Docker container with configurable resources (1-16GB RAM, 1-8 CPU cores)
- **VS Code Server**: Browser-based Visual Studio Code interface (code-server) for development
- **Automatic subdomain-based port proxying**: Services are automatically accessible via subdomains
- **Sudo-enabled sandbox**: Full system-level package installation capabilities
- **Network isolation**: Containers are isolated from each other for security
- **Optional GPU passthrough**: For ML/AI workloads when needed

### Deployment Options

XaresAICoder can be deployed in multiple configurations:

1. **Localhost deployment** (e.g., `http://localhost` or `http://projectid-port.localhost`)
   - Easiest setup for local development
   - Full VS Code Server feature support with HTTP
   - No HTTPS required

2. **Remote server deployment** (e.g., `https://your-server.com`)
   - **HTTPS is typically required** for remote access
   - Enables team collaboration and remote work
   - Full VS Code Server feature support with HTTPS

3. **Intranet server deployment** (e.g., `http://coder.internal.company.com:8000`)
   - Can work with HTTP within trusted networks
   - May include port numbers in the base URL
   - Example workspace URL: `http://8871e09a-3f86-43e0-8d00-04b3fe9c0fe5.coder.internal.meiluft.com:8000/?folder=/workspace`
   - **Minor VS Code Server limitations**: Some features require HTTPS or localhost
   - Examples of affected features: Clipboard API, certain browser security features
   - Most development functionality remains fully operational

## Key Environment Characteristics

### 1. Containerized Development
- Each project runs in a dedicated Docker container
- The container provides a complete development environment
- File system access to your project and workspace

### 2. Subdomain-Based Port Proxying System
- The container can run services on various ports
- **Ports are automatically proxied to unique subdomain URLs** using the pattern: `[projectid]-[port].[domain]` (may include base port)
- Common examples based on deployment:
  - **Localhost**: `http://[projectid]-5000.localhost/`
  - **Remote server**: `https://[projectid]-5000.your-server.com/`
  - **Intranet with base port**: `http://[projectid]-5000.coder.internal.company.com:8000/`
- Framework examples (pattern varies by deployment):
  - Flask/Python service on port 5000
  - React/Node.js service on port 3000
  - Spring Boot service on port 8080
- This subdomain-based routing is automatic and requires no manual configuration
- **The projectid is a unique identifier for your workspace/container** (often a UUID in production deployments)

### 3. Service Binding Requirements
- **CRITICAL**: Services MUST bind to `0.0.0.0` (not `localhost` or `127.0.0.1`)
- This is **REQUIRED** for external access through the subdomain proxy system
- Binding to `localhost` will make services inaccessible from outside the container
- Common examples:
  - Flask: `flask run --host=0.0.0.0 --port=5000`
  - Python HTTP server: `python -m http.server --bind 0.0.0.0 8000`
  - Node.js/Express: `app.listen(3000, '0.0.0.0')`
  - Django: `python manage.py runserver 0.0.0.0:8000`
  - Vite/React dev server: `vite --host 0.0.0.0 --port 3000`

### 4. Cross-Service Communication
- When services need to communicate internally within the container, use `localhost`
- When services need to be accessible from the external proxy, bind to `0.0.0.0`
- For accessing other services from frontend apps: Use the dynamically constructed URLs or proxy configuration

### 5. Package Management & Sandbox Capabilities
- **Sudo access is available**: You can install system-level packages without restrictions
- System packages: `sudo apt-get update && sudo apt-get install package-name`
- Language-specific packages: Use standard package managers (pip, npm, cargo, etc.) without sudo
- The sandbox environment is fully functional with root privileges for installations
- Examples:
  ```bash
  # System dependencies
  sudo apt-get install postgresql-client redis-tools

  # Python packages
  pip install flask pandas numpy

  # Node.js packages
  npm install express react vue
  ```

### 6. Process Management
- Start background services using `&` or background process tools
- Use `pkill` or `kill` to stop processes when needed
- Be mindful of port conflicts when starting multiple services

### 7. File System Access
- Full read/write access to the project directory
- Access to system directories where appropriate
- Use absolute paths when working with file system operations

## Common Patterns for AI Agents

### Starting Services
```bash
# ALWAYS bind to 0.0.0.0 for external access through the proxy
python -m flask run --host=0.0.0.0 --port=5000
# Service will be accessible at http://[projectid]-5000.localhost

# React/Vite development server
npm run dev -- --host 0.0.0.0 --port 3000
# Accessible at http://[projectid]-3000.localhost

# Django development server
python manage.py runserver 0.0.0.0:8000
# Accessible at http://[projectid]-8000.localhost
```

### Installing Dependencies
```bash
# System dependencies with sudo
sudo apt-get update && sudo apt-get install package-name

# Language-specific packages normally
pip install package-name
npm install package-name
```

### Frontend-to-Backend Communication
When frontend applications need to communicate with backend services running on different ports:

**Option 1: Dynamic URL Construction (Recommended)**
```javascript
// Frontend on port 3000, backend on port 5000
// Replace the port in the subdomain pattern
const backendUrl = window.location.origin.replace(/-3000\./, '-5000.');
fetch(`${backendUrl}/api/data`);

// Or construct from scratch (handles base ports automatically)
const hostname = window.location.hostname; // e.g., "projectid-3000.localhost" or "uuid-3000.coder.internal.company.com"
const projectId = hostname.split('-')[0]; // Extract project/workspace ID
const protocol = window.location.protocol; // "http:" or "https:"
const basePort = window.location.port; // May be empty, "8000", etc.
const domain = hostname.substring(hostname.indexOf('.') + 1).replace(/-3000/, ''); // Extract base domain
const backendUrl = `${protocol}//${projectId}-5000.${domain}${basePort ? ':' + basePort : ''}`;
fetch(`${backendUrl}/api/data`);
```

**Option 2: Environment Variables**
```bash
# Set during build or runtime
REACT_APP_API_URL=http://[projectid]-5000.localhost
VITE_API_URL=http://[projectid]-5000.localhost
```

**Option 3: Vite/Webpack Proxy (Development Only)**
```javascript
// vite.config.js
export default {
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'  // Internal container communication
    }
  }
}
```

## Troubleshooting

- **Service not accessible externally**: Check that it's bound to `0.0.0.0`, not `localhost`
- **Cross-service communication failing**: Verify internal communication uses `localhost`
- **Dependency installation failing**: Try using `sudo` for system packages
- **Port conflicts**: Use different ports or stop conflicting processes first

## Best Practices for AI Agents

1. **Always bind to 0.0.0.0**: Services must bind to `0.0.0.0` for proper subdomain proxying
2. **Remember the subdomain pattern**: Services are accessible at `[projectid]-[port].localhost`
3. **Use sudo freely**: System package installation with sudo is fully supported in the sandbox
4. **Internal vs external communication**:
   - Use `localhost` for inter-process communication within the container
   - Use `0.0.0.0` binding for external access through the proxy
5. **Dynamic URL construction**: Frontend apps should dynamically construct backend URLs based on the subdomain pattern
6. **Resource awareness**: Containers have configurable but limited resources (RAM/CPU)
7. **Network isolation**: Each container is isolated; services can only be accessed via the proxy system

## Important Reminders

- **0.0.0.0 is mandatory** for any service that needs to be accessed from outside the container
- The **projectid in the subdomain** is automatically assigned and managed by XaresAICoder
- **VS Code runs in the browser** via code-server, not as a desktop application
- **Full sudo access** means you can install any system package or tool needed
- **Port conflicts** are avoided by using unique subdomains per service
- **Deployment flexibility**: XaresAICoder works on localhost, remote servers (HTTPS), and intranet servers (HTTP with minor VSC limitations)
- The **subdomain pattern adapts** to your deployment (`.localhost`, `.your-server.com`, or `.coder.internal.company.com:8000`)
- **Intranet deployments may include base ports** in the URL structure (e.g., `:8000`)