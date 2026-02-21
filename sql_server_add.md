# SQL Server Support Implementation Plan

## Executive Summary

This document outlines the plan to add SQL Server support alongside the existing PostgreSQL implementation. Currently, SQL Server is listed as "Coming Soon" in the frontend but is completely disabled. This requires significant backend refactoring to abstract database-specific operations.

**Effort Estimate:** 40-50 development hours
**Complexity Level:** Medium-High
**Risk Level:** Medium (requires multi-DB testing)

---

## Current State Analysis

### PostgreSQL Hardcoding Severity: HIGH ⚠️

#### Backend Hardcoding
1. **Connection Pooling (100% PostgreSQL)**
   - `backend/routes/connection.py` - Uses `asyncpg.create_pool()` exclusively
   - Exception handling tied to asyncpg exceptions
   - No database type field in connection model

2. **Schema Discovery (15+ SQL queries)**
   - All routes query `information_schema` tables
   - Assumes `table_schema='public'` for all databases
   - PostgreSQL-specific column naming

3. **Test Queries**
   - Uses `SELECT version()` (PostgreSQL only)
   - No abstraction for database compatibility

#### Frontend Constraints
- `app/connect-database/page.tsx` - SQL Server disabled in UI
- Port defaults hardcoded to 5432
- No `database_type` field sent to backend
- Form only enables PostgreSQL (lines 99-107)

---

## Implementation Roadmap

### Phase 1: Foundation & Connection Layer (6-8 hours)

#### 1.1 Update Connection Model
**File:** `backend/routes/connection.py`

```python
# ADD to ConnectionRequest (lines 52-59):
class ConnectionRequest(BaseModel):
    database_type: str = "postgresql"  # NEW: postgresql, sqlserver, snowflake
    host: str
    port: int = 5432  # Will be overridden by frontend
    user: str
    password: str
    database: str
    schema_filter: str = "public"  # For PostgreSQL; SQL Server uses dbo

# ADD to connection storage dict:
{
    "id": "abc123",
    "database_type": "postgresql",  # NEW FIELD
    "host": "localhost",
    "pool": <connection_pool>,
    # ... rest of fields
}
```

#### 1.2 Create Pool Factory
**File:** `backend/utils/pool_factory.py` (NEW)

```python
import asyncpg
import aioodbc
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class DatabasePoolFactory:
    """Factory for creating database-specific connection pools"""
    
    @staticmethod
    async def create_pool(db_type: str, host: str, port: int, user: str, 
                         password: str, database: str, **kwargs):
        """
        Create a connection pool for the specified database type.
        
        Args:
            db_type: postgresql | sqlserver | snowflake
            host, port, user, password, database: Connection parameters
            
        Returns:
            Connection pool (asyncpg.Pool or aioodbc.Pool)
            
        Raises:
            ValueError: If database type is not supported
            asyncpg.InvalidPasswordError: PostgreSQL auth failure
            pyodbc.Error: SQL Server connection error
        """
        
        if db_type == "postgresql":
            return await create_postgresql_pool(host, port, user, password, database)
        elif db_type == "sqlserver":
            return await create_sqlserver_pool(host, port, user, password, database)
        elif db_type == "snowflake":
            raise NotImplementedError("Snowflake support coming soon")
        else:
            raise ValueError(f"Unsupported database type: {db_type}")

async def create_postgresql_pool(host, port, user, password, database):
    """Create asyncpg pool for PostgreSQL"""
    return await asyncpg.create_pool(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        min_size=2,
        max_size=10,
        command_timeout=30
    )

async def create_sqlserver_pool(host, port, user, password, database):
    """Create aioodbc pool for SQL Server"""
    # Connection string format: Driver={ODBC Driver 17 for SQL Server};Server=host;Database=db;UID=user;PWD=pass
    conn_str = f"Driver={{ODBC Driver 17 for SQL Server}};Server={host},{port};Database={database};UID={user};PWD={password}"
    return await aioodbc.create_pool(dsn=conn_str, minsize=2, maxsize=10)
```

#### 1.3 Create Test Query Abstraction
**File:** `backend/utils/db_test_queries.py` (NEW)

```python
"""Database-specific test queries to verify connectivity"""

TEST_QUERIES = {
    "postgresql": "SELECT version();",
    "sqlserver": "SELECT @@VERSION;",
    "snowflake": "SELECT CURRENT_VERSION();"
}

ERROR_HANDLERS = {
    "postgresql": {
        "auth_error": "asyncpg.InvalidPasswordError",
        "db_not_found": "asyncpg.InvalidCatalogNameError"
    },
    "sqlserver": {
        "auth_error": "pyodbc.IntegrityError or pyodbc.OperationalError",
        "db_not_found": "None - connection succeeds, query fails"
    }
}
```

