"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Database,
  Lock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Loader,
  Search,
  Zap,
  MessageSquare,
} from "lucide-react"

type DatabaseType = "postgresql" | "snowflake" | "sqlserver"
type ProgressState = "connecting" | "extracting" | "analyzing" | "generating" | null

interface FormData {
  databaseType: DatabaseType
  host: string
  port: string
  databaseName: string
  username: string
  password: string
  schemaFilter: string
  connectionTimeout: string
}

interface ErrorState {
  field?: string
  message: string
}

export default function ConnectDatabasePage() {
  const router = useRouter()
  const [step, setStep] = useState<"selection" | "credentials" | "progress" | "success">("selection")
  const [formData, setFormData] = useState<FormData>({
    databaseType: "postgresql",
    host: "",
    port: "5432",
    databaseName: "",
    username: "",
    password: "",
    schemaFilter: "",
    connectionTimeout: "30",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [progressState, setProgressState] = useState<ProgressState>(null)

  const databaseOptions: {
    value: DatabaseType
    label: string
    status: string
    enabled: boolean
  }[] = [
    {
      value: "postgresql",
      label: "PostgreSQL",
      status: "Fully Supported",
      enabled: true,
    },
    {
      value: "snowflake",
      label: "Snowflake",
      status: "Coming Soon",
      enabled: false,
    },
    {
      value: "sqlserver",
      label: "SQL Server",
      status: "Supported",
      enabled: true,
    },
  ]

  const progressSteps = [
    { state: "connecting" as const, label: "Connecting to database..." },
    { state: "extracting" as const, label: "Extracting schema metadata..." },
    { state: "analyzing" as const, label: "Analyzing data quality..." },
    { state: "generating" as const, label: "Generating AI documentation..." },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const handleDatabaseTypeSelect = (type: DatabaseType) => {
    if (type === "snowflake") return
    const portMap: Record<string, string> = { postgresql: "5432", sqlserver: "1433" }
    setFormData((prev) => ({
      ...prev,
      databaseType: type,
      port: portMap[type] || "5432",
    }))
    setStep("credentials")
  }

  const validateForm = (): boolean => {
    if (!formData.host.trim()) {
      setError({ field: "host", message: "Database host is required" })
      return false
    }
    if (!formData.port.trim()) {
      setError({ field: "port", message: "Port is required" })
      return false
    }
    if (!formData.databaseName.trim()) {
      setError({ field: "databaseName", message: "Database name is required" })
      return false
    }
    if (!formData.username.trim()) {
      setError({ field: "username", message: "Username is required" })
      return false
    }
    if (!formData.password.trim()) {
      setError({ field: "password", message: "Password is required" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)
    setStep("progress")
    setProgressState("connecting")

    try {
      // Call the actual backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/connect-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: formData.host,
          port: parseInt(formData.port),
          user: formData.username,
          password: formData.password,
          database: formData.databaseName,
          schema_filter: formData.schemaFilter || (formData.databaseType === "sqlserver" ? "dbo" : "public"),
          database_type: formData.databaseType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Connection failed')
      }

      // Progress through states
      setProgressState("extracting")
      await new Promise(r => setTimeout(r, 1500))
      setProgressState("analyzing")
      await new Promise(r => setTimeout(r, 1500))
      setProgressState("generating")
      await new Promise(r => setTimeout(r, 1500))

      // Store connection info for UI
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dbConnection', JSON.stringify({
          host: formData.host,
          database: formData.databaseName,
          connected: true,
          connection_id: data.connection_id,
        }))
      }

      setIsLoading(false)
      setProgressState(null)
      // Redirect to dashboard immediately after successful connection
      router.push("/dashboard")

    } catch (err: any) {
      // Extract the real error message from the backend response
      let errorMessage = 'Connection failed'
      if (err.message) {
        errorMessage = err.message
      }
      setError({ message: errorMessage })
      setIsLoading(false)
      setProgressState(null)
      setStep("credentials")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Step 1: Database Selection */}
          {step === "selection" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Connect Your Database
                </h1>
                <p className="text-gray-300 text-lg">
                  Securely connect your database in seconds using read-only credentials.
                  <br />
                  SchemaSense AI never modifies or stores your data.
                </p>
              </div>

              {/* Database Selection Cards */}
              <div className="space-y-4">
                <p className="text-sm text-gray-400 font-medium">SELECT DATABASE TYPE</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {databaseOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDatabaseTypeSelect(option.value)}
                      disabled={!option.enabled}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 text-center group ${
                        option.enabled
                          ? "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40 hover:from-white/15 hover:to-white/10 cursor-pointer"
                          : "bg-gradient-to-br from-white/5 to-white/0 border-white/10 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className={`mb-4 flex justify-center ${!option.enabled ? "opacity-50" : ""}`}>
                        <div className={`w-12 h-12 rounded-lg ${option.enabled ? "bg-white/10 group-hover:bg-white/20" : "bg-white/5"} flex items-center justify-center transition-all duration-300`}>
                          {option.value === "postgresql" && (
                            <Database className="w-6 h-6 text-white" />
                          )}
                          {option.value === "snowflake" && (
                            <Database className="w-6 h-6 text-white/50" />
                          )}
                          {option.value === "sqlserver" && (
                            <Database className={`w-6 h-6 ${option.enabled ? "text-white" : "text-white/50"}`} />
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{option.label}</h3>
                      <p
                        className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                          option.enabled
                            ? "bg-white/10 text-white"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        {option.status}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm">
                  PostgreSQL and SQL Server are fully supported. Snowflake support is coming soon.
                </p>
              </div>

              {/* Demo Button */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">🚀 Try with Demo Database</h3>
                    <p className="text-sm text-gray-400">Instantly connect to our sample PostgreSQL database to explore features</p>
                  </div>
                  <Button
                    onClick={() => {
                      setFormData({
                        databaseType: "postgresql",
                        host: "4.240.95.115",
                        port: "5432",
                        databaseName: "hackathon_db",
                        username: "stackops",
                        password: "demo@123",
                        schemaFilter: "olist",
                        connectionTimeout: "30",
                      })
                      setStep("credentials")
                      setShowAdvanced(true)
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 h-10 flex-shrink-0"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === "credentials" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <button
                  onClick={() => setStep("selection")}
                  className="text-gray-400 hover:text-white text-sm mb-6 transition-colors inline-flex items-center gap-1"
                >
                  ← Change Database Type
                </button>
                <h1 className="text-4xl font-bold text-white mb-4">
                  {formData.databaseType === "sqlserver" ? "SQL Server" : "PostgreSQL"} Connection Details
                </h1>
                <p className="text-gray-300">
                  We only need read-only access to your database
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error State */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300">{error.message}</p>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 space-y-6">
                  {/* Host */}
                  <div className="space-y-2">
                    <label htmlFor="host" className="block text-sm font-medium text-white">
                      Database Host
                    </label>
                    <input
                      id="host"
                      name="host"
                      type="text"
                      value={formData.host}
                      onChange={handleInputChange}
                      placeholder="localhost or db.company.com"
                      className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        error?.field === "host"
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-white/20 focus:border-white/40 focus:ring-white/20"
                      }`}
                    />
                    <p className="text-xs text-gray-400">
                      The hostname or IP address of your database server.
                    </p>
                  </div>

                  {/* Port and Database Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="port" className="block text-sm font-medium text-white">
                        Port
                      </label>
                      <input
                        id="port"
                        name="port"
                        type="text"
                        value={formData.port}
                        onChange={handleInputChange}
                        className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 ${
                          error?.field === "port"
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/20 focus:border-white/40 focus:ring-white/20"
                        }`}
                      />
                      <p className="text-xs text-gray-400">Default: {formData.databaseType === "sqlserver" ? "1433" : "5432"}</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="databaseName" className="block text-sm font-medium text-white">
                        Database Name
                      </label>
                      <input
                        id="databaseName"
                        name="databaseName"
                        type="text"
                        value={formData.databaseName}
                        onChange={handleInputChange}
                        placeholder="analytics_db"
                        className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 ${
                          error?.field === "databaseName"
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/20 focus:border-white/40 focus:ring-white/20"
                        }`}
                      />
                      <p className="text-xs text-gray-400">
                        Name of the database to scan.
                      </p>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-white">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="readonly_user"
                      className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        error?.field === "username"
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-white/20 focus:border-white/40 focus:ring-white/20"
                      }`}
                    />
                    <p className="text-xs text-gray-400">
                      Use a read-only database user for security.
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        error?.field === "password"
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-white/20 focus:border-white/40 focus:ring-white/20"
                      }`}
                    />
                    <p className="text-xs text-gray-400">
                      Credentials are encrypted and never exposed to AI or frontend.
                    </p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-semibold mb-1">Security & Privacy</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• SchemaSense AI uses read-only access</li>
                      <li>• No data is modified or deleted</li>
                      <li>• Raw table data is never stored</li>
                      <li>• AI only receives schema metadata</li>
                    </ul>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="border border-white/10 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-medium text-white">Advanced Options <span className="text-xs text-yellow-400">(Required for non-public schemas like olist)</span></span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                        showAdvanced ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showAdvanced && (
                    <div className="border-t border-white/10 px-4 py-4 space-y-4 bg-white/5">
                      <div className="space-y-2">
                        <label htmlFor="schemaFilter" className="block text-sm font-medium text-white">
                          Schema Include Filter (Optional)
                        </label>
                        <input
                          id="schemaFilter"
                          name="schemaFilter"
                          type="text"
                          value={formData.schemaFilter}
                          onChange={handleInputChange}
                          placeholder="e.g., olist or public"
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                        />
                        <p className="text-xs text-gray-400">
                          Enter the schema name to scan (default: {formData.databaseType === "sqlserver" ? "dbo" : "public"}).
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="connectionTimeout"
                          className="block text-sm font-medium text-white"
                        >
                          Connection Timeout (seconds)
                        </label>
                        <input
                          id="connectionTimeout"
                          name="connectionTimeout"
                          type="number"
                          value={formData.connectionTimeout}
                          onChange={handleInputChange}
                          min="10"
                          max="120"
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                        />
                        <p className="text-xs text-gray-400">Default: 30 seconds</p>
                      </div>

                      <p className="text-xs text-gray-500 italic">
                        Advanced users can fine-tune schema scanning behavior.
                      </p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setStep("selection")}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold h-12 transition-all duration-300"
                  >
                    {isLoading ? "Connecting…" : "Connect & Scan Schema"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Progress */}
          {step === "progress" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Connecting to your database...
                </h1>
                <p className="text-gray-300">
                  This typically takes 1-2 minutes
                </p>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 space-y-6">
                {progressSteps.map((item, idx) => {
                  const isActive = progressState === item.state
                  const isComplete = progressSteps.findIndex((s) => s.state === progressState) > idx

                  return (
                    <div key={item.state} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isComplete
                              ? "bg-white text-black"
                              : isActive
                                ? "bg-white/20 border border-white/40"
                                : "bg-white/10 border border-white/20"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isActive ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <span className="text-xs font-semibold">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`font-medium transition-all duration-300 ${
                            isActive
                              ? "text-white"
                              : isComplete
                                ? "text-gray-300"
                                : "text-gray-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {idx < progressSteps.length - 1 && (
                        <div className="ml-4 h-6 relative">
                          <div
                            className={`absolute left-0 top-0 w-0.5 h-full transition-all duration-500 ${
                              isComplete || isActive ? "bg-white/30" : "bg-white/10"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  We're analyzing your schema and generating documentation. Don't close this window.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Connection Successful!
                </h1>
                <p className="text-gray-300">
                  Your database has been securely connected and schema analysis is complete.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">Schema Extracted</h3>
                      <p className="text-gray-400 text-sm">
                        Your complete database structure has been analyzed and documented.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">AI Documentation Ready</h3>
                      <p className="text-gray-400 text-sm">
                        Business-friendly explanations have been generated for all tables and columns.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">Chat Interface Active</h3>
                      <p className="text-gray-400 text-sm">
                        Start asking natural language questions about your schema.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard/analysis" className="flex-1">
                    <Button className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12">
                      View Schema Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/chat" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 h-12"
                    >
                      Chat with Database
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Your schema is now available in your dashboard. You can connect more databases anytime.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


