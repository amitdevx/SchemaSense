"""
PDF report generator for table documentation.
Uses fpdf2 to build a styled PDF from schema, quality, and AI analysis data.
"""
import io
import re
from datetime import datetime
from fpdf import FPDF


class _ReportPDF(FPDF):
    """Custom PDF with header/footer branding."""

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "SchemaSense Report", align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(160, 160, 160)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")


def _sanitize(text: str) -> str:
    """Remove characters unsupported by latin-1 encoding."""
    if not text:
        return ""
    return text.encode("latin-1", errors="replace").decode("latin-1")


def generate_table_pdf(table_name: str, schema_info, quality, business_context: str) -> bytes:
    """Build a PDF report and return raw bytes."""
    pdf = _ReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # ── Title ────────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 14, _sanitize(f"{table_name}"), ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ln=True)
    pdf.ln(6)

    # ── Table Structure ──────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "Table Structure", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Row Count: {schema_info.row_count:,}", ln=True)
    pdf.ln(3)

    # Column table header
    col_widths = [55, 45, 30, 30]
    headers = ["Column", "Type", "Nullable", "Primary Key"]
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(240, 240, 240)
    for w, h in zip(col_widths, headers):
        pdf.cell(w, 7, h, border=1, fill=True)
    pdf.ln()

    # Column rows
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(50, 50, 50)
    for col in schema_info.columns:
        pdf.cell(col_widths[0], 7, _sanitize(col.name[:30]), border=1)
        pdf.cell(col_widths[1], 7, _sanitize(col.type[:24]), border=1)
        pdf.cell(col_widths[2], 7, "Yes" if col.nullable else "No", border=1)
        pdf.cell(col_widths[3], 7, "Yes" if col.is_pk else "", border=1)
        pdf.ln()
    pdf.ln(6)

    # ── Data Quality ─────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "Data Quality", ln=True)

    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Quality Grade: {quality.quality_grade}", ln=True)
    pdf.cell(0, 6, f"Average Completeness: {quality.average_completeness}%", ln=True)
    pdf.cell(0, 6, f"Total Rows: {quality.row_count:,}", ln=True)

    if quality.metrics:
        pdf.ln(2)
        metrics = quality.metrics
        metric_items = [
            ("Completeness", metrics.completeness),
            ("Consistency", metrics.consistency),
            ("Validity", metrics.validity),
            ("Accuracy", metrics.accuracy),
            ("Timeliness", metrics.timeliness),
        ]
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(240, 240, 240)
        pdf.cell(50, 7, "Metric", border=1, fill=True)
        pdf.cell(30, 7, "Score", border=1, fill=True)
        pdf.ln()
        pdf.set_font("Helvetica", "", 9)
        for name, val in metric_items:
            pdf.cell(50, 7, name, border=1)
            pdf.cell(30, 7, f"{val}%", border=1)
            pdf.ln()
    pdf.ln(3)

    # Column quality
    if quality.column_quality:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Column Quality", ln=True)
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(240, 240, 240)
        cq_widths = [55, 30, 30, 35]
        for w, h in zip(cq_widths, ["Column", "Filled", "Null", "Completeness"]):
            pdf.cell(w, 7, h, border=1, fill=True)
        pdf.ln()
        pdf.set_font("Helvetica", "", 9)
        for col_name, cq in quality.column_quality.items():
            pdf.cell(cq_widths[0], 7, _sanitize(col_name[:30]), border=1)
            pdf.cell(cq_widths[1], 7, f"{cq.filled_count:,}", border=1)
            pdf.cell(cq_widths[2], 7, f"{cq.null_count:,}", border=1)
            pdf.cell(cq_widths[3], 7, f"{cq.completeness}%", border=1)
            pdf.ln()
    pdf.ln(6)

    # ── Business Context (AI Analysis) ───────────────────────────────────
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "Business Context (AI Analysis)", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(50, 50, 50)

    if business_context:
        # Render markdown-like text: handle bold, headings, bullets
        for line in business_context.split("\n"):
            stripped = line.strip()
            if not stripped:
                pdf.ln(3)
                continue
            if stripped.startswith("### "):
                pdf.set_font("Helvetica", "B", 11)
                pdf.multi_cell(0, 6, _sanitize(stripped[4:]))
                pdf.set_font("Helvetica", "", 10)
            elif stripped.startswith("## "):
                pdf.set_font("Helvetica", "B", 12)
                pdf.multi_cell(0, 6, _sanitize(stripped[3:]))
                pdf.set_font("Helvetica", "", 10)
            elif stripped.startswith("# "):
                pdf.set_font("Helvetica", "B", 13)
                pdf.multi_cell(0, 6, _sanitize(stripped[2:]))
                pdf.set_font("Helvetica", "", 10)
            elif stripped.startswith("- ") or stripped.startswith("* "):
                # Render bold fragments inside bullets
                _render_mixed(pdf, f"  {chr(8226)} {stripped[2:]}")
            else:
                _render_mixed(pdf, stripped)
    else:
        pdf.multi_cell(0, 6, "No business context available.")

    # Output
    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()


def _render_mixed(pdf: FPDF, text: str):
    """Render a line that may contain **bold** fragments."""
    parts = re.split(r"(\*\*[^*]+\*\*)", text)
    for part in parts:
        if part.startswith("**") and part.endswith("**"):
            pdf.set_font("Helvetica", "B", 10)
            pdf.write(6, _sanitize(part[2:-2]))
            pdf.set_font("Helvetica", "", 10)
        else:
            pdf.write(6, _sanitize(part))
    pdf.ln(6)
