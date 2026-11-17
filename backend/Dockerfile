# Stage 1: Dependency resolution and production image
FROM node:20-alpine

# Install curl for docker health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Set ownership to unprivileged non-root 'node' user
RUN chown -R node:node /app

# Switch to non-root user for security compliance
USER node

# Expose backend API port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start production server
CMD ["node", "server.js"]
