"use client"

import { DashboardSidebar } from "./dashboard-sidebar"
import { ConnectionStatus } from "./connection-status"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="md:ml-64 min-h-screen pt-24 md:pt-20 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Connection Status - Display at top of all pages */}
          <div className="mb-6">
            <ConnectionStatus />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
