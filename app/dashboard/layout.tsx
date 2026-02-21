"use client"

import { DashboardLayout } from "@/components/dashboard-layout"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardLayout>{children}</DashboardLayout>
}
