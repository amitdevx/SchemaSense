"use client"



import { Button } from "@/components/ui/button"
import { ArrowRight, Plug, Search, BarChart3, Zap, MessageSquare, Check } from "lucide-react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const ParticleBackground = dynamic(() => import("@/components/particle-background"), {
  ssr: false,
  loading: () => null,
})

interface Step {
  id: number
  Icon: React.ElementType
  title: string
  description: string
  details: string[]
  content: string
}

const steps: Step[] = [
  {
    id: 1,
    Icon: Plug,
    title: "Connect Your Database",
    description: "Securely establish a read-only connection to your database",
    content: "Begin by connecting your database with read-only credentials. We support PostgreSQL, Snowflake, and SQL Server. Your credentials are encrypted and never stored in plaintext.",
    details: [
      "Read-only access for maximum security",
      "Support for multiple database types",
      "One-click connection setup",
      "Encrypted credential storage",
    ],
  },
  {
    id: 2,
    Icon: Search,
    title: "Extract Schema Metadata",
    description: "Analyze and extract your complete database structure",
    content: "SchemaSense AI automatically scans your database and extracts comprehensive schema metadata including all tables, columns, data types, keys, and relationships without any manual configuration.",
    details: [
      "Tables and columns identification",
      "Data types and constraints",
      "Primary and foreign keys",
      "Relationships and indexes",
    ],
  },
  {
    id: 3,
    Icon: BarChart3,
    title: "Analyze Data Quality",
    description: "Assess the reliability and health of your data",
    content: "Our analysis engine evaluates key quality metrics like data completeness, timestamp freshness, and primary key health to give you a comprehensive picture of your data reliability.",
    details: [
      "Completeness metrics for missing values",
      "Timestamp freshness analysis",
      "Primary key health checks",
      "Data reliability scoring",
    ],
  },
  {
    id: 4,
    Icon: Zap,
    title: "AI-Generated Documentation",
    description: "Transform technical metadata into business insights",
    content: "Our AI models convert complex technical schema metadata into clear, business-friendly explanations that anyone on your team can understand.",
    details: [
      "Business-friendly table summaries",
      "Column explanations and context",
      "Usage recommendations",
      "Relationship descriptions",
    ],
  },
  {
    id: 5,
    Icon: MessageSquare,
    title: "Chat with Your Schema",
    description: "Ask natural language questions about your database",
    content: "Interact with your database schema through an intuitive chat interface. Ask questions like 'What does the orders table represent?' and get instant, accurate answers powered by AI.",
    details: [
      "Natural language queries",
      "Instant schema insights",
      "No SQL knowledge required",
      "Contextual AI responses",
    ],
  },
]

function StickyStepCard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [prevStep, setPrevStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const stepsSection = document.getElementById("scrollable-steps")
      if (!stepsSection) return

      const rect = stepsSection.getBoundingClientRect()
      const sectionStart = rect.top + window.scrollY
      const sectionHeight = rect.height
      const stepHeight = sectionHeight / steps.length
      
      // Calculate progress through the section
      const scrollProgress = Math.max(0, window.scrollY - sectionStart)
      const stepIndex = Math.min(steps.length - 1, Math.floor(scrollProgress / stepHeight))

      if (stepIndex !== currentStep) {
        setPrevStep(currentStep)
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentStep(stepIndex)
          setIsTransitioning(false)
        }, 250)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [currentStep])

  const step = steps[currentStep]
  const Icon = step.Icon
  const progressPercentage = ((currentStep) / (steps.length - 1)) * 100

  return (
    <div className="h-screen sticky top-0 flex items-center justify-center bg-background z-20 pointer-events-none">
      <div className="w-full h-full flex items-center justify-center px-4">
        <div
          className={`w-full max-w-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-2xl transition-all duration-300 pointer-events-auto ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {/* Header with Icon */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400 font-medium">STEP {step.id}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{step.title}</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-8">
            <p className="text-lg text-gray-300 leading-relaxed">{step.content}</p>

            {/* Details List */}
            <div className="space-y-3">
              {step.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                  style={{
                    animation: !isTransitioning
                      ? `slideInUp 0.5s ease-out ${idx * 0.08}s both`
                      : "none",
                  }}
                >
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                  <span className="text-gray-300 text-sm">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicator at Bottom */}
          <div className="pt-6 border-t border-white/10">
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white to-white/60 transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx < currentStep
                          ? "w-2 bg-white"
                          : idx === currentStep
                            ? "w-3 bg-white"
                            : "w-2 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  {step.id} / {steps.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-white text-balance leading-tight">
              How SchemaSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">AI Works</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              A simple 5-step process that transforms your database schema into instant insights
            </p>
            <p className="text-gray-400">Scroll to watch the magic happen</p>
          </div>
        </div>
      </section>

      {/* Sticky Card + Scrollable Section */}
      <StickyStepCard />
      <section id="scrollable-steps" className={`relative h-[${steps.length * 100}vh] bg-background`} style={{ height: `${steps.length * 100}vh` }} />

      {/* CTA Section */}
      <section className="min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-12 hover:border-white/40 transition-all duration-300">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to understand your database?
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              Start with our free tier and connect your database in minutes.
            </p>
            <p className="text-gray-400 mb-8">
              No credit card required. Generate comprehensive documentation instantly.
            </p>
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black group text-base h-12">
              Connect Your Database
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      
    </div>
  )
}
