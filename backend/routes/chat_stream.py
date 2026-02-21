from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from schemas import ChatRequest
from routes.connection import get_user_db, get_db_pool, get_schema_filter_for, get_db_type, get_connection_details
from utils.deepseek_client import deepseek_client
from utils.schema_queries import get_count_query
from utils.activity import log_activity, ActivityType
from utils.cache_db import get_cached_chat_response, store_chat_response
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
        
        # Check cache first
        conn_details = get_connection_details(request.connection_id)
        if conn_details:
            cached = await get_cached_chat_response(
                host=conn_details["host"],
                port=conn_details["port"],
                database=conn_details["database"],
                schema_filter=conn_details["schema_filter"],
                user=conn_details["user"],
                question=request.question,
            )
            if cached:
                log_activity(
                    ActivityType.CHAT_QUERY,
                    "Chat query (cached)",
                    f"Asked: {request.question[:80]}{'...' if len(request.question) > 80 else ''}",
                    {"question": request.question[:200], "cached": True}
                )
                async def cached_response():
                    yield json.dumps({"type": "status", "message": "⚡ Found cached response..."}) + "\n"
                    yield json.dumps({"type": "content", "data": cached}) + "\n"
                    yield json.dumps({"type": "done"}) + "\n"
                return StreamingResponse(cached_response(), media_type="application/x-ndjson")
        
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
            log_activity(
                ActivityType.CHAT_QUERY,
                "Chat query (streaming)",
                f"Asked: {request.question[:80]}{'...' if len(request.question) > 80 else ''}",
                {"question": request.question[:200]}
            )
            yield json.dumps({"type": "status", "message": "🤖 Connecting to AI..."}) + "\n"
            yield json.dumps({"type": "status", "message": "📊 Analyzing your database..."}) + "\n"
            yield json.dumps({"type": "status", "message": "🔍 Processing your question..."}) + "\n"
            yield json.dumps({"type": "status", "message": "⚡ Generating response..."}) + "\n"
            
            try:
                full_response = ""
                async for chunk in deepseek_client.stream_chat_about_schema(
                    question=request.question,
                    context=context
                ):
                    full_response += chunk
                    yield json.dumps({"type": "content", "data": chunk}) + "\n"
                
                # Store in cache for future requests
                if conn_details and full_response:
                    try:
                        await store_chat_response(
                            host=conn_details["host"],
                            port=conn_details["port"],
                            database=conn_details["database"],
                            schema_filter=conn_details["schema_filter"],
                            user=conn_details["user"],
                            question=request.question,
                            response=full_response,
                        )
                    except Exception as cache_err:
                        logger.warning(f"Failed to cache chat response: {cache_err}")
                
                yield json.dumps({"type": "done"}) + "\n"
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                yield json.dumps({"type": "error", "message": f"Error: {str(e)}"}) + "\n"
        
        return StreamingResponse(
            stream_response(),
            media_type="application/x-ndjson"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in streaming chat: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
