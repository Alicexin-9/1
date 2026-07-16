#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "========================================"
echo "  Personal Blog - Deployment Script"
echo "========================================"

# Step 1: Install dependencies
echo ""
echo "[1/3] Installing backend dependencies..."
cd backend && npm install --production
cd ..

echo ""
echo "[2/3] Installing frontend dependencies and building..."
cd frontend && npm install && npm run build
cd ..

# Step 3: Start server
echo ""
echo "[3/3] Starting server on port ${PORT:-3001}..."
echo "========================================"
echo ""
cd backend && node src/index.js