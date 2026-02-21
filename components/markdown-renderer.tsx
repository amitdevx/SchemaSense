"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const cleanContent = content
    .replace(/`([^`]*_[^`]*)`/g, (_, p1) => p1);

  return (
    <div className={`max-w-none prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 pb-2 border-b border-white/10" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-3 mt-5 pb-1 border-b border-white/10" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-white mb-2 mt-4" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-white mb-2 mt-3" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-semibold text-white mb-1 mt-2" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-sm font-semibold text-gray-300 mb-1 mt-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-gray-300 leading-relaxed mb-3 text-sm" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-200" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          del: ({ node, ...props }) => <del className="line-through text-gray-500" {...props} />,
          code: ({ node, inline, className: codeClassName, ...props }: any) => {
            const isInline = inline || !codeClassName;
            if (isInline) {
              return (
                <code className="bg-white/15 text-blue-300 px-1.5 py-0.5 rounded text-[13px] font-mono border border-white/10" {...props} />
              );
            }
            const lang = codeClassName?.replace('language-', '') || '';
            return (
              <code className="block bg-black/40 text-green-300 p-4 rounded-lg font-mono text-[13px] leading-relaxed overflow-x-auto border border-white/10" data-language={lang} {...props} />
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-black/40 rounded-lg mb-4 overflow-x-auto border border-white/10 [&>code]:border-0 [&>code]:p-4" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-400/60 pl-4 py-2 mb-4 bg-blue-500/5 rounded-r-lg text-gray-300 italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-3 text-gray-300 space-y-1.5 text-sm" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-3 text-gray-300 space-y-1.5 text-sm" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="text-gray-300 leading-relaxed" {...props}>
              {children}
            </li>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-white/15">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-white/10" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2.5 text-left font-semibold text-white text-xs uppercase tracking-wider border-r border-white/10 last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-gray-300 text-sm border-r border-white/10 last:border-r-0" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50 hover:decoration-blue-300 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t border-white/10" {...props} />
          ),
          input: ({ node, ...props }: any) => {
            if (props.type === 'checkbox') {
              return (
                <input type="checkbox" disabled checked={props.checked} className="mr-2 accent-blue-500" {...props} />
              );
            }
            return <input {...props} />;
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  )
}
