# Use Node.js 20 on Debian Bookworm (Single-stage for maximum stability)
FROM node:20-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy configuration files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Force Prisma to use binary engine and generate it for the current environment
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN pnpm prisma generate

# Build the TypeScript application
RUN pnpm run build

# Expose backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:3000/api/config/status || exit 1

# Start the application
CMD ["pnpm", "start"]
