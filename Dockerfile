# Build stage
FROM node:22-alpine AS builder

# Set build-time variables
ARG PUBLIC_ENV_NAME
ENV PUBLIC_ENV_NAME=$PUBLIC_ENV_NAME

# Add metadata
LABEL maintainer="techno-ambassador"
LABEL description="Techno Ambassador - Event platform for techno music community"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S astro -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=astro:nodejs /app/dist ./dist

# Copy any additional runtime files if needed
COPY --from=builder --chown=astro:nodejs /app/public ./public

# Set environment variables for production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5321

# Switch to non-root user
USER astro

# Expose port
EXPOSE 5321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5321/ || exit 1

# Start the application
CMD ["dumb-init", "node", "./dist/server/entry.mjs"] 