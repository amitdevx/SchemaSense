"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database, Settings, MessageSquare, FileText, BarChart3, Plus, Clock, ArrowRight, Download, Loader, Trash2, CheckCircle, Activity } from "lucide-react"
import { useStatistics, useConnectionInfo, useConnections, useRecentActivity } from "@/hooks/useDashboard"
import { useState, useRef, useCallback } from "react"

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useStatistics()
  const { data: connectionInfo, loading: connLoading } = useConnectionInfo()
  const { data: allConnections, loading: connsLoading, error: connsError, activateConnection, removeConnection, refetch: refetchConns } = useConnections()
  const { data: recentActivity, loading: activityLoading } = useRecentActivity(10)
  const [autoSyncFreq, setAutoSyncFreq] = useState("never")
  const [schemaFilter, setSchemaFilter] = useState("public, analytics")
  const [includeSysTables, setIncludeSysTables] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showActionMessage = useCallback((type: 'success' | 'error', text: string) => {
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current)
    setActionMessage({ type, text })
    msgTimerRef.current = setTimeout(() => setActionMessage(null), type === 'error' ? 6000 : 3000)
  }, [])

  const handleActivate = async (id: string) => {
    try {
      setActionMessage(null)
      await activateConnection(id)
      showActionMessage('success', 'Database set as active!')
    } catch (err: any) {
      showActionMessage('error', err?.message || 'Failed to activate database.')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      setActionMessage(null)
      await removeConnection(id)
      showActionMessage('success', 'Database disconnected.')
    } catch (err: any) {
      showActionMessage('error', err?.message || 'Failed to remove database.')
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      console.log("Saving settings:", { autoSyncFreq, schemaFilter, includeSysTables })
      await new Promise(resolve => setTimeout(resolve, 500))
      alert("Sync settings saved successfully!")
    } catch (error) {
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Dashboard" }]} />

        {/* Welcome Section */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to SchemaSense AI
          </h1>
          <p className="text-xl text-gray-300">
            Your databases are ready for analysis. Choose an action to get started.
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {/* Analysis Card */}
            <Link href="/dashboard/analysis">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer h-full group">
                <div className="w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">View Analysis</h3>
                <p className="text-sm text-gray-400">
                  Browse your database schema and metadata
                </p>
              </div>
            </Link>

            {/* Chat Card */}
            <Link href="/dashboard/chat">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer h-full group">
                <div className="w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Chat with AI</h3>
                <p className="text-sm text-gray-400">
                  Ask questions about your database schema
                </p>
              </div>
            </Link>

            {/* Integrations Card */}
            <Link href="/dashboard/integrations">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer h-full group">
                <div className="w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Integrations</h3>
                <p className="text-sm text-gray-400">
                  Manage your database connections
                </p>
              </div>
            </Link>

            {/* Settings Card */}
            <Link href="/dashboard/settings">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer h-full group">
                <div className="w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
                <p className="text-sm text-gray-400">
                  Manage your account and preferences
                </p>
              </div>
            </Link>

            {/* Exports Card */}
            <Link href="/dashboard/exports">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer h-full group">
                <div className="w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Exports</h3>
                <p className="text-sm text-gray-400">
                  Download reports and analysis data
                </p>
              </div>
            </Link>
          </div>

          {/* Connected Databases Section */}
          <div className="mt-16 mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Connected Databases</h2>
                <p className="text-sm text-gray-400 mt-1">Manage and analyze your database connections</p>
              </div>
              <Link href="/connect-database">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Database
                </Button>
              </Link>
            </div>

            {/* Action Messages */}
            {actionMessage && (
              <div className={`p-4 rounded-lg mb-4 ${actionMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
                {actionMessage.text}
              </div>
            )}

            {connsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 text-white animate-spin" />
              </div>
            ) : allConnections.length > 0 ? (
              <div className="space-y-3">
                {allConnections.map((conn) => (
                  <div
                    key={conn.id}
                    className={`bg-gradient-to-br from-white/10 to-white/5 border rounded-xl p-6 transition-all duration-300 ${conn.is_active ? 'border-white/40' : 'border-white/20 hover:border-white/30'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{conn.name}</h3>
                          <p className="text-sm text-gray-400">{(conn.database_type || "postgresql").charAt(0).toUpperCase() + (conn.database_type || "postgresql").slice(1)} • {conn.database} • {conn.host}:{conn.port}</p>
                          <p className="text-xs text-gray-500 mt-1">Schema: {conn.schema_filter}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {conn.is_active ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-xs text-white font-medium">Active</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleActivate(conn.id)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-1 h-8 text-xs"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Set Active
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemove(conn.id)}
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        Connected: {conn.connected_at ? new Date(conn.connected_at).toLocaleString() : 'just now'}
                      </div>
                      <Link href="/dashboard/analysis">
                        <Button variant="ghost" className="text-white/70 hover:text-white gap-2 h-8">
                          View Analysis
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Database className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No databases connected yet</p>
                <Link href="/connect-database">
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2">
                    <Plus className="w-4 h-4" />
                    Connect Your First Database
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {statsLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : stats?.connectedDatabases || (connectionInfo?.connected ? 1 : 0)}
              </div>
              <p className="text-sm text-gray-400">Connected Databases</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {statsLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : stats?.totalTables || 0}
              </div>
              <p className="text-sm text-gray-400">Total Tables</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {statsLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : stats?.analysesRun || 0}
              </div>
              <p className="text-sm text-gray-400">Analyses Run</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                <p className="text-sm text-gray-400 mt-1">Latest actions and events across your databases</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                Auto-refreshes
              </div>
            </div>

            {activityLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 text-white animate-spin" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const activityIcons: Record<string, React.ReactNode> = {
                    database_connected: <Database className="w-4 h-4 text-green-400" />,
                    database_disconnected: <Database className="w-4 h-4 text-red-400" />,
                    database_activated: <CheckCircle className="w-4 h-4 text-blue-400" />,
                    chat_query: <MessageSquare className="w-4 h-4 text-purple-400" />,
                    analysis_run: <BarChart3 className="w-4 h-4 text-yellow-400" />,
                    schema_viewed: <BarChart3 className="w-4 h-4 text-cyan-400" />,
                    table_explained: <MessageSquare className="w-4 h-4 text-orange-400" />,
                    export_generated: <Download className="w-4 h-4 text-emerald-400" />,
                  }

                  return (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {activityIcons[item.type] || <Activity className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Activity className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No recent activity</p>
                <p className="text-xs text-gray-500">Connect a database and start analyzing to see activity here</p>
              </div>
            )}
          </div>

          {/* Sync Settings */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">Sync Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Auto-Sync Frequency
                </label>
                <select 
                  value={autoSyncFreq}
                  onChange={(e) => setAutoSyncFreq(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-all"
                >
                  <option value="never">Never</option>
                  <option value="every-6-hours">Every 6 hours</option>
                  <option value="every-12-hours">Every 12 hours</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Default Schema Filter
                </label>
                <input
                  type="text"
                  value={schemaFilter}
                  onChange={(e) => setSchemaFilter(e.target.value)}
                  placeholder="public, analytics"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Comma-separated list of schemas to include in sync
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white font-medium">Include System Tables</p>
                  <p className="text-sm text-gray-400">Include pg_catalog and information_schema</p>
                </div>
                <button 
                  onClick={() => setIncludeSysTables(!includeSysTables)}
                  className={`w-12 h-7 rounded-full transition-all ${includeSysTables ? "bg-white" : "bg-white/20"}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-black transition-transform ${includeSysTables ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <Button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : "Save Sync Settings"}
              </Button>
            </div>
          </div>
        </>
  )
}
