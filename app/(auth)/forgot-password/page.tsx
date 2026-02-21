"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
        <div className="max-w-md w-full">
          {!isSubmitted ? (
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-12 hover:border-white/40 transition-all duration-300">
              <Link href="/sign-in" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
              <h1 className="text-3xl font-bold text-white mb-2 text-center">Reset Password</h1>
              <p className="text-gray-400 text-center mb-8">
                Enter your email address and we'll send you a link to reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12 rounded-lg transition-all duration-300"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-12 hover:border-white/40 transition-all duration-300 text-center">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                The link will expire in 24 hours. If you don't see the email, check your spam folder.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12 rounded-lg transition-all duration-300"
                >
                  Try Another Email
                </Button>
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">
              Can't find your email? <Link href="/support" className="text-white hover:text-gray-300 transition-colors">Contact Support</Link>
            </p>
          </div>
        </div>
      </main>
      
    </div>
  )
}
