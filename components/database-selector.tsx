"use client"

import { Database, ChevronDown } from "lucide-react"
import { useConnections, ConnectionItem } from "@/hooks/useDashboard"

interface DatabaseSelectorProps {
  selectedConnectionId: string | null;
  onSelect: (connectionId: string | null) => void;
  className?: string;
}

export function DatabaseSelector({ selectedConnectionId, onSelect, className = "" }: DatabaseSelectorProps) {
  const { data: connections, activeId, loading } = useConnections();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 text-sm ${className}`}>
        <Database className="w-4 h-4 animate-pulse" />
        Loading databases...
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 text-sm ${className}`}>
        <Database className="w-4 h-4" />
        No databases connected
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Database className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="relative">
        <select
          value={selectedConnectionId || activeId || ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="appearance-none bg-white/5 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white text-sm focus:outline-none focus:border-white/40 transition-all cursor-pointer hover:bg-white/10 min-w-[200px]"
        >
          {connections.map((conn) => (
            <option key={conn.id} value={conn.id} className="bg-gray-900 text-white">
              {conn.name} {conn.is_active ? "(Active)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {connections.length > 1 && (
        <span className="text-xs text-gray-500">{connections.length} databases</span>
      )}
    </div>
  );
}
