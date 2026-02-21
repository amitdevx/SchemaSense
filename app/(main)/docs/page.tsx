

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Database, Shield, FileJson, Network, Lock } from "lucide-react"

export default function DocsPage() {
  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn how to connect your database and generate your first data dictionary.",
      items: [
        "Create an account",
        "Add your database connection",
        "Configure schema extraction",
        "Generate AI documentation",
      ],
    },
    {
      icon: Database,
      title: "Supported Databases",
      description: "SchemaSense AI works with multiple database platforms.",
      items: [
        "PostgreSQL (MVP - Fully Supported)",
        "Snowflake (Planned)",
        "SQL Server (Planned)",
        "More coming soon",
      ],
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Your data security is our top priority.",
      items: [
        "Read-only database access only",
        "No raw data is stored or exposed",
        "AI processes only schema metadata",
        "Secure backend architecture",
      ],
    },
    {
      icon: FileJson,
      title: "Exports & Integrations",
      description: "Export your documentation in multiple formats.",
      items: [
        "Markdown for documentation systems",
        "JSON for programmatic access",
        "Compatible with Confluence, Notion, GitHub",
        "Custom export templates",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
              Documentation
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Everything you need to know about SchemaSense AI. Comprehensive guides, API documentation, and FAQs.
            </p>
          </div>

          {/* Main Documentation Sections */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map((section, idx) => {
                const Icon = section.icon
                return (
                  <div
                    key={idx}
                    className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{section.title}</h3>
                        <p className="text-gray-400">{section.description}</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs text-white mt-0.5">
                            ✓
                          </span>
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Reference */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Quick Reference</h2>

            <div className="space-y-8">
              {/* API Endpoints */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 hover:border-border/60 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Network className="w-6 h-6" />
                  API Endpoints
                </h3>
                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <div className="text-green-400">POST /api/databases</div>
                    <div className="text-gray-500">Connect a new database</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <div className="text-green-400">GET /api/databases/:id/schema</div>
                    <div className="text-gray-500">Retrieve extracted schema metadata</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <div className="text-green-400">GET /api/databases/:id/documentation</div>
                    <div className="text-gray-500">Get AI-generated documentation</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <div className="text-green-400">POST /api/chat</div>
                    <div className="text-gray-500">Chat with your schema (natural language)</div>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 hover:border-border/60 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6" />
                  Authentication
                </h3>
                <div className="space-y-4 text-gray-300">
                  <p>Use your API key in the Authorization header:</p>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400">Authorization: Bearer YOUR_API_KEY</div>
                  </div>
                  <p className="text-sm text-gray-400">Get your API key from your account settings.</p>
                </div>
              </div>

              {/* Error Codes */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 hover:border-border/60 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>*</span> Common Error Codes
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-red-400 font-bold min-w-fit">400</span>
                    <span>Bad Request - Invalid parameters or missing required fields</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-red-400 font-bold min-w-fit">401</span>
                    <span>Unauthorized - Invalid or missing API key</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-red-400 font-bold min-w-fit">404</span>
                    <span>Not Found - Resource doesn't exist</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-red-400 font-bold min-w-fit">429</span>
                    <span>Rate Limited - Too many requests</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-red-400 font-bold min-w-fit">500</span>
                    <span>Server Error - Please try again later</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-24 bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Does SchemaSense AI access my raw data?
                </h3>
                <p className="text-gray-400">
                  No. We only analyze schema metadata and aggregated quality metrics. Raw data is never exposed or transmitted to our servers.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Is SchemaSense AI production-ready?
                </h3>
                <p className="text-gray-400">
                  Yes. The architecture is designed for enterprise use with secure backend services and scalable frontend deployment. We are SOC 2 compliant.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  What database credentials do I need?
                </h3>
                <p className="text-gray-400">
                  You only need read-only database credentials (username and password). We recommend creating a dedicated read-only database user for security.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Can I use SchemaSense AI with multiple databases?
                </h3>
                <p className="text-gray-400">
                  Yes! Professional and Enterprise plans support multiple database connections. Start with one and add more as needed.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Where are my credentials stored?
                </h3>
                <p className="text-gray-400">
                  Credentials are encrypted at rest using industry-standard encryption and never exposed to frontend systems or AI models.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-8">Our support team is here to help. Contact us anytime.</p>
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black group">
              <Link href="/support" className="flex items-center justify-center w-full">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
    </div>
  )
}
