"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database, Settings, Trash2, CheckCircle2, AlertCircle, Clock, Plus, Loader, Play, CheckCircle, Lock } from "lucide-react"
import { useConnections } from "@/hooks/useDashboard"
import { useState, useRef, useCallback, useEffect } from "react"
import { api } from "@/lib/api-client"

const FEATURE_DISABLED = true // Set to false to enable integrations

export default function IntegrationsPage() {
  const [showDisabledMessage, setShowDisabledMessage] = useState(FEATURE_DISABLED)

  useEffect(() => {
    if (FEATURE_DISABLED) {
      setShowDisabledMessage(true)
      const timer = setTimeout(() => setShowDisabledMessage(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [])
  const { data: allConnections, activeId, loading, refetch, activateConnection, removeConnection } = useConnections()
  const [testing, setTesting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current)
    setMessage({ type, text })
    msgTimerRef.current = setTimeout(() => setMessage(null), type === 'error' ? 6000 : 3000)
  }, [])

  const handleTestIntegration = async (integrationId: string) => {
    if (FEATURE_DISABLED) {
      showMessage('error', 'This feature is unavailable in demo mode.')
      return
    }
    try {
      setTesting(integrationId)
      setMessage(null)
      await api.testIntegration(integrationId)
      showMessage('success', 'Connection test successful!')
    } catch (error: any) {
      console.error("Failed to test integration:", error)
      showMessage('error', error?.message || 'Connection test failed.')
    } finally {
      setTesting(null)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (FEATURE_DISABLED) {
      showMessage('error', 'This feature is unavailable in demo mode.')
      return
    }
    if (!confirm("Are you sure you want to disconnect this database?")) return
    
    try {
      setDisconnecting(integrationId)
      setMessage(null)
      await removeConnection(integrationId)
      showMessage('success', 'Database disconnected successfully!')
    } catch (error: any) {
      console.error("Failed to disconnect:", error)
      showMessage('error', error?.message || 'Failed to disconnect database.')
    } finally {
      setDisconnecting(null)
    }
  }

  const handleActivate = async (integrationId: string) => {
    if (FEATURE_DISABLED) {
      showMessage('error', 'This feature is unavailable in demo mode.')
      return
    }
    try {
      await activateConnection(integrationId)
      showMessage('success', 'Database set as active!')
    } catch (error: any) {
      showMessage('error', error?.message || 'Failed to activate database.')
    }
  }

  return (
    
      <div>
        <Breadcrumb items={[{ label: "Integrations" }]} />

        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Integrations</h1>
            <p className="text-gray-400">Manage your connected databases</p>
          </div>
          <Link href="/connect-database">
            <Button disabled={FEATURE_DISABLED} className="bg-white hover:bg-gray-200 text-black font-semibold flex items-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" />
              Add Database
            </Button>
          </Link>
        </div>

        {/* Feature Disabled Message */}
        {showDisabledMessage && FEATURE_DISABLED && (
          <div className="p-4 rounded-lg mb-6 bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <span>This feature is unavailable in demo mode.</span>
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Integrations List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 text-white animate-spin" />
              </div>
            ) : allConnections.length > 0 ? (
              allConnections.map((conn) => (
                <div
                  key={conn.id}
                  className={`bg-gradient-to-br from-white/10 to-white/5 border rounded-xl p-6 transition-all duration-300 ${conn.is_active ? 'border-white/40' : 'border-white/20 hover:border-white/30'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{conn.name}</h3>
                        <p className="text-sm text-gray-400 mb-1">{(conn.database_type || "postgresql").toUpperCase()}</p>
                        <p className="text-sm text-gray-500 font-mono">{conn.host}:{conn.port}</p>
                        <p className="text-xs text-gray-500 mt-1">Schema: {conn.schema_filter} • Database: {conn.database}</p>
                        {conn.connected_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Connected: {new Date(conn.connected_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {conn.is_active ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs text-green-300 font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-white font-medium">Connected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                    <Button 
                      onClick={() => handleTestIntegration(conn.id)}
                      disabled={testing === conn.id}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9"
                    >
                      {testing === conn.id ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                      {testing === conn.id ? 'Testing...' : 'Test'}
                    </Button>
                    <Link href="/dashboard/analysis">
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9">
                        View Analysis
                      </Button>
                    </Link>
                    {!conn.is_active && (
                      <Button 
                        onClick={() => handleActivate(conn.id)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Set Active
                      </Button>
                    )}
                    {conn.is_active && (
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-9" disabled>
                        <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                        Active
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDisconnect(conn.id)}
                      disabled={disconnecting === conn.id}
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 h-9"
                    >
                      {disconnecting === conn.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      {disconnecting === conn.id ? '...' : 'Disconnect'}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <Database className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No databases connected yet</p>
                <Link href="/connect-database">
                  <Button className="bg-white hover:bg-gray-200 text-black font-semibold gap-2">
                    <Plus className="w-4 h-4" />
                    Connect Your First Database
                  </Button>
                </Link>
              </div>
            )}
          </div>
      </div>
    
  )
}
