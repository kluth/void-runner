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

# Install dependencies (including openssl for prisma generation)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN pnpm install

# Copy application files
COPY . .

# Generate Prisma client for multiple potential targets
RUN pnpm prisma generate

# Compile TypeScript
RUN pnpm run build

# Runtime stage
FROM node:20-bookworm-slim AS runtime

# Install runtime dependencies (OpenSSL 3 is standard in Bookworm)
RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy only necessary files from build stage
# We copy the whole /app to ensure dist/ and node_modules/ are present
COPY --from=build /app .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:3000/api/config/status || exit 1

# Command to run the application
CMD ["node", "dist/index.js"]
