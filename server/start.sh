#!/bin/sh
set -e

# Sync database schema
npx prisma db push --accept-data-loss

# Start the application
node dist/index.js
