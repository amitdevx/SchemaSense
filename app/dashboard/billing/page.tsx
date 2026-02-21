"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Check, Download } from "lucide-react"

const invoices = [
  { id: 1, date: "Jan 15, 2024", amount: "$0.00", status: "Free Trial", pdf: "#" },
  { id: 2, date: "Dec 15, 2023", amount: "$0.00", status: "Free Trial", pdf: "#" },
]

export default function BillingPage() {
  return (
    
      <div>
        <Breadcrumb items={[{ label: "Billing" }]} />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your plan and payment methods</p>
        </div>

        <div className="space-y-8">
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Current Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
                  <p className="text-3xl font-bold text-white mb-4">$0 <span className="text-lg text-gray-400">/month</span></p>
                  <ul className="space-y-3 text-sm text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      1 Database Connection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      Basic Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      AI Chat (Limited)
                    </li>
                  </ul>
                  <Button className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    Current Plan
                  </Button>
                </div>

                <div className="bg-white/10 rounded-lg p-6 border border-white/40 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-full">
                    POPULAR
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Professional</h3>
                  <p className="text-3xl font-bold text-white mb-4">$99 <span className="text-lg text-gray-400">/month</span></p>
                  <ul className="space-y-3 text-sm text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      Unlimited Databases
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      Advanced Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      Unlimited AI Chat
                    </li>
                  </ul>
                  <Button className="w-full bg-white hover:bg-gray-200 text-black font-semibold">
                    Upgrade Now
                  </Button>
                </div>

                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
                  <p className="text-3xl font-bold text-white mb-4">Custom</p>
                  <ul className="space-y-3 text-sm text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      Everything in Pro
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      SSO & Admin Console
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-white" />
                      Dedicated Support
                    </li>
                  </ul>
                  <Button className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>

            {/* Usage */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Usage This Month</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Analyses Run</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-white">32</p>
                    <p className="text-gray-500 text-sm mb-1">of unlimited</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">AI Chat Messages</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-white">156</p>
                    <p className="text-gray-500 text-sm mb-1">of unlimited</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Visa ending in 4242</p>
                  <p className="text-gray-500 text-sm">Expires 12/2025</p>
                </div>
                <span className="text-sm text-gray-400">Default</span>
              </div>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                Update Payment Method
              </Button>
            </div>

            {/* Invoice History */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Invoice History</h2>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-white font-medium">{invoice.date}</p>
                      <p className="text-gray-500 text-sm">{invoice.status}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-white font-semibold">{invoice.amount}</p>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    
  )
}
