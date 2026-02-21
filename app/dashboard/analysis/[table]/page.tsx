"use client"


import Link from "next/link"
import { ArrowLeft, Loader, AlertCircle, MessageSquare, BarChart3, Users, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useDataQuality, useTableSchema, useSampleData, useTableExplanation } from "@/hooks/useDatabase"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface TableDetailsPageProps {
  params: {
    table: string
  }
}

export default function AnalysisTablePage({ params }: TableDetailsPageProps) {
  const [tableName, setTableName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paramError, setParamError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const connectionId = searchParams.get('connectionId')

  useEffect(() => {
    try {
      if (params && params.table) {
        setTableName(decodeURIComponent(params.table))
      } else {
        setParamError("Invalid table name in URL")
      }
    } catch (err) {
      console.error("Error loading params:", err)
      setParamError("Failed to load page parameters")
    } finally {
      setIsLoading(false)
    }
  }, [params])

  const { data: qualityData, loading: qualityLoading, error: qualityError } = useDataQuality(tableName, connectionId)
  const { data: schemaData, loading: schemaLoading } = useTableSchema(tableName, connectionId)
  const { data: samplesData, loading: samplesLoading } = useSampleData(tableName, 5, connectionId)
  const { data: explanationData, loading: explanationLoading } = useTableExplanation(tableName, connectionId)

  const getMetricColor = (value: number) => {
    if (value >= 90) return "text-green-400"
    if (value >= 75) return "text-blue-400"
    if (value >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getMetricBg = (value: number) => {
    if (value >= 90) return "bg-green-400/10 border-green-400/30"
    if (value >= 75) return "bg-blue-400/10 border-blue-400/30"
    if (value >= 60) return "bg-yellow-400/10 border-yellow-400/30"
    return "bg-red-400/10 border-red-400/30"
  }

  if (isLoading) {
    return (
      
        <div className="flex items-center justify-center py-24">
          <Loader className="w-8 h-8 text-white animate-spin" />
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      
    )
  }

  if (paramError || !tableName) {
    return (
      
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">{paramError || "Invalid table name"}</p>
          <Link href="/dashboard/analysis">
            <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white">
              Back to Analysis
            </Button>
          </Link>
        </div>
      
    )
  }

  const SectionSpinner = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 py-8 justify-center">
      <Loader className="w-5 h-5 text-white animate-spin" />
      <span className="text-gray-400 text-sm">{text}</span>
    </div>
  )

  return (
    <>
      {/* Header - always visible */}
      <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/analysis" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <nav className="flex gap-2 text-sm text-gray-400">
              <Link href="/dashboard/analysis" className="hover:text-white">Analysis</Link>
              <span>/</span>
              <span className="text-white">{tableName}</span>
            </nav>
          </div>
        </div>

        {/* Error State */}
        {qualityError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{qualityError}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Title Section - always visible */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{tableName}</h1>
              <p className="text-gray-400">Table Data Quality Analysis</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/chat">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ask AI
                </Button>
              </Link>
              <Link href={`/dashboard/exports?table=${tableName}${connectionId ? `&connectionId=${connectionId}` : ''}`}>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                  Export
                </Button>
              </Link>
            </div>
          </div>

          {/* Quality Overview Cards */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6">
            {qualityLoading ? (
              <SectionSpinner text="Loading quality metrics..." />
            ) : qualityData?.metrics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div className={`rounded-lg border p-6 ${getMetricBg(qualityData.metrics.completeness || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Completeness</p>
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className={`text-3xl font-bold ${getMetricColor(qualityData.metrics.completeness || 0)}`}>
                      {qualityData.metrics.completeness || 0}%
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Data completeness score</p>
                  </div>

                  <div className={`rounded-lg border p-6 ${getMetricBg(qualityData.metrics.consistency || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Consistency</p>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className={`text-3xl font-bold ${getMetricColor(qualityData.metrics.consistency || 0)}`}>
                      {qualityData.metrics.consistency || 0}%
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Data uniformity level</p>
                  </div>

                  <div className={`rounded-lg border p-6 ${getMetricBg(qualityData.metrics.validity || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Validity</p>
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className={`text-3xl font-bold ${getMetricColor(qualityData.metrics.validity || 0)}`}>
                      {qualityData.metrics.validity || 0}%
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Valid format compliance</p>
                  </div>

                  <div className={`rounded-lg border p-6 ${getMetricBg(qualityData.metrics.accuracy || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Accuracy</p>
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className={`text-3xl font-bold ${getMetricColor(qualityData.metrics.accuracy || 0)}`}>
                      {qualityData.metrics.accuracy || 0}%
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Data accuracy measure</p>
                  </div>

                  <div className={`rounded-lg border p-6 ${getMetricBg(qualityData.metrics.timeliness || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Timeliness</p>
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className={`text-3xl font-bold ${getMetricColor(qualityData.metrics.timeliness || 0)}`}>
                      {qualityData.metrics.timeliness || 0}%
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Data recency score</p>
                  </div>
                </div>

                {/* Overall Score & Grade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-300 mb-3">Overall Quality Score</p>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className={`text-5xl font-bold ${getMetricColor(qualityData.metrics.overall_score || 0)}`}>
                          {qualityData.metrics.overall_score || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">/100</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (qualityData.metrics.overall_score || 0) >= 90 ? 'bg-green-400' :
                              (qualityData.metrics.overall_score || 0) >= 75 ? 'bg-blue-400' :
                              (qualityData.metrics.overall_score || 0) >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${qualityData.metrics.overall_score || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-300 mb-3">Quality Grade</p>
                    <div className="space-y-2">
                      <p className={`text-5xl font-bold ${
                        qualityData.quality_grade === 'Excellent' ? 'text-green-400' :
                        qualityData.quality_grade === 'Good' ? 'text-blue-400' :
                        qualityData.quality_grade === 'Fair' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {qualityData.quality_grade || 'N/A'}
                      </p>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {qualityData.quality_grade === 'Excellent' && <span className="px-3 py-1 rounded-full bg-green-400/20 border border-green-400/30 text-xs text-green-300">Excellent Data Quality</span>}
                        {qualityData.quality_grade === 'Good' && <span className="px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-xs text-blue-300">Good Data Quality</span>}
                        {qualityData.quality_grade === 'Fair' && <span className="px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-xs text-yellow-300">Fair Data Quality</span>}
                        {qualityData.quality_grade === 'Poor' && <span className="px-3 py-1 rounded-full bg-red-400/20 border border-red-400/30 text-xs text-red-300">Poor Data Quality</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-300 mb-2">Total Rows</p>
                    <p className="text-3xl font-bold text-white">{qualityData.row_count ? qualityData.row_count.toLocaleString() : 0}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-300 mb-2">Columns</p>
                    <p className="text-3xl font-bold text-white">{qualityData.column_count || schemaData?.columns?.length || 0}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-300 mb-2">Average Completeness</p>
                    <p className="text-3xl font-bold text-white">{qualityData.average_completeness || 0}%</p>
                  </div>
                </div>

                {/* Column Quality Details */}
                {qualityData.column_quality && Object.keys(qualityData.column_quality).length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6">Column Quality Breakdown</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(qualityData.column_quality).map(([columnName, quality]: [string, any]) => {
                        const completeness = quality?.completeness ?? 0
                        const filledCount = quality?.filled_count ?? 0
                        const nullCount = quality?.null_count ?? 0
                        
                        return (
                          <div key={columnName} className="border border-white/10 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <p className="font-medium text-white">{columnName}</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                completeness >= 95 ? 'bg-green-400/20 text-green-300' :
                                completeness >= 80 ? 'bg-blue-400/20 text-blue-300' :
                                completeness >= 60 ? 'bg-yellow-400/20 text-yellow-300' :
                                'bg-red-400/20 text-red-300'
                              }`}>
                                {completeness}%
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-400">
                              <p>Filled: {filledCount.toLocaleString()} | Null: {nullCount.toLocaleString()}</p>
                            </div>
                            <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  completeness >= 95 ? 'bg-green-400' :
                                  completeness >= 80 ? 'bg-blue-400' :
                                  completeness >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${completeness}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No quality data available</p>
            )}
          </div>

          {/* Schema Information */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Table Schema</h3>
            {schemaLoading ? (
              <SectionSpinner text="Loading schema..." />
            ) : schemaData?.columns && schemaData.columns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Column Name</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Nullable</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Primary Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemaData.columns.map((column: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{column.name}</td>
                        <td className="py-3 px-4 text-gray-400"><code className="text-yellow-300">{column.type}</code></td>
                        <td className="py-3 px-4 text-gray-400">
                          {column.nullable ? (
                            <span className="px-2 py-1 rounded bg-yellow-400/20 text-yellow-300 text-xs">Yes</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-blue-400/20 text-blue-300 text-xs">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {column.is_pk ? (
                            <span className="px-2 py-1 rounded bg-green-400/20 text-green-300 text-xs">🔑 Yes</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No schema data available</p>
            )}
          </div>

          {/* Sample Data Preview */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Sample Data Preview</h3>
            {samplesLoading ? (
              <SectionSpinner text="Loading sample data..." />
            ) : samplesData?.samples && Array.isArray(samplesData.samples) && samplesData.samples.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {Object.keys(samplesData.samples[0] || {}).map((key) => (
                        <th key={key} className="text-left py-3 px-4 text-gray-300 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {samplesData.samples.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {Object.values(row || {}).map((value: any, colIdx: number) => (
                          <td key={colIdx} className="py-3 px-4 text-gray-400">
                            {value === null || value === undefined ? <span className="text-gray-600 italic">null</span> : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No sample data available</p>
            )}
          </div>

          {/* Business Explanation - loads independently */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">About This Table</h3>
            {explanationLoading ? (
              <div className="flex items-center gap-3 py-6">
                <Loader className="w-5 h-5 text-white animate-spin" />
                <span className="text-gray-400">Generating AI analysis...</span>
              </div>
            ) : explanationData?.business_explanation ? (
              <MarkdownRenderer content={explanationData.business_explanation} className="text-gray-300" />
            ) : (
              <p className="text-gray-500 italic">No AI analysis available for this table.</p>
            )}
          </div>
        </div>
      </>
  )
}
