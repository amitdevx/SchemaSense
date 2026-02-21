

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started",
    features: [
      "1 Database connection",
      "Schema metadata extraction",
      "AI-generated summaries",
      "Chat interface",
      "Markdown export",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "Coming Soon",
    period: "",
    description: "Best for teams and enterprises",
    highlighted: true,
    features: [
      "Multiple database schemas",
      "Advanced AI explanations",
      "Data quality metrics (completeness, freshness)",
      "JSON export",
      "SQL query suggestions",
      "Priority email support",
      "Custom documentation templates",
      "API access",
    ],
    cta: "Request Access",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited databases",
      "Custom AI prompts and models",
      "Advanced security controls",
      "Audit logs and compliance",
      "On-premises deployment",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-card/80 backdrop-blur-sm border-2 border-white/30 shadow-2xl transform md:scale-105 md:-my-4"
                      : "bg-card/50 backdrop-blur-sm border border-border/30 hover:border-border/60 hover:bg-card/70"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8 h-full flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="text-4xl font-bold text-white">{plan.price}</div>
                      {plan.period && <div className="text-gray-400">{plan.period}</div>}
                    </div>

                    {/* CTA Button */}
                    <Link href={
                      plan.name === "Enterprise" ? "/support" : 
                      plan.name === "Professional" ? "/support" :
                      "/connect-database"
                    }>
                      <Button
                        className={`w-full mb-8 transition-all duration-300 ${
                          plan.highlighted
                            ? "bg-white hover:bg-gray-200 text-black"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Features */}
                    <div className="space-y-4 flex-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-24 bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Pricing FAQs</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Is there a free trial?</h3>
                <p className="text-gray-400">Yes! Start with our free Starter plan. No credit card required. Upgrade anytime.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Can I switch plans?</h3>
                <p className="text-gray-400">Absolutely. You can upgrade, downgrade, or cancel your plan at any time.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">What happens when I upgrade?</h3>
                <p className="text-gray-400">When you upgrade to a paid plan, you'll be charged a prorated amount. You'll immediately gain access to premium features.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Do you offer discounts?</h3>
                <p className="text-gray-400">Yes! Annual plans come with a 20% discount. Enterprise customers can negotiate custom pricing.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Is there a money-back guarantee?</h3>
                <p className="text-gray-400">We offer a 30-day money-back guarantee on all paid plans. No questions asked.</p>
              </div>
            </div>
          </div>

          {/* Additional Features Info */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">What's Included in Every Plan?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Secure Connection", desc: "Read-only database access with encrypted credentials" },
                { title: "Data Privacy", desc: "No raw data stored. Only schema metadata is analyzed" },
                { title: "AI Processing", desc: "Advanced AI models process only schema information" },
                { title: "Regular Updates", desc: "Your documentation stays in sync with schema changes" },
              ].map((item, idx) => (
                <div key={idx} className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 hover:border-border/60 hover:bg-card/70 transition-all duration-300">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-12 hover:border-border/60 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-300 mb-8">Choose a plan and start understanding your database today.</p>
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black group">
              <Link href="/connect-database" className="flex items-center justify-center w-full">
                Connect Your Database
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
    </div>
  )
}
