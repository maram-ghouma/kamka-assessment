import UploadZone from '@/components/UploadZone'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
      {/* Wordmark */}
      <div className="flex items-center gap-2 mb-16">
        <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-text-primary tracking-tight">DocAI</span>
      </div>

      {/* Headline */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-text-primary tracking-tight mb-3 leading-tight">
          Ask your documents anything
        </h1>
        <p className="text-text-secondary text-base max-w-sm mx-auto leading-relaxed">
          Upload a file and start a conversation grounded in your content.
        </p>
      </div>

      {/* Upload zone */}
      <UploadZone />

      {/* Privacy note */}
      <div className="mt-8 flex items-center gap-1.5">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-xs text-text-muted">
          Your documents are processed locally. Nothing is stored externally.
        </p>
      </div>
    </main>
  )
}
