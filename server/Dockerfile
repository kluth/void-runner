FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm run build
EXPOSE 3000
# Note: In production we use a real build, for this env we run via ts-node or compiled dist
CMD ["pnpm", "start"]
