"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-600" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  )
}
