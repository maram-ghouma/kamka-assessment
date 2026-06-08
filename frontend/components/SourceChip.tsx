'use client'

import { useState } from 'react'
import { Source } from '@/context/AppContext'

interface SourceChipProps {
  source: Source
  index: number
}

export default function SourceChip({ source, index }: SourceChipProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
          border transition-all duration-150 mr-1.5 mb-1.5
          ${expanded
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-background border-border text-text-secondary hover:border-[#2a2a2a] hover:text-text-primary'
          }
        `}
      >
        <span className="w-3.5 h-3.5 rounded-sm bg-accent/20 text-accent text-[9px] flex items-center justify-center font-bold flex-shrink-0">
          {index + 1}
        </span>
        <span className="max-w-[120px] truncate">{source.filename}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-shrink-0 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="animate-slide-up mt-1 mb-2 p-3 rounded-md bg-background border border-border max-w-md">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[10px] text-text-secondary font-medium">{source.filename}</span>
            <span className="text-[10px] text-text-muted">· chunk {source.chunk_index}</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">{source.excerpt}</p>
        </div>
      )}
    </div>
  )
}
