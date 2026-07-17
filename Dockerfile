FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/
RUN mkdir -p /app/backend/data
EXPOSE 3001
ENV PORT=3001 NODE_ENV=production
CMD ["node", "backend/src/index.js"]
