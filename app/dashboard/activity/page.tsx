"use client"

import { Breadcrumb } from "@/components/breadcrumb"
import { useRecentActivity } from "@/hooks/useDashboard"
import { Database, MessageSquare, BarChart3, Download, CheckCircle, Clock, Activity, Loader } from "lucide-react"
import { formatIST } from "@/lib/utils"

export default function ActivityPage() {
  const { data: activities, loading } = useRecentActivity(50)

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

  const activityLabels: Record<string, string> = {
    database_connected: "Database Connected",
    database_disconnected: "Database Disconnected",
    database_activated: "Database Activated",
    chat_query: "Chat Query",
    analysis_run: "Analysis Run",
    schema_viewed: "Schema Viewed",
    table_explained: "Table Explained",
    export_generated: "Export Generated",
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Recent Activity" }]} />

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Recent Activity</h1>
        <p className="text-gray-400">Track all actions across your connected databases</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="w-6 h-6 text-white animate-spin" />
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {activityIcons[item.type] || <Activity className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {activityLabels[item.type] || item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatIST(item.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No activity yet</h3>
          <p className="text-gray-400">Connect a database and start exploring to see your activity here</p>
        </div>
      )}
    </div>
  )
}
