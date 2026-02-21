#!/bin/bash

echo "🚀 SchemaSense Development Server Startup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "   Please run:"
    echo "   cp backend/.env.example backend/.env"
    echo "   Then update database credentials"
    exit 1
fi

# Start Backend
echo -e "${BLUE}Starting Backend...${NC}"
echo "cd backend && source /home/amitdevx/py-env/bin/activate && python main.py"
cd backend
source /home/amitdevx/py-env/bin/activate
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Available at: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

# Wait for backend to start
sleep 2

# Start Frontend in new terminal or current
cd ..
echo -e "${BLUE}Starting Frontend...${NC}"
echo "npm run dev"
echo ""
echo -e "${GREEN}✅ Frontend starting...${NC}"
echo "   Available at: http://localhost:3000"
echo ""
echo -e "${GREEN}Both servers running!${NC}"
echo ""
echo "📖 Documentation: cat SETUP_GUIDE.md"
echo "📋 Integration info: cat INTEGRATION_COMPLETE.md"
echo ""
echo "Press Ctrl+C to stop"

npm run dev
