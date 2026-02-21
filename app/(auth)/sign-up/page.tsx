"use client"



import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    // Simulate API call then redirect to dashboard
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
        <div className="max-w-md w-full">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-12 hover:border-white/40 transition-all duration-300">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">
              Create Account
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Get started with SchemaSense AI today
            </p>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Full Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Amit Diveakr"
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 text-center py-2">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12 rounded-lg transition-all duration-300"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-white hover:text-gray-300 transition-colors font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Feature Highlight */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-300">
                Free tier includes up to 1 database connection and full AI analysis
              </p>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  )
}
