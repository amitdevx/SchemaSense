"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Clean up markdown content to prevent backticks from breaking formatting
  const cleanContent = content
    .replace(/`([^`]*_[^`]*)`/g, (match, p1) => {
      // If backticks contain underscores, it's likely trying to use backticks with emphasis
      // Replace with just the content to let markdown handle it properly
      return p1;
    });

  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-3 mt-4" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mb-2 mt-3" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold text-white mb-2 mt-2" {...props} />,
          h5: ({ node, ...props }) => <h5 className="font-bold text-white mb-2 mt-2" {...props} />,
          h6: ({ node, ...props }) => <h6 className="font-bold text-gray-300 mb-2 mt-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-gray-300 leading-relaxed mb-3" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-200" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-white/10 text-blue-300 px-2 py-1 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="bg-white/5 text-blue-300 p-3 rounded block font-mono text-sm mb-3 overflow-x-auto" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="bg-white/5 p-4 rounded-lg mb-4 overflow-x-auto" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 py-2 mb-4 text-gray-300 italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-3 text-gray-300 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-3 text-gray-300 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-white/10 border border-white/20" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="border border-white/20" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left font-bold text-white border-r border-white/10 last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-gray-300 border-r border-white/10 last:border-r-0" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-t border-white/10" {...props} />
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  )
}
