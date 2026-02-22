"use client"

import { useEffect, useState, useRef } from "react"
import { CheckCircle } from "lucide-react"
import { api } from "@/lib/api-client"
import { formatIST } from "@/lib/utils"

export function ConnectionStatus() {
  const [status, setStatus] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [loading, setLoading] = useState(true)
  const prevStatusRef = useRef<any>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkConnectionStatus()
    // Refresh status every 60 seconds (minimum 20 sec as requested)
    const interval = setInterval(checkConnectionStatus, 60000)
    return () => {
      clearInterval(interval)
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await api.getConnectionStatus()
      
      // Only update state if connection status actually changed
      if (JSON.stringify(prevStatusRef.current) !== JSON.stringify(response)) {
        setStatus(response)
        prevStatusRef.current = response
        
        // Show notification temporarily when connection detected
        if (response?.connected === true) {
          setShowNotification(true)
          
          // Auto-dismiss after 3 seconds
          if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current)
          }
          notificationTimeoutRef.current = setTimeout(() => {
            setShowNotification(false)
          }, 3000)
        }
      }
    } catch (err) {
      console.error("Failed to check connection status:", err)
      const newStatus = { connected: false }
      if (JSON.stringify(prevStatusRef.current) !== JSON.stringify(newStatus)) {
        setStatus(newStatus)
        prevStatusRef.current = newStatus
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading || !status || !showNotification) return null

  const isConnected = status?.connected === true

  // Only show when connected and notification should be visible
  if (!isConnected) return null

  return (
    <div className="p-4 rounded-lg border transition-all bg-green-500/10 border-green-500/30 text-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Database Connected</span>
            {status?.database && (
              <span className="text-xs opacity-75">• {status.database}</span>
            )}
          </div>
          {status?.lastSync && (
            <p className="text-xs opacity-75 mt-1">Last synced: {formatIST(status.lastSync)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
