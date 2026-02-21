"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Database, Loader } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    theme: "dark",
    language: "en",
    privacyLevel: "private",
    autoSync: true,
    syncInterval: 3600,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return
    
    setDeleting(true)
    try {
      // TODO: Implement delete account API call
      console.log("Deleting account...")
      await new Promise(resolve => setTimeout(resolve, 500))
      // Redirect to home after deletion
      window.location.href = "/"
    } catch (error) {
      alert("Failed to delete account")
    } finally {
      setDeleting(false)
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
          <p className="text-gray-400">Manage your account, preferences, and integrations</p>
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

            {/* Database Configuration */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Database Settings</h2>
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

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Privacy Level
                  </label>
                  <select 
                    value={settings.privacyLevel}
                    onChange={(e) => handleChange("privacyLevel", e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="public">Public</option>
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

            {/* Security */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Security</h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-400">Keep your account secure</p>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12">
                  Change Password
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
              <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
              <p className="text-gray-400 mb-4">
                Irreversible actions that require careful consideration
              </p>
              <Button 
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400"
              >
                {deleting ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                {deleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
      </div>
    
  )
}
