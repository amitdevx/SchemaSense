"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Download, FileJson, FileText, File, Trash2, Clock, Loader } from "lucide-react"
import { useState, useEffect } from "react"
import { useTables } from "@/hooks/useDatabase"
import { useConnections } from "@/hooks/useDashboard"
import { DatabaseSelector } from "@/components/database-selector"
import { api } from "@/lib/api-client"

export default function ExportsPage() {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const { data: tablesData, loading } = useTables(selectedConnectionId)
  const [exporting, setExporting] = useState<string | null>(null)

  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async (tableName: string, format: 'json' | 'markdown' | 'pdf') => {
    setExporting(`${tableName}-${format}`)
    setExportError(null)
    try {
      if (format === 'pdf') {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const connParam = selectedConnectionId ? `?connection_id=${selectedConnectionId}` : ''
        const res = await fetch(`${baseUrl}/api/export/${tableName}/pdf${connParam}`, {
          headers: {
            ...(typeof window !== 'undefined' && localStorage.getItem('auth_token')
              ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
              : {}),
          },
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'PDF export failed' }))
          throw new Error(err.detail || 'PDF export failed')
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tableName}_report.pdf`
        a.click()
        URL.revokeObjectURL(url)
        return
      }

      const data = await api.exportTable(tableName, selectedConnectionId || undefined)
      
      let content: string
      let filename: string
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2)
        filename = `${tableName}_schema.json`
      } else {
        // Generate markdown
        const md = [
          `# ${data.table_name} Schema Documentation`,
          `Generated: ${new Date(data.generated_at).toLocaleString()}`,
          '',
          '## Table Structure',
          `**Row Count:** ${data.schema?.row_count || 0}`,
          '',
          '### Columns',
          ...(data.schema?.columns || []).map((col: any) => 
            `- **${col.name}** (${col.type})${col.is_primary_key ? ' [PRIMARY KEY]' : ''}${!col.nullable ? ' [NOT NULL]' : ''}`
          ),
          '',
          '## Data Quality',
          `**Quality Grade:** ${data.quality_metrics?.quality_grade || 'N/A'}`,
          `**Average Completeness:** ${data.quality_metrics?.average_completeness || 0}%`,
          `**Total Rows:** ${data.quality_metrics?.total_rows || 0}`,
          '',
          '### Column Quality',
          ...(data.quality_metrics?.columns ? Object.entries(data.quality_metrics.columns).map(([colName, metrics]: [string, any]) =>
            `- **${colName}**: ${metrics?.completeness_percent?.toFixed(1) || 0}% complete (${metrics?.filled || 0} filled, ${metrics?.null || 0} null)`
          ) : []),
          '',
          '## Business Context',
          data.business_context || 'No business context available',
        ].join('\n')
        content = md
        filename = `${tableName}_schema.md`
      }
      
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Export error:', err)
      setExportError(err?.message || 'Failed to export. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  return (
    
      <div>
        <Breadcrumb items={[{ label: "Exports" }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Exports</h1>
          <p className="text-gray-400">Export and download your table documentation</p>
        </div>

        {/* Database Selector */}
        <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Select Database</label>
          <DatabaseSelector
            selectedConnectionId={selectedConnectionId}
            onSelect={setSelectedConnectionId}
          />
        </div>

        {/* Export Error */}
        {exportError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
            <p className="text-red-400 text-sm">{exportError}</p>
            <button onClick={() => setExportError(null)} className="text-red-400 hover:text-red-300 text-sm ml-4">✕</button>
          </div>
        )}

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 text-left group cursor-default">
            <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
              <FileJson className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">JSON Export</h3>
            <p className="text-sm text-gray-400">Structured data format for integrations</p>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 text-left group cursor-default">
            <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Markdown Export</h3>
            <p className="text-sm text-gray-400">Documentation-ready format</p>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 text-left group cursor-default">
            <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
              <File className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">PDF Report</h3>
            <p className="text-sm text-gray-400">Formatted PDF with schema, quality & AI analysis</p>
          </div>
        </div>

        {/* Tables for Export */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {loading ? "Loading tables..." : "Available Tables for Export"}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 text-white animate-spin" />
            </div>
          ) : tablesData?.tables && tablesData.tables.length > 0 ? (
            <div className="space-y-3">
              {tablesData.tables.map((table) => (
                <div
                  key={table}
                  className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FileJson className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{table}</h3>
                      <p className="text-sm text-gray-400">Table schema and documentation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleExport(table, 'json')}
                      disabled={exporting === `${table}-json`}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-9"
                    >
                      {exporting === `${table}-json` ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      JSON
                    </Button>
                    <Button
                      onClick={() => handleExport(table, 'markdown')}
                      disabled={exporting === `${table}-markdown`}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-9"
                    >
                      {exporting === `${table}-markdown` ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      MD
                    </Button>
                    <Button
                      onClick={() => handleExport(table, 'pdf')}
                      disabled={exporting === `${table}-pdf`}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-9"
                    >
                      {exporting === `${table}-pdf` ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <File className="w-4 h-4" />
                      )}
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-4">No tables available. Connect a database to get started.</p>
              <a href="/connect-database">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2">
                  <Download className="w-4 h-4" />
                  Connect Database
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    
  )
}
