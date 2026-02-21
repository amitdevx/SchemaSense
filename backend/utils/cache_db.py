"""
SQLite-based cache for AI-generated table explanations.

Persists across server restarts. Shared across all users.
Does NOT interfere with app DB (users/auth) or user-connected databases.
"""
import sqlite3
import asyncio
import os
import logging
import threading
from datetime import datetime
from typing import Optional

from models.cache import generate_database_hash, generate_structure_hash, build_cache_key

logger = logging.getLogger(__name__)

# Store the SQLite DB file next to the backend code in a data/ directory
_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
_DB_PATH = os.path.join(_DB_DIR, "explanation_cache.db")

# Thread-local storage for SQLite connections (sqlite3 objects are not thread-safe)
_local = threading.local()


def _get_conn() -> sqlite3.Connection:
    """Get a thread-local SQLite connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        os.makedirs(_DB_DIR, exist_ok=True)
        _local.conn = sqlite3.connect(_DB_PATH, timeout=10)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")  # better concurrent reads
        _local.conn.execute("PRAGMA busy_timeout=5000")
    return _local.conn


def _init_table():
    """Create the cache table if it doesn't exist."""
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS table_explanations_cache (
            cache_key      TEXT PRIMARY KEY,
            database_hash  TEXT NOT NULL,
            table_name     TEXT NOT NULL,
            table_structure_hash TEXT NOT NULL,
            explanation    TEXT NOT NULL,
            row_count      INTEGER DEFAULT 0,
            created_at     TEXT DEFAULT (datetime('now')),
            accessed_count INTEGER DEFAULT 0,
            last_accessed  TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_cache_db_table
        ON table_explanations_cache(database_hash, table_name)
    """)
    conn.commit()
    logger.info(f"Cache DB initialized at {_DB_PATH}")


# ── Sync helpers (run inside asyncio.to_thread) ──────────────────────────

def _sync_get(cache_key: str) -> Optional[str]:
    conn = _get_conn()
    row = conn.execute(
        "SELECT explanation FROM table_explanations_cache WHERE cache_key = ?",
        (cache_key,),
    ).fetchone()
    if row:
        conn.execute(
            "UPDATE table_explanations_cache SET accessed_count = accessed_count + 1, last_accessed = datetime('now') WHERE cache_key = ?",
            (cache_key,),
        )
        conn.commit()
        return row["explanation"]
    return None


def _sync_store(cache_key: str, database_hash: str, table_name: str,
                structure_hash: str, explanation: str, row_count: int):
    conn = _get_conn()
    conn.execute("""
        INSERT INTO table_explanations_cache
            (cache_key, database_hash, table_name, table_structure_hash,
             explanation, row_count, created_at, accessed_count, last_accessed)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0, datetime('now'))
        ON CONFLICT(cache_key) DO UPDATE SET
            explanation    = excluded.explanation,
            row_count      = excluded.row_count,
            last_accessed  = datetime('now')
    """, (cache_key, database_hash, table_name, structure_hash, explanation, row_count))
    conn.commit()


def _sync_stats() -> dict:
    conn = _get_conn()
    row = conn.execute("""
        SELECT COUNT(*) as total,
               COALESCE(SUM(accessed_count), 0) as total_hits
        FROM table_explanations_cache
    """).fetchone()
    return {"total_cached": row["total"], "total_cache_hits": row["total_hits"]}


def _sync_clear():
    conn = _get_conn()
    conn.execute("DELETE FROM table_explanations_cache")
    conn.commit()


# ── Public async API ─────────────────────────────────────────────────────

async def init_cache():
    """Initialize cache DB (call once at startup)."""
    await asyncio.to_thread(_init_table)


async def get_cached_explanation(
    host: str, port: int, database: str, schema_filter: str,
    user: str, table_name: str, columns_str: str,
) -> Optional[str]:
    """
    Look up a cached AI explanation.

    Returns the cached explanation string, or None on cache miss.
    """
    db_hash = generate_database_hash(host, port, database, schema_filter, user)
    struct_hash = generate_structure_hash(columns_str)
    key = build_cache_key(db_hash, table_name, struct_hash)
    result = await asyncio.to_thread(_sync_get, key)
    if result:
        logger.info(f"Cache HIT for {table_name} (key={key[:16]}…)")
    else:
        logger.info(f"Cache MISS for {table_name} (key={key[:16]}…)")
    return result


async def store_explanation(
    host: str, port: int, database: str, schema_filter: str,
    user: str, table_name: str, columns_str: str,
    explanation: str, row_count: int = 0,
):
    """Store an AI explanation in the cache."""
    db_hash = generate_database_hash(host, port, database, schema_filter, user)
    struct_hash = generate_structure_hash(columns_str)
    key = build_cache_key(db_hash, table_name, struct_hash)
    await asyncio.to_thread(
        _sync_store, key, db_hash, table_name, struct_hash, explanation, row_count,
    )
    logger.info(f"Cached explanation for {table_name} (key={key[:16]}…)")


async def get_cache_stats() -> dict:
    """Return basic cache statistics."""
    return await asyncio.to_thread(_sync_stats)


async def clear_cache():
    """Remove all cached explanations."""
    await asyncio.to_thread(_sync_clear)
    logger.info("Cache cleared")
