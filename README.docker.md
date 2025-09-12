# Docker Setup for ARIMUS

This project includes Docker configuration for both development and production environments.

## Quick Start

### Development Mode
```bash
# Using docker-compose (recommended)
npm run docker:dev

# Or using direct Docker commands
npm run docker:build:dev
npm run docker:run:dev
```

### Production Mode
```bash
# Using docker-compose (recommended)
npm run docker:prod

# Or using direct Docker commands
npm run docker:build
npm run docker:run
```

## Docker Commands

### Building Images
```bash
# Build production image
npm run docker:build
# or
docker build -t arimus .

# Build development image
npm run docker:build:dev
# or
docker build --target builder -t arimus:dev .
```

### Running Containers

#### Development (with hot reload)
```bash
# Using docker-compose
docker-compose --profile development up

# Direct docker run
docker run -p 8080:8080 -v $(pwd):/app -v /app/node_modules arimus:dev npm run dev
```

#### Production
```bash
# Using docker-compose
docker-compose --profile production up -d

# Direct docker run
docker run -p 80:80 arimus
```

### Management Commands
```bash
# Stop all containers
npm run docker:stop

# View logs
docker-compose logs -f

# Remove containers and images
docker-compose down --rmi all
```

## Configuration Files

- **Dockerfile**: Multi-stage build configuration
  - Stage 1: Node.js builder for development
  - Stage 2: Nginx production server
- **docker-compose.yml**: Orchestration for different environments
- **nginx.conf**: Custom Nginx configuration with SPA support
- **.dockerignore**: Excludes unnecessary files from build context

## Environment Profiles

### Development Profile
- Hot reload enabled
- Source code mounted as volume
- Runs on port 8080
- Node.js development server

### Production Profile
- Optimized build
- Nginx static file server
- Runs on port 80
- Gzip compression
- Security headers
- Health checks

## Health Checks

The production container includes health checks:
```bash
# Manual health check
curl http://localhost/health
```

## Troubleshooting

### Permission Issues (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

### Port Conflicts
Change ports in docker-compose.yml or use different ports:
```bash
docker run -p 3000:80 arimus  # Use port 3000 instead of 80
```

### Container Logs
```bash
docker logs <container_name>
docker-compose logs arimus-prod
```

### Clean Rebuild
```bash
docker-compose down
docker system prune -f
npm run docker:build
```