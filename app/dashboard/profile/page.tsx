"use client"

import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Database, Server, Hash, User, Key, Filter, Loader, RefreshCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useConnections, ConnectionItem } from "@/hooks/useDashboard"
import Link from "next/link"
import { formatISTDate } from "@/lib/utils"

export default function DatabaseSettingsPage() {
  const { data: connections, activeId, loading, refetch, activateConnection, removeConnection } = useConnections()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ConnectionItem>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleActivate = async (id: string) => {
    setActionLoading(id)
    try {
      await activateConnection(id)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this database connection?")) return
    setActionLoading(id)
    try {
      await removeConnection(id)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Database Settings" }]} />
        <div className="text-center py-12">
          <Loader className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">Loading database settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Database Settings" }]} />

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Database Settings</h1>
        <p className="text-gray-400">Manage your connected databases, view connection details, and configure settings</p>
      </div>

      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link href="/connect-database">
            <Button className="bg-white hover:bg-gray-200 text-black font-semibold">
              <Database className="w-4 h-4 mr-2" />
              Add New Database
            </Button>
          </Link>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {connections.length === 0 ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-12 text-center">
            <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No databases connected</h3>
            <p className="text-gray-400 mb-6">Connect your first database to get started with schema analysis</p>
            <Link href="/connect-database">
              <Button className="bg-white hover:bg-gray-200 text-black font-semibold">
                Connect Database
              </Button>
            </Link>
          </div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className={`bg-gradient-to-br from-white/10 to-white/5 border rounded-xl p-6 transition-all duration-300 ${
                conn.id === activeId
                  ? "border-green-500/50 hover:border-green-500/70"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              {/* Connection Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    conn.id === activeId ? "bg-green-500/20" : "bg-white/10"
                  }`}>
                    <Database className={`w-5 h-5 ${conn.id === activeId ? "text-green-400" : "text-white"}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{conn.database}</h3>
                    <p className="text-sm text-gray-400">
                      {conn.database_type || "postgresql"} • Connected {formatISTDate(conn.connected_at)}
                    </p>
                  </div>
                  {conn.id === activeId && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {conn.id !== activeId && (
                    <Button
                      onClick={() => handleActivate(conn.id)}
                      disabled={actionLoading === conn.id}
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      {actionLoading === conn.id ? <Loader className="w-3 h-3 animate-spin" /> : "Set Active"}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleRemove(conn.id)}
                    disabled={actionLoading === conn.id}
                    size="sm"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Connection Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Server className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Host</p>
                    <p className="text-sm text-white font-mono">{conn.host}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Port</p>
                    <p className="text-sm text-white font-mono">{conn.port}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Database className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Database Name</p>
                    <p className="text-sm text-white font-mono">{conn.database}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="text-sm text-white font-mono">{conn.name || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Password</p>
                    <p className="text-sm text-white font-mono">••••••••</p>
                  </div>
                </div>
                {conn.schema_filter && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Schema Filter</p>
                      <p className="text-sm text-white font-mono">{conn.schema_filter}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Connection ID */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  Connection ID: <span className="font-mono text-gray-400">{conn.id}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
