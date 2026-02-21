"""Cache key generation utilities for AI explanation caching"""
import hashlib


def generate_database_hash(host: str, port: int, database: str, schema_filter: str, user: str) -> str:
    """Generate a unique hash identifying a database connection (host+port+db+schema+user)."""
    db_identity = f"{host}:{port}:{database}:{schema_filter}:{user}"
    return hashlib.sha256(db_identity.encode()).hexdigest()[:24]


def generate_structure_hash(columns_str: str) -> str:
    """Generate a hash of the table column structure. Invalidates cache if schema changes."""
    return hashlib.sha256(columns_str.encode()).hexdigest()[:24]


def build_cache_key(database_hash: str, table_name: str, structure_hash: str) -> str:
    """Build composite cache key: database_hash#table_name#structure_hash."""
    return f"{database_hash}#{table_name}#{structure_hash}"
