"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Bell, Database, Loader } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    theme: "dark",
    language: "en",
    autoSync: true,
    syncInterval: 3600,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsInitialLoading(true)
      const response = await api.getSettings()
      if (response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }
  }

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.updateSettings(settings)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
      setTimeout(() => setMessage(null), 6000)
    } finally {
      setSaving(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Settings" }]} />
        <div className="text-center py-12">
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    
      <div>
        <Breadcrumb items={[{ label: "Settings" }]} />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your preferences and notifications</p>
        </div>

          {/* Success/Error Messages */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            {/* Notification Settings */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive important updates via email</p>
                  </div>
                  <button
                    onClick={() => toggleSetting("emailNotifications")}
                    className={`w-12 h-7 rounded-full transition-all ${
                      settings.emailNotifications ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-black transition-transform ${
                        settings.emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Slack Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates on Slack</p>
                  </div>
                  <button
                    onClick={() => toggleSetting("slackNotifications")}
                    className={`w-12 h-7 rounded-full transition-all ${
                      settings.slackNotifications ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-black transition-transform ${
                        settings.slackNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Auto Sync</p>
                    <p className="text-sm text-gray-400">Automatically sync database changes</p>
                  </div>
                  <button
                    onClick={() => toggleSetting("autoSync")}
                    className={`w-12 h-7 rounded-full transition-all ${
                      settings.autoSync ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-black transition-transform ${
                        settings.autoSync ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">General</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Sync Interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={settings.syncInterval}
                    onChange={(e) => handleChange("syncInterval", parseInt(e.target.value))}
                    placeholder="3600"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    How often to sync database changes (in seconds)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Theme
                  </label>
                  <select 
                    value={settings.theme}
                    onChange={(e) => handleChange("theme", e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <Button 
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold mt-4"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </div>
      </div>
    
  )
}
