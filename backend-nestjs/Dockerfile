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

# Create entrypoint script to handle database initialization
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'echo "🔍 Checking database state..."' >> /app/entrypoint.sh && \
    echo 'if npx prisma migrate deploy 2>/dev/null; then' >> /app/entrypoint.sh && \
    echo '  echo "✅ Migrations applied successfully"' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '  echo "⚠️  Migration failed, using db push instead..."' >> /app/entrypoint.sh && \
    echo '  npx prisma db push' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo 'npx prisma generate' >> /app/entrypoint.sh && \
    echo 'exec "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "start:prod"] 