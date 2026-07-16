# Stage 1: Build frontend
FROM node:20-alpine AS frontend

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:20-alpine AS backend

WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production
COPY backend/src/ ./backend/src/
RUN mkdir -p /app/backend/data

ENV PORT=3001
EXPOSE 3001
CMD ["node", "backend/src/index.js"]