#### 1.4 Update Connection Handler
**File:** `backend/routes/connection.py` (Update connect_database endpoint)

```python
# REPLACE lines 122-131 with:
async def connect_database(request: ConnectionRequest, response: Response):
    """Test and store user's database connection"""
    
    try:
        logger.info(f"Connection request: {request.database_type} @ {request.host}:{request.port}/{request.database}")
        
        # Create pool using factory
        pool = await DatabasePoolFactory.create_pool(
            db_type=request.database_type,
            host=request.host,
            port=request.port,
            user=request.user,
            password=request.password,
            database=request.database
        )
        
        # Test connection with database-specific query
        test_query = TEST_QUERIES[request.database_type]
        async with pool.acquire() as conn:
            version = await conn.fetchval(test_query)
        
        # Store connection with type
        conn_id = str(uuid.uuid4())[:8]
        connections[conn_id] = {
            "database_type": request.database_type,  # NEW
            "host": request.host,
            "port": request.port,
            "user": request.user,
            "password": request.password,
            "database": request.database,
            "schema_filter": request.schema_filter,
            "pool": pool,
            "name": request.name or f"{request.database}@{request.host}",
            "connected_at": datetime.utcnow().isoformat(),
            "version": version[:50] if version else "Unknown"
        }
        
        active_connection_id = conn_id
        _sync_user_db_connection()
        
        return ConnectionResponse(
            success=True,
            message="Connected successfully",
            connection_id=conn_id,
            database_info={
                "host": request.host,
                "database": request.database,
                "type": request.database_type,  # NEW
                "version": version[:50] if version else "Unknown"
            }
        )
    
    except Exception as e:
        # Handle database-specific errors
        handle_connection_error(request.database_type, e)
```

---

### Phase 2: Query Abstraction Layer (8-10 hours)

#### 2.1 Create Schema Query Abstraction
**File:** `backend/utils/schema_queries.py` (NEW)

```python
"""Database-specific queries for schema discovery and analysis"""

# LIST TABLES
GET_TABLES_QUERIES = {
    "postgresql": """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema=$1 AND table_type='BASE TABLE'
        ORDER BY table_name
    """,
    "sqlserver": """
        SELECT name 
        FROM sys.tables 
        WHERE schema_id = SCHEMA_ID(@schema) 
        ORDER BY name
    """
}

# GET TABLE COLUMNS AND PRIMARY KEY INFO
GET_COLUMNS_QUERIES = {
    "postgresql": """
        SELECT 
            c.column_name, 
            c.data_type,
            c.is_nullable,
            (SELECT COUNT(*) > 0 FROM information_schema.table_constraints tc
             JOIN information_schema.key_column_usage kcu 
             ON tc.constraint_name = kcu.constraint_name
             WHERE tc.table_name=$1 AND kcu.column_name=c.column_name 
             AND tc.constraint_type='PRIMARY KEY') as is_pk
        FROM information_schema.columns c
        WHERE c.table_name=$1
        ORDER BY c.ordinal_position
    """,
    "sqlserver": """
        SELECT 
            col.name as column_name,
            TYPE_NAME(col.system_type_id) as data_type,
            col.is_nullable,
            ISNULL(ind.is_primary_key, 0) as is_pk
        FROM sys.columns col
        LEFT JOIN sys.index_columns ic ON col.object_id = ic.object_id AND col.column_id = ic.column_id
        LEFT JOIN sys.indexes ind ON ic.object_id = ind.object_id AND ic.index_id = ind.index_id
        WHERE col.object_id = OBJECT_ID(@table_name)
        ORDER BY col.column_id
    """
}

# COUNT ROWS IN TABLE
COUNT_ROWS_QUERIES = {
    "postgresql": "SELECT COUNT(*) FROM {table_name}",
    "sqlserver": "SELECT COUNT(*) FROM {table_name}"  # Same but slower on SQL Server
}

# DATA QUALITY - NULL COUNT
GET_NULL_COUNTS = {
    "postgresql": """
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN {col_name} IS NOT NULL THEN 1 END) as filled
        FROM {table_name}
    """,
    "sqlserver": """
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN {col_name} IS NOT NULL THEN 1 END) as filled
        FROM {table_name}
    """
}

class SchemaQueryBuilder:
    """Build database-specific queries"""
    
    def __init__(self, db_type: str):
        self.db_type = db_type
    
    def get_tables_query(self) -> tuple[str, list]:
        """Returns query and parameter placeholder"""
        if self.db_type == "postgresql":
            return GET_TABLES_QUERIES["postgresql"], ["schema_name"]
        elif self.db_type == "sqlserver":
            return GET_TABLES_QUERIES["sqlserver"], ["@schema"]
    
    def get_columns_query(self) -> str:
        return GET_COLUMNS_QUERIES.get(self.db_type)
    
    def count_rows_query(self, table_name: str) -> str:
        query = COUNT_ROWS_QUERIES.get(self.db_type)
        return query.format(table_name=table_name)
```

