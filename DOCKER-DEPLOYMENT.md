# Docker Deployment Guide

This guide explains how to deploy the Techno Ambassador application using Docker and GitHub Actions.

## Overview

The application is containerized using Docker and automatically deployed to GitHub Container Registry (GHCR) via GitHub Actions. The Docker image is optimized for production with:

- **Multi-stage build** for minimal image size
- **No node_modules** in runtime (Astro standalone mode bundles everything)
- **Non-root user** for security
- **Health checks** for monitoring
- **Commit SHA tagging** for traceability

## Prerequisites

### Required GitHub Secrets

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### Environment Variables

The application uses these environment variables:

- `PUBLIC_ENV_NAME`: Environment name (production/staging)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anonymous key

## Automatic Deployment

### GitHub Actions Workflow

The workflow (`.github/workflows/docker-deploy.yml`) automatically:

1. **Triggers** on push to `master` branch or pull requests
2. **Tests** the application using `npm run test:coverage`
3. **Builds** Docker image with optimizations
4. **Pushes** to GitHub Container Registry
5. **Tags** with commit SHA and branch name

### Image Tags

Images are tagged with:

- `latest` (for master branch)
- `master-<commit-sha>` (for master branch commits)
- `<branch-name>` (for feature branches)
- `pr-<number>` (for pull requests)

## Manual Deployment

### Local Build

```bash
# Build the image
docker build --build-arg PUBLIC_ENV_NAME=local -t techno-ambassador-app:local .

# Run locally
docker run -d -p 5321:5321 \
  -e SUPABASE_URL="your-supabase-url" \
  -e SUPABASE_KEY="your-supabase-key" \
  -e PUBLIC_ENV_NAME="local" \
  techno-ambassador-app:local
```

### Using Docker Compose

```bash
# Create .env file with your variables
cp .env.example .env

# Edit .env with your actual values
# Then run:
docker-compose up -d
```

## Production Deployment

### Pull from GitHub Container Registry

```bash
# Login to GHCR
docker login ghcr.io -u your-username

# Pull the latest image
docker pull ghcr.io/your-username/techno-ambassador:latest

# Run in production
docker run -d \
  --name techno-ambassador-app \
  --restart unless-stopped \
  -p 5321:5321 \
  -e SUPABASE_URL="your-supabase-url" \
  -e SUPABASE_KEY="your-supabase-key" \
  -e PUBLIC_ENV_NAME="production" \
  ghcr.io/your-username/techno-ambassador:latest
```

### Digital Ocean Deployment

For Digital Ocean deployment mentioned in the tech stack:

1. **Create a Droplet** with Docker pre-installed
2. **Pull the image** from GHCR
3. **Run the container** with proper environment variables
4. **Configure reverse proxy** (nginx) for domain mapping

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Health Monitoring

The container includes health checks that monitor:

- Application responsiveness on port 5321
- 30-second intervals with 3-second timeout
- 3 retries before marking as unhealthy

Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' techno-ambassador-app
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 5321 is available
2. **Environment variables**: Verify all required variables are set
3. **Image not found**: Check if you have access to the GHCR registry
4. **Health check failures**: Verify the application starts correctly

### Debug Commands

```bash
# Check logs
docker logs techno-ambassador-app

# Access container shell
docker exec -it techno-ambassador-app sh

# Check running processes
docker ps

# Check resource usage
docker stats techno-ambassador-app
```

## Security Considerations

- Container runs as non-root user `astro:nodejs`
- No sensitive data in image layers
- Environment variables passed at runtime
- Regular security updates via base image updates

## Performance Optimization

- Multi-stage build reduces image size
- GitHub Actions cache for faster builds
- Optimized layer ordering for build cache efficiency
- Health checks for load balancer integration
