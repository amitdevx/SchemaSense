-- SQLite schema for AI explanation cache (reference only, created programmatically)
CREATE TABLE IF NOT EXISTS table_explanations_cache (
    cache_key TEXT PRIMARY KEY,
    database_hash TEXT NOT NULL,
    table_name TEXT NOT NULL,
    table_structure_hash TEXT NOT NULL,
    explanation TEXT NOT NULL,
    row_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    accessed_count INTEGER DEFAULT 0,
    last_accessed TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cache_db_table
    ON table_explanations_cache(database_hash, table_name);

