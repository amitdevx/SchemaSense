from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from schemas import ChatRequest
from routes.connection import get_user_db, get_db_pool, get_schema_filter_for, get_db_type
from utils.deepseek_client import deepseek_client
from utils.schema_queries import get_count_query
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

class ChatStreamRequest(ChatRequest):
    connection_id: Optional[str] = None

@router.options("/chat/stream")
async def options_chat_stream():
    """Handle CORS preflight requests"""
    return {"status": "ok"}

@router.post("/chat/stream")
async def chat_with_schema_streaming(request: ChatStreamRequest):
    """Chat interface with streaming response"""
    try:
        db = get_db_pool(request.connection_id) if request.connection_id else get_user_db()
        
        # Build comprehensive context from all tables
        async with db.acquire() as conn:
            tables_query = """
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema=$1 AND table_type='BASE TABLE'
                ORDER BY table_name
            """
            schema = get_schema_filter_for(request.connection_id)
            tables = await conn.fetch(tables_query, schema)
            table_names = [t['table_name'] for t in tables]
            
            context = "DATABASE SCHEMA:\n"
            db_type = get_db_type(request.connection_id)
            for table_name in table_names:
                # Get row count
                count_query = get_count_query(table_name, db_type)
                count_result = await conn.fetchval(count_query)
                
                columns_query = """
                    SELECT column_name, data_type FROM information_schema.columns
                    WHERE table_name=$1 ORDER BY ordinal_position
                """
                columns = await conn.fetch(columns_query, table_name)
                col_info = [f"{c['column_name']} ({c['data_type']})" for c in columns]
                context += f"\n📊 {table_name} ({count_result:,} rows):\n   Columns: {', '.join(col_info)}\n"
        
        async def stream_response():
            """Generator that streams response chunks"""
            # Send initial status that appears in blue box
            yield json.dumps({"type": "status", "message": "🤖 Connecting to AI..."}) + "\n"
            yield json.dumps({"type": "status", "message": "📊 Analyzing your database..."}) + "\n"
            yield json.dumps({"type": "status", "message": "🔍 Processing your question..."}) + "\n"
            yield json.dumps({"type": "status", "message": "⚡ Generating response..."}) + "\n"
            
            try:
                # Stream the actual response content (without progress messages)
                async for chunk in deepseek_client.stream_chat_about_schema(
                    question=request.question,
                    context=context
                ):
                    # Send content chunks directly (no status messages mixed in)
                    yield json.dumps({"type": "content", "data": chunk}) + "\n"
                
                # Completion signal
                yield json.dumps({"type": "done"}) + "\n"
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                yield json.dumps({"type": "error", "message": f"Error: {str(e)}"}) + "\n"
        
        return StreamingResponse(
            stream_response(),
            media_type="application/x-ndjson"  # Newline-delimited JSON
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in streaming chat: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
