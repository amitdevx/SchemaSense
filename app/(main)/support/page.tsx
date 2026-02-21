"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, MessageCircle, Mail, AlertCircle, Search } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I connect my database?",
        a: "Go to your dashboard and click 'Connect Database'. Follow the step-by-step wizard to enter your database credentials.",
      },
      {
        q: "Is my data secure?",
        a: "Yes, we use read-only connections and never store your raw data. Only schema metadata is analyzed.",
      },
    ],
  },
  {
    category: "Features",
    items: [
      {
        q: "Can I analyze multiple databases?",
        a: "Yes! With our Professional plan, you can connect and analyze unlimited databases.",
      },
      {
        q: "What database types are supported?",
        a: "Currently we support PostgreSQL with Snowflake and SQL Server coming soon.",
      },
    ],
  },
  {
    category: "Billing",
    items: [
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your subscription at any time with no penalties.",
      },
      {
        q: "Do you offer discounts for annual billing?",
        a: "Yes, we offer 20% discount on annual plans.",
      },
    ],
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <div className="min-h-screen bg-background">
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all"
              />
            </div>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Documentation</h3>
              <p className="text-gray-400 text-sm mb-4">
                Browse our comprehensive guides and API documentation
              </p>
              <Link href="/docs">
                <Button variant="ghost" className="text-white/70 hover:text-white gap-2 h-8">
                  View Docs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
              <p className="text-gray-400 text-sm mb-4">
                Chat with our support team in real-time
              </p>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-9">
                Start Chat
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Email Support</h3>
              <p className="text-gray-400 text-sm mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <Link href="mailto:support@schemasense.ai">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-9">
                  Email Us
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-6">
                {filteredFaqs.map((category, categoryIdx) => (
                  <div key={categoryIdx}>
                    <h3 className="text-lg font-semibold text-white mb-4">{category.category}</h3>
                    <div className="space-y-3">
                      {category.items.map((item, idx) => {
                        const faqId = `${categoryIdx}-${idx}`
                        return (
                          <div
                            key={faqId}
                            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300"
                          >
                            <button
                              onClick={() =>
                                setExpandedFaq(expandedFaq === faqId ? null : faqId)
                              }
                              className="w-full text-left p-6 flex items-start justify-between"
                            >
                              <div className="flex-1">
                                <p className="text-white font-medium">{item.q}</p>
                              </div>
                              <div
                                className={`text-gray-500 transition-transform ${
                                  expandedFaq === faqId ? "rotate-180" : ""
                                }`}
                              >
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </button>

                            {expandedFaq === faqId && (
                              <div className="px-6 pb-6 border-t border-white/10">
                                <p className="text-gray-400 text-sm leading-relaxed">
                                  {item.a}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white/5 border border-white/10 rounded-lg p-12">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No FAQs found. Try a different search term.</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">
              Can't find what you're looking for? Our support team is ready to help.
            </p>
            <Button className="bg-white hover:bg-gray-200 text-black font-semibold px-8">
              <a href="mailto:support@schemasense.ai">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </main>
      
    </div>
  )
}
