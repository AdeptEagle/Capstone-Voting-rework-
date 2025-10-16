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

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]