#### 2.2 Update Routes to Use Query Builder
**Files to modify:**
- `backend/routes/tables.py`
- `backend/routes/chat.py`
- `backend/routes/chat_stream.py`
- `backend/routes/export.py`
- `backend/routes/dashboard.py`

**Example - tables.py:**
```python
# BEFORE (lines 31-35):
query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema=$1 AND table_type='BASE TABLE'
    ORDER BY table_name
"""

# AFTER:
from utils.schema_queries import SchemaQueryBuilder

db_type = get_connection_db_type(connection_id)
builder = SchemaQueryBuilder(db_type)
query, params = builder.get_tables_query()
# Use query and params in database call
```

#### 2.3 Data Type Mapping
**File:** `backend/utils/type_mapping.py` (NEW)

```python
"""Map database-specific types to common types"""

TYPE_MAPPINGS = {
    "postgresql": {
        "integer": "INTEGER",
        "character varying": "VARCHAR",
        "text": "TEXT",
        "boolean": "BOOLEAN",
        "timestamp without time zone": "DATETIME",
        "numeric": "DECIMAL",
    },
    "sqlserver": {
        "int": "INTEGER",
        "varchar": "VARCHAR",
        "nvarchar": "VARCHAR",
        "text": "TEXT",
        "ntext": "TEXT",
        "bit": "BOOLEAN",
        "datetime": "DATETIME",
        "datetime2": "DATETIME",
        "decimal": "DECIMAL",
        "numeric": "DECIMAL",
    }
}

def normalize_type(db_type: str, column_type: str) -> str:
    """Normalize database-specific type to common type"""
    mapping = TYPE_MAPPINGS.get(db_type, {})
    return mapping.get(column_type.lower(), column_type)
```

---

### Phase 3: Frontend Updates (2-3 hours)

#### 3.1 Enable SQL Server in Database Selector
**File:** `app/connect-database/page.tsx`

```typescript
// BEFORE (lines 63-81):
const databaseOptions = [
  { value: "postgresql", label: "PostgreSQL", status: "Fully Supported", enabled: true },
  { value: "snowflake", label: "Snowflake", status: "Coming Soon", enabled: false },
  { value: "sqlserver", label: "SQL Server", status: "Coming Soon", enabled: false }
]

// AFTER:
const databaseOptions = [
  { value: "postgresql", label: "PostgreSQL", status: "Fully Supported", enabled: true },
  { value: "sqlserver", label: "SQL Server", status: "Fully Supported", enabled: true },  // ENABLED
  { value: "snowflake", label: "Snowflake", status: "Coming Soon", enabled: false }
]

// Port mapping (ADD after line 42):
const DEFAULT_PORTS = {
  postgresql: 5432,
  sqlserver: 1433,
  snowflake: 443
}

// Update handleDatabaseTypeSelect (lines 99-107):
const handleDatabaseTypeSelect = (type: DatabaseType) => {
  if (!databaseOptions.find(opt => opt.value === type)?.enabled) return
  setFormData((prev) => ({
    ...prev,
    databaseType: type,
    port: String(DEFAULT_PORTS[type])  // Auto-set port
  }))
  setStep("credentials")
}
```

#### 3.2 Add Database Type to Connection Request
**File:** `app/connect-database/page.tsx`

```typescript
// UPDATE handleSubmit (line 145):
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/connect-db`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    database_type: formData.databaseType,  // ADD THIS LINE
    host: formData.host,
    port: parseInt(formData.port),
    user: formData.username,
    password: formData.password,
    database: formData.databaseName,
    schema_filter: formData.schemaFilter || "public",
  }),
})
```

#### 3.3 Update Dashboard Display
**File:** `app/dashboard/page.tsx` (dashboard.py on backend too)

```typescript
// Show database type badge (currently hardcoded to "PostgreSQL")
// UPDATE line showing connection type:
<p className="text-sm text-gray-400">
  {conn.database_type === "postgresql" && "PostgreSQL"}
  {conn.database_type === "sqlserver" && "SQL Server"}
  • {conn.database} • {conn.host}:{conn.port}
