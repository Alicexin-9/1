# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production image - single Node process serves API + static files
FROM node:20-alpine

WORKDIR /app

# Backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

# Backend source
COPY backend/src/ ./backend/src/

# Frontend build output
COPY --from=frontend-builder /app/dist/ ./frontend/dist/

# SQLite data directory
RUN mkdir -p /app/backend/data

ENV PORT=3001
EXPOSE 3001

CMD ["node", "backend/src/index.js"]
