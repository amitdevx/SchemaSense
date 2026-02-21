"use client"

import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { User, Mail, Building2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api-client"

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    organization: "Acme Corp",
    avatar: "JD",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Load profile on mount
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsInitialLoading(true)
      const response = await api.getProfile()
      if (response.data) {
        setProfileData(response.data)
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setMessage(null)
      
      await api.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        organization: profileData.organization,
      })
      
      setMessage({ type: 'success', text: 'Profile saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Failed to save profile:", error)
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
      setTimeout(() => setMessage(null), 6000)
    } finally {
      setLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Profile" }]} />
        <div className="text-center py-12">
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    
      <div>
        <Breadcrumb items={[{ label: "Profile" }]} />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-gray-400">Manage your personal information</p>
        </div>

          {/* Avatar Section */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 mb-8 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold text-white">
                {profileData.avatar}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-gray-400 text-sm mb-4">{profileData.email}</p>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Upload Avatar
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-white">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-white">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500">
                To change your email, please verify the new address
              </p>
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <label htmlFor="organization" className="block text-sm font-medium text-white">
                Organization (Optional)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={profileData.organization}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
                  placeholder="Your company name"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-sm text-gray-500 mb-4">Account Information</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Account created</p>
                  <p className="text-white font-medium">January 15, 2024</p>
                </div>
                <div>
                  <p className="text-gray-500">Last login</p>
                  <p className="text-white font-medium">Today at 2:30 PM</p>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
                {message.text}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold h-12"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 h-12">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
      </div>
    
  )
}
