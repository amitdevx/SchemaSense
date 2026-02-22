import logging
from contextlib import asynccontextmanager
from datetime import timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from utils.database import db
from routes import tables, chat, chat_stream, export, auth, connection, dashboard, profile, settings as settings_routes, integrations, cache as cache_routes, activity
from utils.cache_db import init_cache, init_chat_cache

# Setup logging with IST timezone
IST = timezone(timedelta(hours=5, minutes=30))

class ISTFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        from datetime import datetime
        ct = datetime.fromtimestamp(record.created, tz=IST)
        if datefmt:
            return ct.strftime(datefmt)
        return ct.strftime('%Y-%m-%d %I:%M:%S %p IST')

handler = logging.StreamHandler()
handler.setFormatter(ISTFormatter('%(asctime)s  %(levelname)s  %(message)s'))
logging.root.handlers = [handler]
logging.root.setLevel(logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# ===== Lifespan Events =====

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting SchemaSense Backend...")
    logger.info(f"Binding to {settings.API_HOST}:{settings.API_PORT}")
    await init_cache()
    await init_chat_cache()
    logger.info("Backend ready! (Database connection will be established per user via /api/connect-db)")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await db.disconnect()

# ===== FastAPI App =====

app = FastAPI(
    title="SchemaSense API",
    description="Intelligent Database Schema & Documentation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# ===== CORS Middleware =====

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

logger.info(f"CORS enabled for: {settings.CORS_ORIGINS}")

# ===== Include Routers =====

app.include_router(connection.router)
app.include_router(tables.router)
app.include_router(chat.router)
app.include_router(chat_stream.router)
app.include_router(export.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(settings_routes.router)
app.include_router(integrations.router)
app.include_router(cache_routes.router)
app.include_router(activity.router)

# ===== Root Routes =====

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SchemaSense API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}

# ===== Run =====

if __name__ == "__main__":
    import uvicorn

    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["default"]["fmt"] = "%(asctime)s  %(levelname)s  %(message)s"
    log_config["formatters"]["default"]["datefmt"] = "%Y-%m-%d %I:%M:%S %p IST"
    log_config["formatters"]["access"]["fmt"] = '%(asctime)s  INFO  %(client_addr)s - "%(request_line)s" %(status_code)s'
    log_config["formatters"]["access"]["datefmt"] = "%Y-%m-%d %I:%M:%S %p IST"

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=False,
        log_level="info",
        log_config=log_config
    )
