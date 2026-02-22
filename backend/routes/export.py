from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from datetime import datetime, timezone, timedelta
from typing import Optional
from schemas import ExportResponse
from routes.connection import get_user_db, get_db_pool, get_schema_filter_for
from routes.tables import get_schema, get_data_quality, explain_table
from utils.pdf_generator import generate_table_pdf
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["export"])

@router.get("/export/{table_name}", response_model=ExportResponse)
async def export_documentation(table_name: str, connection_id: Optional[str] = None):
    """Export complete documentation for a table as JSON"""
    try:
        db = get_db_pool(connection_id) if connection_id else get_user_db()
        schema = get_schema_filter_for(connection_id)
        # Validate table exists
        async with db.acquire() as conn:
            tables = await conn.fetch("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema=$1 AND table_type='BASE TABLE'
            """, schema)
            table_names = [t['table_name'] for t in tables]
            
            if table_name not in table_names:
                raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Get all information
        schema_info = await get_schema(table_name, connection_id=connection_id)
        quality = await get_data_quality(table_name, connection_id=connection_id)
        explanation = await explain_table(table_name, connection_id=connection_id)
        
        # Build comprehensive export
        return ExportResponse(
            generated_at=datetime.now(timezone(timedelta(hours=5, minutes=30))),
            table_name=table_name,
            schema={
                "columns": [
                    {
                        "name": col.name,
                        "type": col.type,
                        "nullable": col.nullable,
                        "is_primary_key": col.is_pk
                    }
                    for col in schema_info.columns
                ],
                "row_count": schema_info.row_count
            },
            quality_metrics={
                "total_rows": quality.row_count,
                "average_completeness": quality.average_completeness,
                "quality_grade": quality.quality_grade,
                "columns": {
                    name: {
                        "filled": q.filled_count,
                        "null": q.null_count,
                        "completeness_percent": q.completeness
                    }
                    for name, q in quality.column_quality.items()
                }
            },
            business_context=explanation.business_explanation
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")


@router.get("/export/{table_name}/pdf")
async def export_pdf(table_name: str, connection_id: Optional[str] = None):
    """Export table documentation as a PDF report (reuses cached AI analysis)"""
    try:
        db = get_db_pool(connection_id) if connection_id else get_user_db()
        schema = get_schema_filter_for(connection_id)
        async with db.acquire() as conn:
            tables = await conn.fetch("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema=$1 AND table_type='BASE TABLE'
            """, schema)
            table_names = [t['table_name'] for t in tables]
            if table_name not in table_names:
                raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")

        schema_info = await get_schema(table_name, connection_id=connection_id)
        quality = await get_data_quality(table_name, connection_id=connection_id)
        explanation = await explain_table(table_name, connection_id=connection_id)

        pdf_bytes = generate_table_pdf(
            table_name=table_name,
            schema_info=schema_info,
            quality=quality,
            business_context=explanation.business_explanation,
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{table_name}_report.pdf"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating PDF for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"PDF export error: {str(e)}")
