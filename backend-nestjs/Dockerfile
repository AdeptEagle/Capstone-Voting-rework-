# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache openssl

# Set Node.js options for crypto
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# Set working directory
WORKDIR /app

# Debug: Show what files are available
RUN echo "=== Dockerfile Debug ==="
RUN ls -la
RUN echo "=== Environment Variables ==="
RUN echo "DATABASE_URL: $DATABASE_URL"
RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "=== End Debug ==="

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Clean build directory and rebuild
RUN rm -rf dist/
RUN rm -rf node_modules/.cache
RUN npm run build --verbose || (echo "Build failed, checking what happened..." && ls -la && ls -la src/ && exit 1)

# Note: Migrations will be handled at runtime by the application

# Verify build output
RUN ls -la dist/
RUN ls -la dist/src/ || echo "dist/src directory not found"
RUN find dist/ -name "main*" -type f || echo "No main files found"
RUN echo "Build completed successfully"

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
# Try the standard path first, then fallback to direct node execution
CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; elif [ -f dist/main.js ]; then node dist/main.js; else echo 'No main file found' && ls -la dist/ && exit 1; fi"] 