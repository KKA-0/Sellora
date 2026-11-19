#!/usr/bin/env bash

# Sellora Development & Startup Orchestrator
# Starts both the FastAPI Backend and the Tauri Desktop Client.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$PROJECT_ROOT/api"
SELLORA_DIR="$PROJECT_ROOT/sellora"

echo "=================================================="
echo "           🚀 Starting Sellora OS"
echo "=================================================="

# 1. Ensure Python & uv are ready
if command -v uv >/dev/null 2>&1; then
    UV_BIN="uv"
elif [ -f "$HOME/.local/bin/uv" ]; then
    export PATH="$HOME/.local/bin:$PATH"
    UV_BIN="$HOME/.local/bin/uv"
else
    echo "❌ Error: 'uv' is not installed. Please install it with:"
    echo "   curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# 2. Ensure Node 20+ is in PATH (Vite 8 requirement)
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
fi

if [ "$NODE_MAJOR" -lt 20 ]; then
    if [ -d "$HOME/.nvm/versions/node/v22.23.1/bin" ]; then
        export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"
    elif [ -d "$HOME/.nvm/versions/node/v20.20.2/bin" ]; then
        export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
    elif [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        # shellcheck disable=SC1090
        \. "$NVM_DIR/nvm.sh"
        nvm use 22 2>/dev/null || nvm use 20 2>/dev/null || true
    fi
fi

# Ensure Rust cargo is in PATH
if [ -d "$HOME/.cargo/bin" ]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

echo "📦 Environment:"
echo "   • Node: $(node -v 2>/dev/null || echo 'not found')"
echo "   • UV:   $($UV_BIN --version 2>/dev/null || echo 'not found')"
echo "   • Rust: $(cargo --version 2>/dev/null | head -n1 || echo 'not found')"
echo ""

# 3. Clean any lingering port 8000 processes
LINGERING_PID=$(lsof -ti :8000 2>/dev/null || true)
if [ -n "$LINGERING_PID" ]; then
    echo "⚠️  Freeing port 8000 (killing process $LINGERING_PID)..."
    kill -9 "$LINGERING_PID" 2>/dev/null || true
    sleep 0.5
fi

# 4. Process Cleanup Handler
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "🛑 Shutting down Sellora services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    # Extra safety: kill port 8000 if child spawned subprocess
    lsof -ti :8000 2>/dev/null | xargs kill -9 2>/dev/null || true
    echo "✅ All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 5. Launch FastAPI Backend
echo "⚡ Starting FastAPI Backend on http://127.0.0.1:8000..."
cd "$API_DIR"
$UV_BIN run uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 1.5

# 6. Launch Sellora Desktop / Frontend
cd "$SELLORA_DIR"

if [ "$1" = "--web" ]; then
    echo "🖥️  Starting Sellora in Web Browser mode (Vite)..."
    npm run dev &
    FRONTEND_PID=$!
else
    echo "🖥️  Starting Sellora Desktop App (Tauri v2)..."
    echo "   (Pass '--web' flag if you only want the browser Vite UI)"
    npm run tauri dev &
    FRONTEND_PID=$!
fi

# Wait on background jobs
wait
