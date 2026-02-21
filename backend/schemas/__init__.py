from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ===== Auth Schemas =====
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ===== Database Schema Schemas =====
class ColumnSchema(BaseModel):
    name: str
    type: str
    nullable: bool
    is_pk: bool

class TableSchema(BaseModel):
    table_name: str
    columns: List[ColumnSchema]
    row_count: int

class TablesList(BaseModel):
    tables: List[str]
    count: int

# ===== Data Quality Schemas =====
class ColumnQuality(BaseModel):
    filled_count: int
    null_count: int
    completeness: float

class DataQualityMetrics(BaseModel):
    completeness: float
    consistency: float
    validity: float
    accuracy: float
    timeliness: float
    overall_score: float

class TableQuality(BaseModel):
    table_name: str
    row_count: int
    column_count: int
    column_quality: Dict[str, ColumnQuality]
    average_completeness: float
    quality_grade: str
    metrics: DataQualityMetrics

# ===== Explanation Schemas =====
class TableExplanation(BaseModel):
    table_name: str
    business_explanation: str
    timestamp: datetime

# ===== Chat Schemas =====
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)

class ChatResponse(BaseModel):
    question: str
    answer: str
    timestamp: datetime

# ===== Export Schemas =====
class ExportRequest(BaseModel):
    table_name: str

class ExportResponse(BaseModel):
    generated_at: datetime
    table_name: str
    schema: Dict[str, Any]
    quality_metrics: Dict[str, Any]
    business_context: str
