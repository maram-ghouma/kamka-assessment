'use client'

import { useState } from 'react'
import { Message } from '@/context/AppContext'
import SourceChip from './SourceChip'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [sourcesOpen, setSourcesOpen] = useState(true)
  const isUser = message.role === 'user'
  const hasSources = message.sources && message.sources.length > 0

  return (
    <div className={`flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isUser ? 'max-w-[65%]' : 'max-w-[80%]'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#6366F1">
                <circle cx="12" cy="12" r="5" />
              </svg>
            </div>
            <span className="text-[11px] text-text-secondary font-medium">Assistant</span>
          </div>
        )}

        <div
          className={`
            px-4 py-3 rounded-xl text-sm leading-relaxed
            ${isUser
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-surface text-text-primary border border-border rounded-bl-sm'
            }
          `}
        >
          {message.content}
        </div>

        {hasSources && (
          <div className="mt-2">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-text-primary transition-colors mb-1.5"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-150 ${sourcesOpen ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              {message.sources!.length} {message.sources!.length === 1 ? 'source' : 'sources'}
            </button>

            {sourcesOpen && (
              <div className="flex flex-wrap animate-fade-in">
                {message.sources!.map((source, i) => (
                  <SourceChip key={`${source.document_id}-${source.chunk_index}`} source={source} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ThinkingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#6366F1">
              <circle cx="12" cy="12" r="5" />
            </svg>
          </div>
          <span className="text-[11px] text-text-secondary font-medium">Assistant</span>
        </div>
        <div className="px-4 py-3.5 rounded-xl rounded-bl-sm bg-surface border border-border flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-dot-bounce dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-dot-bounce dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-dot-bounce dot-3" />
        </div>
      </div>
    </div>
  )
}
