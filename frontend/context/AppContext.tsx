'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface UploadedDocument {
  document_id: string
  filename: string
  chunk_count?: number
}

export interface Source {
  document_id: string
  filename: string
  excerpt: string
  chunk_index: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface AppState {
  uploadedDocuments: UploadedDocument[]
  messages: Message[]
  addDocument: (doc: UploadedDocument) => void
  addMessage: (msg: Omit<Message, 'id'>) => void
  clearMessages: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const addDocument = (doc: UploadedDocument) => {
    setUploadedDocuments(prev => {
      const exists = prev.find(d => d.document_id === doc.document_id)
      if (exists) return prev
      return [...prev, doc]
    })
  }

  const addMessage = (msg: Omit<Message, 'id'>) => {
    const newMsg: Message = { ...msg, id: `${Date.now()}-${Math.random()}` }
    setMessages(prev => [...prev, newMsg])
  }

  const clearMessages = () => setMessages([])

  return (
    <AppContext.Provider value={{
      uploadedDocuments,
      messages,
      addDocument,
      addMessage,
      clearMessages,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
