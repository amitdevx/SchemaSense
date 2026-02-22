"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import Link from "next/link"
import { Search, Database, Table2, Columns3, MessageSquare, Download, Loader, BarChart3 } from "lucide-react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useTables, useTableSchema } from "@/hooks/useDatabase"
import { DatabaseSelector } from "@/components/database-selector"
import { api } from "@/lib/api-client"

interface EnhancedTable {
  id: number
  name: string
  columns: number
  rowCount: number | null
  description: string
}

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const { data: tablesData, loading, error } = useTables(selectedConnectionId)
  const [enhancedTables, setEnhancedTables] = useState<EnhancedTable[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const fetchIdRef = useRef(0)
  const connIdRef = useRef<string | null>(null)

  // Keep ref in sync with state
  connIdRef.current = selectedConnectionId

  // Transform API data into table list
  const tables = useMemo(() => {
    if (!tablesData?.tables) return []
    return tablesData.tables.map((tableName, idx) => ({
      id: idx + 1,
      name: tableName,
      columns: 0,
      rowCount: null,
      description: `${tableName} table`
    }))
  }, [tablesData])

  // Fetch schema details in parallel, with cancellation
  useEffect(() => {
    if (!tables.length) {
      setEnhancedTables([])
      return
    }

    const currentFetchId = ++fetchIdRef.current
    const connId = connIdRef.current

    const fetchAllDetails = async () => {
      setLoadingDetails(true)
      setEnhancedTables(tables) // Show table names immediately

      const results = await Promise.all(
        tables.map(async (table) => {
          try {
            const connParam = connId ? `?connection_id=${connId}` : ''
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/schema/${table.name}${connParam}`
            )
            if (response.ok) {
              const data = await response.json()
              return { ...table, columns: data.columns?.length || 0, rowCount: data.row_count || 0 }
            }
          } catch (err) {
            console.error(`Failed to fetch details for ${table.name}:`, err)
          }
          return table
        })
      )

      // Only apply results if this is still the latest fetch
      if (fetchIdRef.current === currentFetchId) {
        setEnhancedTables(results)
        setLoadingDetails(false)
      }
    }

    fetchAllDetails()
  }, [tables])

  const filteredTables = enhancedTables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Breadcrumb items={[{ label: "Analysis" }]} />

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Database Analysis</h1>
            <p className="text-gray-400">Explore your database schema and metadata</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/chat">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Ask AI
              </Button>
            </Link>
            <Link href="/dashboard/exports">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </Link>
          </div>
        </div>

        {/* Database Selector */}
        <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Select Database</label>
          <DatabaseSelector
            selectedConnectionId={selectedConnectionId}
            onSelect={setSelectedConnectionId}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            {error.includes('No database connected') && (
              <Link href="/connect-database">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-8 text-xs">
                  <Database className="w-3 h-3" />
                  Connect
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-white animate-spin" />
            <span className="ml-3 text-gray-400">Loading tables...</span>
          </div>
        )}

        {/* Tables Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-semibold">{tables.length} Tables Found</p>
                  <p className="text-gray-400 text-sm">Connected to your database{loadingDetails ? ' — loading details...' : ''}</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
              />
            </div>

            {/* Tables List */}
            <div className="space-y-4">
              {filteredTables.length > 0 ? (
                filteredTables.map((table) => (
                  <div
                    key={table.id}
                    className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Table2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{table.name}</h3>
                          <p className="text-sm text-gray-400">{table.description}</p>
                          
                          {/* Metadata */}
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Columns3 className="w-4 h-4" />
                              <span>{table.columns} columns</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <BarChart3 className="w-4 h-4" />
                              <span>{table.rowCount !== null ? `${table.rowCount.toLocaleString()} rows` : 'Loading...'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/dashboard/analysis/${table.name}${selectedConnectionId ? `?connectionId=${selectedConnectionId}` : ''}`} className="flex-1">
                        <button className="w-full text-white/70 hover:text-white text-sm font-medium py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                          View Details
                        </button>
                      </Link>
                      <Link href="/dashboard/chat" className="flex-1">
                        <button className="w-full text-white text-sm font-medium py-2 px-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
                          Ask AI
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    {searchQuery ? "No tables found matching your search" : "No tables available. Connect a database to get started."}
                  </p>
                  {!searchQuery && (
                    <Link href="/connect-database">
                      <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2">
                        <Database className="w-4 h-4" />
                        Connect Database
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </>
  )
}
