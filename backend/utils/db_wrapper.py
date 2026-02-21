"""
SQL Server connection wrapper that mimics asyncpg pool interface.
Uses pymssql under the hood with asyncio.to_thread() for async compatibility.
"""

import asyncio
import re
import logging

logger = logging.getLogger(__name__)

try:
    import pymssql
except ImportError:
    pymssql = None


def _convert_params(query: str) -> str:
    """Convert asyncpg-style $1, $2 parameters to pymssql-style %s"""
    return re.sub(r'\$\d+', '%s', query)


class MSSQLConnectionWrapper:
    """Wraps a pymssql connection to match asyncpg connection interface"""

    def __init__(self, conn):
        self._conn = conn

    async def fetch(self, query, *args):
        """Execute query and return all rows as list of dicts (lowercase keys)"""
        converted = _convert_params(query)
        def _exec():
            cursor = self._conn.cursor(as_dict=True)
            cursor.execute(converted, args if args else None)
            rows = cursor.fetchall()
            return [{k.lower(): v for k, v in row.items()} for row in rows]
        return await asyncio.to_thread(_exec)

    async def fetchval(self, query, *args):
        """Execute query and return first column of first row"""
        converted = _convert_params(query)
        def _exec():
            cursor = self._conn.cursor()
            cursor.execute(converted, args if args else None)
            row = cursor.fetchone()
            return row[0] if row else None
        return await asyncio.to_thread(_exec)

    async def fetchrow(self, query, *args):
        """Execute query and return first row as dict (lowercase keys)"""
        converted = _convert_params(query)
        def _exec():
            cursor = self._conn.cursor(as_dict=True)
            cursor.execute(converted, args if args else None)
            row = cursor.fetchone()
            if row:
                return {k.lower(): v for k, v in row.items()}
            return None
        return await asyncio.to_thread(_exec)


class _MSSQLAcquireContext:
    """Context manager that creates and returns a wrapped connection"""

    def __init__(self, config):
        self._config = config
        self._conn = None

    async def __aenter__(self):
        def _connect():
            return pymssql.connect(
                server=self._config["host"],
                port=self._config["port"],
                user=self._config["user"],
                password=self._config["password"],
                database=self._config["database"],
                login_timeout=30,
                timeout=30,
            )
        self._conn = await asyncio.to_thread(_connect)
        return MSSQLConnectionWrapper(self._conn)

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._conn:
            try:
                await asyncio.to_thread(self._conn.close)
            except Exception:
                pass
        return False


class MSSQLPoolWrapper:
    """Wraps pymssql to match asyncpg pool interface.
    Creates a new connection per acquire() call.
    """

    def __init__(self, host, port, user, password, database):
        if pymssql is None:
            raise ImportError(
                "pymssql is required for SQL Server connections. "
                "Install with: pip install pymssql"
            )
        self._config = {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "database": database,
        }

    def acquire(self):
        """Return a context manager that provides a connection"""
        return _MSSQLAcquireContext(self._config)

    async def close(self):
        """No persistent pool to close"""
        pass