</p>
```

**Backend - dashboard.py (line 75):**
```python
# BEFORE:
type="PostgreSQL"

# AFTER:
type=conn_data.get("database_type", "PostgreSQL").capitalize()
```

---

### Phase 4: Testing & Validation (3-4 hours)

#### 4.1 Create Test Suite
**File:** `backend/test_integration_multidb.py` (NEW)

```python
"""Integration tests for PostgreSQL and SQL Server"""

import httpx
import pytest

@pytest.mark.asyncio
async def test_postgresql_connection():
    """Test PostgreSQL connection"""
    response = await client.post("/api/connect-db", json={
        "database_type": "postgresql",
        "host": "localhost",
        "port": 5432,
        "user": "postgres",
        "password": "password",
        "database": "company_sales"
    })
    assert response.status_code == 200
    assert "connection_id" in response.json()

@pytest.mark.asyncio
async def test_sqlserver_connection():
    """Test SQL Server connection"""
    response = await client.post("/api/connect-db", json={
        "database_type": "sqlserver",
        "host": "localhost",
        "port": 1433,
        "user": "sa",
        "password": "Password123!",
        "database": "master"
    })
    assert response.status_code == 200
    assert "connection_id" in response.json()

@pytest.mark.asyncio
async def test_multidb_tables_query():
    """Test querying tables from both databases"""
    # Connect to PostgreSQL
    pg_response = await client.post("/api/connect-db", json={...})
    pg_conn_id = pg_response.json()["connection_id"]
    
    # Connect to SQL Server
    ss_response = await client.post("/api/connect-db", json={...})
    ss_conn_id = ss_response.json()["connection_id"]
    
    # Query tables from PostgreSQL
    pg_tables = await client.get(f"/api/tables?connection_id={pg_conn_id}")
    assert len(pg_tables.json()["tables"]) > 0
    
    # Query tables from SQL Server
    ss_tables = await client.get(f"/api/tables?connection_id={ss_conn_id}")
    assert len(ss_tables.json()["tables"]) > 0

@pytest.mark.asyncio
async def test_schema_extraction_both_dbs():
    """Verify schema extraction works for both databases"""
    # Test table schema from PostgreSQL
    pg_schema = await client.get(f"/api/schema/customers?connection_id={pg_conn_id}")
    assert "columns" in pg_schema.json()
    assert len(pg_schema.json()["columns"]) > 0
    
    # Test table schema from SQL Server
    ss_schema = await client.get(f"/api/schema/customers?connection_id={ss_conn_id}")
    assert "columns" in ss_schema.json()
    assert len(ss_schema.json()["columns"]) > 0
