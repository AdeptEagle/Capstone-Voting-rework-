# Root-level Dockerfile for Backend Service
# This Dockerfile builds the backend service from the backend-nestjs directory
# WITHOUT copying backend files to root

FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache openssl

# Set Node.js options for crypto
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# Set working directory
WORKDIR /app

# Copy package files from backend-nestjs directory
COPY backend-nestjs/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code from backend-nestjs directory
COPY backend-nestjs/ .

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