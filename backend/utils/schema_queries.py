"""
Database-specific query helpers.
Handles SQL dialect differences between PostgreSQL and SQL Server.
"""


def get_test_query(db_type: str) -> str:
    if db_type == "sqlserver":
        return "SELECT @@VERSION"
    return "SELECT version()"


def get_sample_query(table_name: str, limit: int, db_type: str) -> str:
    safe_limit = min(limit, 10)
    if db_type == "sqlserver":
        return f"SELECT TOP {safe_limit} * FROM [{table_name}]"
    return f"SELECT * FROM {table_name} LIMIT {safe_limit}"


def get_count_query(table_name: str, db_type: str) -> str:
    if db_type == "sqlserver":
        return f"SELECT COUNT(*) FROM [{table_name}]"
    return f"SELECT COUNT(*) FROM {table_name}"


def get_count_alias_query(table_name: str, db_type: str) -> str:
    if db_type == "sqlserver":
        return f"SELECT COUNT(*) as total FROM [{table_name}]"
    return f"SELECT COUNT(*) as total FROM {table_name}"


def get_null_stats_query(table_name: str, column_name: str, db_type: str) -> str:
    if db_type == "sqlserver":
        return f"""
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN [{column_name}] IS NOT NULL THEN 1 END) as filled
            FROM [{table_name}]
        """
    return f"""
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN {column_name} IS NOT NULL THEN 1 END) as filled
        FROM {table_name}
    """


def get_default_schema(db_type: str) -> str:
    if db_type == "sqlserver":
        return "dbo"
    return "public"


def get_default_port(db_type: str) -> int:
    if db_type == "sqlserver":
        return 1433
    return 5432
