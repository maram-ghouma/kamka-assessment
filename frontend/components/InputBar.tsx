'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'

interface InputBarProps {
  onSend: (message: string) => void
  disabled: boolean
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = value.trim().length > 0 && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <div className={`
        flex items-end gap-3 rounded-xl border px-4 py-3
        transition-colors duration-150
        ${disabled ? 'border-border bg-surface/50' : 'border-border bg-surface hover:border-[#2a2a2a] focus-within:border-accent/50'}
      `}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder="Ask a question about your documents…"
          rows={1}
          className={`
            flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted
            border-none outline-none resize-none leading-relaxed
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            transition-all duration-150
            ${canSend
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-surface border border-border text-text-muted cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          {disabled ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-[10px] text-text-muted text-center mt-2">
        Press <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-surface border border-border">Enter</kbd> to send · <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-surface border border-border">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
