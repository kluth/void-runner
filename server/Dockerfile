# Use Node.js 20 with multi-stage build

# Build stage
FROM node:20-bookworm-slim AS build

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json .
COPY pnpm-lock.yaml .

# Install dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN pnpm install

# Copy application files
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Runtime stage
FROM node:20-bookworm-slim AS runtime

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy application files
COPY --from=build /app .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:3000/api/config/status || exit 1

# Command to run the application
CMD ["node", "dist/index.js"]