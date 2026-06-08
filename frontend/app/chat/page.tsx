'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { queryDocuments } from '@/lib/api'
import DocumentSidebar from '@/components/DocumentSidebar'
import ChatMessage, { ThinkingIndicator } from '@/components/ChatMessage'
import InputBar from '@/components/InputBar'

export default function ChatPage() {
  const router = useRouter()
  const { uploadedDocuments, messages, addMessage } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if no documents uploaded
  useEffect(() => {
    if (uploadedDocuments.length === 0) {
      router.push('/')
    }
  }, [uploadedDocuments, router])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (question: string) => {
    setError('')
    addMessage({ role: 'user', content: question })
    setIsLoading(true)

    try {
      const documentIds = uploadedDocuments.map(d => d.document_id)
      const res = await queryDocuments(question, documentIds)
      addMessage({
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <DocumentSidebar />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">DocAI</span>
          <span className="text-text-muted text-xs ml-auto">{uploadedDocuments.length} doc{uploadedDocuments.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          {messages.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <ThinkingIndicator />}
              {error && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-[80%] px-4 py-3 rounded-xl rounded-bl-sm bg-red-950/30 border border-red-900/40 text-red-400 text-sm">
                    {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="max-w-2xl w-full mx-auto w-full">
          <InputBar onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="text-sm text-text-secondary">Ask your first question below.</p>
      <p className="text-xs text-text-muted mt-1">Your answers will be grounded in your uploaded documents.</p>
    </div>
  )
}
