#!/usr/bin/env bash
# RUMBO — one-command launch script
# Starts Flask backend (port 5001) + Vite frontend (port 5173) together.
# Press Ctrl+C to stop both.

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Backend ───────────────────────────────────────────────────────
echo "🐍  Setting up Python backend..."
cd "$ROOT/backend"

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

echo "⚓  Starting Flask backend on http://localhost:5001"
python app.py &
BACKEND_PID=$!

# ── Frontend ──────────────────────────────────────────────────────
echo "📦  Installing frontend dependencies..."
cd "$ROOT/frontend"
npm install --silent

echo "🧭  Starting Vite dev server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

# ── Cleanup on exit ───────────────────────────────────────────────
trap "echo ''; echo 'Stopping RUMBO...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

echo ""
echo "✅  RUMBO is running!"
echo "   Frontend → http://localhost:5173"
echo "   Backend  → http://localhost:5001"
echo ""
echo "   Press Ctrl+C to stop."
echo ""

wait
