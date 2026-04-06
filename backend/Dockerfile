# Base on Node.js v18 slim image for minimal size
FROM node:18-slim

# Install system dependencies needed for better-sqlite3 build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Ensure data directory exists for SQLite
RUN mkdir -p data

# Default environment variables
ENV PORT=8080
ENV DB_FILE=/app/data/sync.sqlite
ENV NODE_ENV=production

# Expose the API port
EXPOSE 8080

# Run the migration followed by the server
CMD ["sh", "-c", "node migrate.js && node server.js"]
