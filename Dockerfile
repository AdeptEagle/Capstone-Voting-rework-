# Root-level Dockerfile for Backend Service
# This Dockerfile builds the backend service
# It assumes the build context includes all necessary files

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
RUN echo "=== End Debug ==="

# Copy all files to container
COPY . .

# Move to backend directory if it exists
RUN if [ -d "backend-nestjs" ]; then \
        echo "Found backend-nestjs directory, moving to it"; \
        cd backend-nestjs; \
        cp -r * ..; \
        cd ..; \
        rm -rf backend-nestjs; \
    else \
        echo "No backend-nestjs directory found, assuming we're in backend directory"; \
    fi

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Debug: Show what was built
RUN echo "=== Build Debug ==="
RUN ls -la dist/
RUN find dist/ -name "main*" -type f || echo "No main files found"
RUN echo "=== End Build Debug ==="

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application with fallback
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; elif [ -f dist/src/main.js ]; then node dist/src/main.js; else echo 'No main file found' && ls -la dist/ && exit 1; fi"]