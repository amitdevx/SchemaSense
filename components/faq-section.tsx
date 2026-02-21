"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What databases are supported?",
    answer:
      "SchemaSense AI currently supports PostgreSQL, with adapters for Snowflake and SQL Server. Support for additional databases is coming soon. We prioritize databases based on enterprise adoption and user demand.",
  },
  {
    question: "Does SchemaSense AI access my data?",
    answer:
      "No. We only analyze schema metadata and aggregated quality metrics. Raw data is never exposed or transmitted to our servers. Your database credentials are encrypted and never stored in plaintext.",
  },
  {
    question: "How is AI used in the platform?",
    answer:
      "AI is used to convert technical database metadata into clear, business-friendly explanations and to power the conversational chat interface. Our models understand database patterns and generate contextual, accurate documentation automatically.",
  },
  {
    question: "Is SchemaSense AI production ready?",
    answer:
      "Yes. The architecture is designed for enterprise use with secure backend services and scalable frontend deployment. We support high-volume schema analysis and are SOC 2 compliant.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We provide comprehensive support including email support for all plans, priority support for Professional plans, and 24/7 dedicated support for Enterprise customers. We also offer documentation, tutorials, and API guides.",
  },
  {
    question: "Can I export the generated documentation?",
    answer:
      "Yes! Generated documentation can be exported in Markdown or JSON formats, making it easy to integrate with your documentation systems like Confluence, Notion, or GitHub wikis. You retain full ownership of the exported content.",
  },
  {
    question: "How does the chat interface work?",
    answer:
      "The chat interface lets you ask natural language questions about your database schema. Ask questions like 'What does the orders table represent?' and get instant, AI-generated answers based on your actual schema structure and metadata.",
  },
  {
    question: "Is there a data retention policy?",
    answer:
      "Schema analysis results are stored securely and deleted according to your plan settings. You can request immediate deletion of all cached data at any time. We comply with GDPR, CCPA, and other data protection regulations.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Everything you need to know about SchemaSense AI. Can't find what you're looking for? Contact our support team.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-border/20 rounded-lg bg-card/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          
          
        </motion.div>
      </div>
    </section>
  )
}
