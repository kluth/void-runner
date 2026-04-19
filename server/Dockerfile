# --- Stage 1: Build ---
FROM node:20-bookworm-slim AS build

# Install build dependencies
RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm install -g pnpm

# Install dependencies separately to leverage Docker cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy application source
COPY . .

# Generate Prisma client specifically for OpenSSL 3.0
# We force the binary target to ensure it doesn't try to use a local cache
RUN pnpm prisma generate

# Build the TypeScript application
RUN pnpm run build

# --- Stage 2: Runtime ---
FROM node:20-bookworm-slim AS runtime

# Install ONLY runtime dependencies
RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production artifacts from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Set production environment flags for Prisma
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary

EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:3000/api/config/status || exit 1

CMD ["node", "dist/index.js"]
