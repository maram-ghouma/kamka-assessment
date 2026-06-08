'use client'

import Link from 'next/link'
import { useApp } from '@/context/AppContext'

export default function DocumentSidebar() {
  const { uploadedDocuments } = useApp()

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-border flex flex-col h-full bg-background">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-text-primary tracking-wide uppercase">Documents</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {uploadedDocuments.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-text-muted">No documents uploaded</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {uploadedDocuments.map((doc) => (
              <li key={doc.document_id}>
                <div className="flex items-start gap-2.5 px-2.5 py-2 rounded-md hover:bg-surface transition-colors group">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-text-secondary mt-0.5 flex-shrink-0"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-text-primary font-medium truncate leading-relaxed">
                      {doc.filename}
                    </p>
                    {doc.chunk_count !== undefined && (
                      <p className="text-[10px] text-text-muted mt-0.5">{doc.chunk_count} chunks</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload another
        </Link>
      </div>
    </aside>
  )
}
