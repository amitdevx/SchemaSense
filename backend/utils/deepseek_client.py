import logging
import time
from typing import AsyncGenerator
from openai import OpenAI, RateLimitError, APIError
from config import get_settings

logger = logging.getLogger(__name__)

class OpenRouterDeepSeekClient:
    """DeepSeek via OpenRouter free tier using OpenAI SDK with streaming support"""
    
    def __init__(self):
        settings = get_settings()
        if settings.OPENROUTER_API_KEY:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.OPENROUTER_API_KEY,
                default_headers={
                    "HTTP-Referer": "https://hackthon-demo-ten.vercel.app",
                    "X-Title": "SchemaSense"
                }
            )
            # Use openrouter/free for smart routing to available free models
            self.model = "openrouter/free"
            self.max_retries = 3
            self.retry_delay = 1  # seconds
            logger.info("OpenRouter free tier router initialized")
        else:
            logger.warning("OPENROUTER_API_KEY not set - AI features disabled")
            self.client = None
    
    def _query_with_retry(self, messages: list, max_tokens: int = 1000, stream: bool = False):
        """Query with exponential backoff retry logic for rate limits"""
        if not self.client:
            return None
        
        for attempt in range(self.max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=max_tokens,
                    stream=stream
                )
                # Log which model was actually used
                if not stream:
                    actual_model = response.model
                    if actual_model != self.model:
                        logger.info(f"Request routed to: {actual_model}")
                return response
            except RateLimitError as e:
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (2 ** attempt)
                    logger.warning(f"Rate limited. Retrying in {wait_time}s (attempt {attempt + 1}/{self.max_retries})")
                    time.sleep(wait_time)
                else:
                    error_msg = "Daily quota exceeded or rate limited - OpenRouter free tier: 50 requests/day, 20/minute"
                    logger.error(f"{error_msg}")
                    return None
            except APIError as e:
                error_str = str(e)
                if "402" in error_str:
                    logger.error("402 Payment Required - No free models available or quota exceeded")
                    return None
                elif "401" in error_str:
                    logger.error("401 Unauthorized - Invalid OpenRouter API key")
                    return None
                elif "404" in error_str:
                    logger.error(f"404 Model Not Found: {error_str[:200]}")
                    return None
                else:
                    logger.error(f"API Error: {e}")
                    return None
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return None
        
        return None
    
    async def stream_chat_about_schema(self, question: str, context: str) -> AsyncGenerator[str, None]:
        """Stream AI response about database schema with progress indicators"""
        if not self.client:
            yield "AI features are not configured"
            return
        
        # Enhanced prompt for comprehensive data extraction
        prompt = f"""You are an expert data dictionary assistant analyzing a database schema.

DATABASE SCHEMA CONTEXT:
{context}

USER QUESTION: {question}

RESPONSE INSTRUCTIONS:
1. Answer the question directly and comprehensively
2. Provide specific table and column names from the schema
3. Explain relationships between tables when relevant
4. Include practical insights about data usage
5. Be concise but thorough (2-4 sentences for simple questions, 5-8 for complex ones)
6. Always reference the actual table/column names from the provided schema

Please provide a helpful, accurate response."""
        
        try:
            response = self._query_with_retry(
                [{"role": "user", "content": prompt}],
                max_tokens=2000,
                stream=True
            )
            
            if response is None:
                yield "Failed to connect to AI service"
                return
            
            chunk_count = 0
            for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield content
                    chunk_count += 1
                    
                    # Log model used from first chunk
                    if chunk_count == 1 and hasattr(chunk, 'model'):
                        logger.info(f"Streaming via: {chunk.model}")
        
        except RateLimitError:
            yield "Rate limited - please wait a moment and try again"
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"Error: {str(e)[:100]}"
    
    async def stream_explain_table(self, table_name: str, columns_str: str, row_count: int) -> AsyncGenerator[str, None]:
        """Stream business-friendly explanation for a table with progress"""
        if not self.client:
            yield f"Table '{table_name}' with {row_count} rows"
            return
        
        # Enhanced prompt for thorough table analysis
        prompt = f"""Provide a comprehensive business analysis of this database table:

TABLE NAME: {table_name}
COLUMNS: {columns_str}
ROW COUNT: {row_count:,}

ANALYSIS REQUIRED:
1. What business entity does this table represent?
2. What is the primary purpose of this data?
3. List 3-5 key insights about what columns mean
4. What business processes depend on this data?
5. Any notable patterns or important considerations?

Format: Clear, business-friendly language (3-5 sentences per section)"""
        
        try:
            response = self._query_with_retry(
                [{"role": "user", "content": prompt}],
                max_tokens=1500,
                stream=True
            )
            
            if response is None:
                yield "Failed to connect to AI service"
                return
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        
        except RateLimitError:
            yield "Rate limited - please wait a moment and try again"
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"Error: {str(e)[:100]}"
    
    async def explain_table(self, table_name: str, columns_str: str, row_count: int) -> str:
        """Generate business-friendly explanation for a table (non-streaming)"""
        result = ""
        async for chunk in self.stream_explain_table(table_name, columns_str, row_count):
            result += chunk
        return result
    
    async def chat_about_schema(self, question: str, context: str) -> str:
        """Answer questions about database schema (non-streaming)"""
        result = ""
        async for chunk in self.stream_chat_about_schema(question, context):
            result += chunk
        return result

# Global DeepSeek instance via OpenRouter
deepseek_client = OpenRouterDeepSeekClient()
