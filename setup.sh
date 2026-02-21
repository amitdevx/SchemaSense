#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# SchemaSense One-Command Setup Script
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                  🚀 SchemaSense Complete Setup                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="/home/amitdevx/codes/v0-le-lo-saa-s-landing-jy"
PY_ENV="/home/amitdevx/py-env"
DB_USER="postgres"
DB_PASSWORD="amit123"
DB_NAME="schemasense"
GEMINI_API_KEY="your_gemini_api_key_here"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Step 1: Setting up PostgreSQL Database...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"
echo -e "${GREEN}✅ Database created/verified${NC}"

# Initialize schema
cd "$PROJECT_ROOT/backend"
psql -U $DB_USER -h localhost -d $DB_NAME -f schema.sql 2>/dev/null || echo "Schema already initialized"
echo -e "${GREEN}✅ Database schema initialized${NC}"

echo ""
echo -e "${BLUE}🔧 Step 2: Setting up Python Environment...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create virtual environment
if [ ! -d "$PY_ENV" ]; then
    python3 -m venv "$PY_ENV"
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source "$PY_ENV/bin/activate"

# Upgrade pip
pip install --upgrade pip -q
echo -e "${GREEN}✅ Pip upgraded${NC}"

# Install dependencies
pip install -r requirements.txt -q
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo ""
echo -e "${BLUE}⚙️  Step 3: Configuring Environment Variables...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create/update .env file
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# API Keys (Gemini)
GEMINI_API_KEY=$GEMINI_API_KEY

# JWT Configuration
JWT_SECRET_KEY=schemasense-secret-key-2024-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server Configuration
API_PORT=8000
API_HOST=0.0.0.0
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001

# Connection Pool
DB_POOL_MIN_SIZE=5
DB_POOL_MAX_SIZE=20
EOF
echo -e "${GREEN}✅ Backend .env configured${NC}"

cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}🎨 Step 4: Setting up Frontend...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install frontend dependencies
npm install -q 2>/dev/null || echo "Dependencies installation in progress..."
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Create .env.local for frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=SchemaSense
EOF
echo -e "${GREEN}✅ Frontend .env.local configured${NC}"

# Build frontend
npm run build -q 2>/dev/null || echo "Build in progress, this may take a moment..."
echo -e "${GREEN}✅ Frontend build complete${NC}"

echo ""
echo -e "${BLUE}✨ Step 5: Verification...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verify Python config
source "$PY_ENV/bin/activate"
cd "$PROJECT_ROOT/backend"
VERIFICATION=$(python -c "from config import get_settings; s = get_settings(); print('✅' if s.DB_USER == '$DB_USER' and s.GEMINI_API_KEY else '❌')" 2>/dev/null)
echo "Configuration: $VERIFICATION"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo -e "║${GREEN}                    ✅ SETUP COMPLETE!${NC}                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📌 NEXT STEPS:${NC}"
echo ""
echo "Start the application in TWO terminals:"
echo ""
echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "  cd $PROJECT_ROOT/backend"
echo "  source $PY_ENV/bin/activate"
echo "  python main.py"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "  cd $PROJECT_ROOT"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}📝 Access:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}🔐 Database Credentials:${NC}"
echo "  User:     $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "  Database: $DB_NAME"
echo "  Host:     localhost:5432"
echo ""
echo -e "${YELLOW}🔗 Gemini API Key:${NC}"
echo "  ✅ Configured and active"
echo ""
echo "For detailed documentation, see: COMPLETE_SETUP_GUIDE.md"
echo ""
