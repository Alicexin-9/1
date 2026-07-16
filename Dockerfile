# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build production image
FROM node:20-alpine

WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

# Copy backend source code
COPY backend/src/ ./backend/src/

# Copy frontend build output
COPY --from=frontend-builder /app/dist/ ./frontend/dist/

# Create data directory for SQLite database
RUN mkdir -p /app/backend/data

# Expose port
ENV PORT=3001
EXPOSE 3001

# Start the server
CMD ["node", "backend/src/index.js"]