```

#### 4.2 Manual Test Checklist
- [ ] Connect to PostgreSQL database
- [ ] Connect to SQL Server database simultaneously
- [ ] Query tables from PostgreSQL
- [ ] Query tables from SQL Server
- [ ] Export table documentation from PostgreSQL
- [ ] Export table documentation from SQL Server
- [ ] Test schema switching (activate different connection)
- [ ] Test chat queries on both databases
- [ ] Test data quality metrics for both DBs
- [ ] Test with multiple tables
- [ ] Test with special characters in names
- [ ] Test with case-sensitive SQL Server schema names

---

## Detailed File Changes Summary

### Backend Files

| File | Changes | Lines | Priority |
|------|---------|-------|----------|
| `routes/connection.py` | Add db_type to model, use factory | 52-59, 122-131 | P1 |
| `routes/tables.py` | Use query builder for all queries | 31-80, 132-135 | P2 |
| `routes/export.py` | Use query builder | 25-28 | P2 |
| `routes/chat.py` | Use query builder | 28-44 | P2 |
| `routes/chat_stream.py` | Use query builder | 34-55 | P2 |
| `routes/dashboard.py` | Use query builder, show DB type | 62-66, 75 | P2 |
| `utils/pool_factory.py` | NEW - pool creation factory | - | P1 |
| `utils/db_test_queries.py` | NEW - test queries | - | P1 |
| `utils/schema_queries.py` | NEW - query abstraction | - | P2 |
| `utils/type_mapping.py` | NEW - type normalization | - | P2 |
| `test_integration_multidb.py` | NEW - multiDB tests | - | P4 |

### Frontend Files

| File | Changes | Lines | Priority |
|------|---------|-------|----------|
| `app/connect-database/page.tsx` | Enable SQL Server, add port map, add db_type | 63-107, 145 | P3 |
| `app/dashboard/page.tsx` | Show DB type in connection info | N/A | P3 |
| `lib/api-client.ts` | Add databaseType to connectDatabase | 115-127 | P3 |

### Configuration Files

| File | Changes | Notes |
|------|---------|-------|
| `backend/requirements.txt` | Add aioodbc, pyodbc | SQL Server support |
| `.env.example` | Add SQL Server optional settings | ODBC driver info |

---

## Dependencies & Requirements

### Backend Dependencies
```
asyncpg==0.29.0          # Already installed (PostgreSQL)
aioodbc==4.0.7          # NEW (SQL Server async)
pyodbc==5.1.1           # NEW (SQL Server ODBC)
```

### System Requirements
- SQL Server ODBC Driver 17 or 18 (for Linux/macOS)
  - Ubuntu: `sudo apt-get install odbc-mssql`
  - macOS: `brew install msodbcsql`
  - Windows: Built-in

### Optional
- SQL Server Express 2019+ for testing (or use existing server)

---

## Risk Assessment

### High Risk Items
1. **SQL Server Query Syntax Differences**
   - `sys` tables vs `information_schema`
   - Parameter placeholders (@param vs $1)
   - MITIGATION: Comprehensive schema_queries.py abstraction

2. **Data Type Mapping Issues**
   - Different type names across databases
   - MITIGATION: Use type_mapping.py abstraction

3. **Connection Pooling Differences**
   - asyncpg vs aioodbc behavior
   - MITIGATION: Test extensively, create pool_factory

### Medium Risk Items
1. **Error Handling Mismatch**
   - Different exception types per database
   - MITIGATION: Create error handler abstraction

2. **Schema Naming Differences**
   - PostgreSQL: `schema.table`
   - SQL Server: `database.schema.table`
   - MITIGATION: Track db_type and schema_filter carefully

### Low Risk Items
1. **Frontend Changes**
   - Mostly cosmetic (enable button, add port)
   - Limited test surface

---

## Success Criteria

- ✅ Can connect to both PostgreSQL and SQL Server
- ✅ Can query tables from both databases simultaneously
- ✅ Can extract schema (columns, types, PK info) from both DBs
- ✅ Can export documentation for tables in both DBs
- ✅ Dashboard shows database type for each connection
- ✅ Chat works with both database types
- ✅ Data quality metrics work for both
- ✅ All tests pass (multiDB test suite)
- ✅ No hardcoded PostgreSQL assumptions remain

---

## Timeline & Phases

### Phase 1: Foundation (6-8 hours)
- Create pool_factory.py
- Create db_test_queries.py
- Update connection.py
- **Deliverable:** Can connect to both PostgreSQL and SQL Server

### Phase 2: Query Abstraction (8-10 hours)
- Create schema_queries.py
- Update all route files (tables.py, export.py, chat.py, etc.)
- Create type_mapping.py
- **Deliverable:** Can query both databases

### Phase 3: Frontend (2-3 hours)
- Enable SQL Server in UI
- Add port mapping
- Update forms
- **Deliverable:** User can select SQL Server in UI

### Phase 4: Testing & Validation (3-4 hours)
- Create multiDB test suite
- Manual testing
- Edge case handling
- **Deliverable:** All tests pass, verified working

**Total Estimated Time:** 40-50 hours

---

## Future Enhancements (Post-Implementation)

1. **Snowflake Support**
   - Add snowflake-connector-python
   - Create SQL queries for Snowflake
   - Test schema extraction

2. **MySQL/MariaDB Support**
   - Use aiomysql
   - Query `information_schema` (similar to PostgreSQL)

3. **Oracle Support**
   - Use cx_Oracle
   - Query `user_tables`, `user_tab_columns`

4. **Performance Optimization**
   - Lazy load schema information
   - Cache table metadata
   - Batch queries for large databases

5. **Authentication Enhancements**
   - Windows Authentication for SQL Server
   - Kerberos support
   - SSL/TLS encryption options

---

## Related Documentation

- Current multi-database connection support: See `backend/routes/connection.py`
- API client for frontend: See `lib/api-client.ts`
- Database selector component: See `components/database-selector.tsx`
- Connection state management: See `hooks/useDashboard.ts`

---

## Approval & Sign-Off

**Plan Created:** 2026-02-20
**Status:** Ready for Implementation
**Owner:** Development Team
**Reviewed By:** Architecture Team (pending)

---

*This plan assumes the current PostgreSQL multi-connection implementation is stable and working correctly. Phase 1 should be completed before proceeding to Phase 2.*
