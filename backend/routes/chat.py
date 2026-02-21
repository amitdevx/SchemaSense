from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Optional
from schemas import ChatRequest, ChatResponse
from routes.connection import get_user_db, get_db_pool, get_schema_filter_for
from utils.deepseek_client import deepseek_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

class ChatRequestWithConnection(ChatRequest):
    connection_id: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_schema(request: ChatRequestWithConnection):
    """Chat interface - ask questions about schema using AI"""
    try:
        db = get_db_pool(request.connection_id) if request.connection_id else get_user_db()
        schema = get_schema_filter_for(request.connection_id)
        # Build context from all tables
        async with db.acquire() as conn:
            tables_query = """
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema=$1 AND table_type='BASE TABLE'
                ORDER BY table_name
            """
            tables = await conn.fetch(tables_query, schema)
            table_names = [t['table_name'] for t in tables]
            
            context = "Available tables:\n"
            for table_name in table_names:
                columns_query = """
                    SELECT column_name FROM information_schema.columns
                    WHERE table_name=$1 ORDER BY ordinal_position
                """
                columns = await conn.fetch(columns_query, table_name)
                col_names = [c['column_name'] for c in columns]
                context += f"- {table_name}: {', '.join(col_names)}\n"
        
        # Get AI response
        answer = await deepseek_client.chat_about_schema(
            question=request.question,
            context=context
        )
        
        return ChatResponse(
            question=request.question,
            answer=answer,
            timestamp=datetime.utcnow()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
