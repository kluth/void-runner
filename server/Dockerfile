# Use Node.js 20 on Debian Bookworm
FROM node:20-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy configuration files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy application source
COPY . .

# Generate Prisma client for the current environment
RUN pnpm prisma generate

# Build the TypeScript application
RUN pnpm run build

# Expose backend port
EXPOSE 3000

# Health check using relative path
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:3000/api/config/status || exit 1

# Start the application using the compiled entry point
CMD ["node", "dist/index.js"]
