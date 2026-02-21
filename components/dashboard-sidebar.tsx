"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, MessageSquare, Settings, User, CreditCard, Download, Database, LogOut, Menu, X, Activity } from "lucide-react"
import { useState } from "react"
import { LeLoLogo } from "./lelo-logo"

const navigationItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    description: "Dashboard home",
  },
  {
    label: "Analysis",
    href: "/dashboard/analysis",
    icon: BarChart3,
    description: "Explore schemas",
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
    description: "Ask AI questions",
  },
  {
    label: "Integrations",
    href: "/dashboard/integrations",
    icon: Database,
    description: "Manage databases",
  },
  {
    label: "Recent Activity",
    href: "/dashboard/activity",
    icon: Activity,
    description: "View recent actions",
  },
  {
    label: "Exports",
    href: "/dashboard/exports",
    icon: Download,
    description: "Save & download",
  },
]

const settingsItems = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Account info",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Preferences",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Subscription",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
      window.location.href = '/'
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 md:hidden bg-white/10 border border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-300"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white/5 to-white/0 border-r border-white/10
          transition-all duration-300 z-40 overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
            <div className="mb-8 hover:opacity-80 transition-opacity">
              <LeLoLogo />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1 mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Main</p>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                    ${
                      active
                        ? "bg-white/10 border border-white/20 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Settings */}
          <nav className="space-y-1 pb-8 border-b border-white/10 mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Account</p>
            {settingsItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                    ${
                      active
                        ? "bg-white/10 border border-white/20 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Support */}
          <Link
            href="/support"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 mb-4"
          >
            <span className="text-sm font-medium">Help & Support</span>
          </Link>

          {/* User Profile Card */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-white">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 text-sm"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
