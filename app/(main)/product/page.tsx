

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, Brain, TrendingUp, MessageSquare, Download, BarChart3, Cog, Target, Users } from "lucide-react"

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
              Turn Database Schemas into Business Knowledge
            </h1>
            <p className="text-xl text-gray-300 mb-8 text-balance max-w-3xl mx-auto">
              SchemaSense AI connects to enterprise databases, extracts schema metadata, analyzes data quality, and uses AI to generate clear, business-friendly documentation with a conversational chat interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/connect-database">
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/analysis">
                <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Problem Section */}
          <div className="max-w-5xl mx-auto mb-24 bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-6">The Problem</h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg">
                <strong>Database documentation is often outdated or missing.</strong> Technical schemas are hard to understand for analysts and business users. Teams spend weeks trying to understand what data they have and how it's structured.
              </p>
              <p className="text-lg">
                SchemaSense AI automatically creates <strong>living documentation</strong> that stays in sync with your database, saving time and reducing knowledge gaps.
              </p>
            </div>
          </div>

          {/* Key Capabilities */}
          <div className="max-w-6xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Key Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <Brain className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">AI-Generated Data Dictionaries</h3>
                <p className="text-gray-400">Automatically convert technical metadata into business-friendly explanations</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <Database className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Schema Metadata Extraction</h3>
                <p className="text-gray-400">Tables, columns, data types, primary/foreign keys, relationships and constraints</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <TrendingUp className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Data Quality Metrics</h3>
                <p className="text-gray-400">Completeness, freshness, and key health assessments to gauge data reliability</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <MessageSquare className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Chat with Your Database</h3>
                <p className="text-gray-400">Ask natural language questions and get instant, accurate answers about your schema</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <Download className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Multi-Format Export</h3>
                <p className="text-gray-400">Export documentation in Markdown and JSON for easy sharing and integration</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-white/10 mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <span className="text-white font-bold">+</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">More Coming Soon</h3>
                <p className="text-gray-400">Advanced features like custom AI prompts and enterprise security</p>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Who It's For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-card/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Data Analysts</h3>
                  <p className="text-gray-400">Quickly understand datasets and explore relationships without waiting for documentation</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-card/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <Cog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Backend Engineers</h3>
                  <p className="text-gray-400">Maintain up-to-date documentation automatically as your schema evolves</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-card/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Product Managers</h3>
                  <p className="text-gray-400">Understand data structures to make better product decisions</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-card/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Business Teams</h3>
                  <p className="text-gray-400">Access data insights in plain language without technical knowledge</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-4">
              Understand your database in minutes, not weeks.
            </h2>
            <p className="text-gray-300 mb-8">Start with a free account and connect your first database today.</p>
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black group">
              <Link href="/connect-database" className="flex items-center justify-center w-full">
                Connect Database
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
    </div>
  )
}
