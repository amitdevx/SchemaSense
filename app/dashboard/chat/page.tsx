"use client"


import { Breadcrumb } from "@/components/breadcrumb"
import Link from "next/link"
import { Send, MessageCircle, BarChart3, Download, Loader, Zap } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useChat } from "@/hooks/useChat"
import { DatabaseSelector } from "@/components/database-selector"

export default function ChatPage() {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const { messages, loading, error, streamingStatus, sendMessage } = useChat()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingStatus])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    sendMessage(inputValue, selectedConnectionId || undefined)
    setInputValue("")
  }

  return (
    
      <div>
        <Breadcrumb items={[{ label: "Chat" }]} />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Ask SchemaSense AI</h1>
            <p className="text-gray-400">Ask any questions about your database</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/analysis">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Browse Schema
              </Button>
            </Link>
            <Link href="/dashboard/exports">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </Link>
          </div>
        </div>

        {/* Database Selector */}
        <div className="mb-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Query Database</label>
          <DatabaseSelector
            selectedConnectionId={selectedConnectionId}
            onSelect={setSelectedConnectionId}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            {error.includes('No database connected') && (
              <Link href="/connect-database">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-8 text-xs ml-4">
                  Connect Database
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 flex flex-col h-[600px] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "max-w-xs lg:max-w-md bg-white text-black"
                      : "max-w-full lg:max-w-2xl bg-white/10 border border-white/20 text-white"
                  }`}
                >
                  {message.sender === "user" ? (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  ) : (
                    <div className="text-sm leading-relaxed">
                      <MarkdownRenderer content={message.text} />
                    </div>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-gray-600"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming Status Indicator */}
            {streamingStatus && (
              <div className="flex justify-start">
                <div className="bg-blue-500/20 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg max-w-xs lg:max-w-md">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">{streamingStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && !streamingStatus && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-6 bg-gradient-to-t from-black/20 to-transparent">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your database..."
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              setInputValue("What tables exist in the database and what do they store?")
            }}
            className="bg-white/5 border border-white/10 hover:border-white/20 rounded-lg p-4 text-left transition-all hover:bg-white/10"
          >
            <p className="text-xs text-gray-400 mb-1">Ask:</p>
            <p className="text-sm text-white font-medium">What tables exist?</p>
          </button>
          <button 
            onClick={() => {
              setInputValue("Explain the complete schema structure and relationships between tables")
            }}
            className="bg-white/5 border border-white/10 hover:border-white/20 rounded-lg p-4 text-left transition-all hover:bg-white/10"
          >
            <p className="text-xs text-gray-400 mb-1">Ask:</p>
            <p className="text-sm text-white font-medium">Explain the schema</p>
          </button>
          <button 
            onClick={() => {
              setInputValue("What are the key business entities and their purposes?")
            }}
            className="bg-white/5 border border-white/10 hover:border-white/20 rounded-lg p-4 text-left transition-all hover:bg-white/10"
          >
            <p className="text-xs text-gray-400 mb-1">Ask:</p>
            <p className="text-sm text-white font-medium">Business entities</p>
          </button>
        </div>
      </div>
    
  )
}
