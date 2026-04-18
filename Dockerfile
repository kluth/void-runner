# --- Stage 1: Build ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build --configuration production

# --- Stage 2: Serve ---
FROM nginx:alpine
COPY --from=build /app/dist/hacker-game/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
