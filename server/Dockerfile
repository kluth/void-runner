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
RUN pnpm install

# Copy application files
COPY . .

# Generate Prisma client with correct binary targets for OpenSSL 3
RUN pnpm prisma generate --binary-targets=native

# Runtime stage
FROM node:20-bookworm-slim AS runtime

# Create app directory
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:3000/health || exit 1

# Command to run the application
CMD ["pnpm", "start"]