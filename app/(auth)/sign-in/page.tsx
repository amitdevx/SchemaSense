"use client"



import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, Chrome, Github, Shield } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300 mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 text-center">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign in to access your databases, documentation, and chat history.
            </p>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-input/50 border border-border/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-border/60 focus:ring-1 focus:ring-white/10 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-white/60 hover:text-white transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-input/50 border border-border/30 rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-border/60 focus:ring-1 focus:ring-white/10 transition-all duration-300"
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
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12 rounded-lg transition-all duration-300"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card/50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/30 text-white hover:bg-white/5"
              >
                <Chrome className="w-4 h-4" />
                <span>Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/30 text-white hover:bg-white/5"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </Button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-400 text-sm mt-8">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-white hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Your Security Matters
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Your credentials are encrypted and secure. We never store passwords in plain text.
            </p>
            <p className="text-xs text-gray-500">
              This demo supports email-based sign-in. Enterprise SSO is available on request.
            </p>
          </div>
        </div>
      </main>
      
    </div>
  )
}
