# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache openssl

# Set Node.js options for crypto
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port (Railway uses PORT environment variable)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"] 