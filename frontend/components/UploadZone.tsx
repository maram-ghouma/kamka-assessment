'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { uploadDocument, UploadResponse } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'

type UploadState = 'idle' | 'dragging' | 'selected' | 'uploading' | 'success' | 'error'

export default function UploadZone() {
  const [state, setState] = useState<UploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { addDocument } = useApp()

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFile = (file: File) => {
    const allowed = ['application/pdf', 'text/plain']
    if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setErrorMsg('Only .pdf and .txt files are supported.')
      setState('error')
      return
    }
    setSelectedFile(file)
    setState('selected')
    setErrorMsg('')
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setState('dragging')
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setState(selectedFile ? 'selected' : 'idle')
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setState('uploading')
    setErrorMsg('')

    try {
      const res = await uploadDocument(selectedFile)
      setResult(res)
      addDocument({ document_id: res.document_id, filename: res.filename, chunk_count: res.chunk_count })
      setState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setSelectedFile(null)
    setResult(null)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const isIdle = state === 'idle' || state === 'dragging'
  const isDragging = state === 'dragging'

  return (
    <div className="w-full max-w-xl mx-auto">
      {state !== 'success' ? (
        <div
          className={`
            relative border rounded-lg p-10 text-center cursor-pointer
            transition-all duration-200 ease-out
            ${isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-[#2a2a2a] bg-surface'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => isIdle && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleInputChange}
          />

          {isIdle && (
            <div className="animate-fade-in">
              <div className="w-10 h-10 mx-auto mb-4 rounded-lg border border-border flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-text-primary text-sm font-medium mb-1">
                {isDragging ? 'Drop it here' : 'Drag & drop your file here'}
              </p>
              <p className="text-text-secondary text-xs">
                or <span className="text-accent">browse to upload</span> — PDF or TXT
              </p>
            </div>
          )}

          {(state === 'selected' || state === 'uploading' || state === 'error') && selectedFile && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 p-3 rounded-md bg-background border border-border text-left">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-accent/10 border border-accent/20 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-text-secondary text-xs">{formatBytes(selectedFile.size)}</p>
                </div>
                {state !== 'uploading' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset() }}
                    className="text-text-secondary hover:text-text-primary transition-colors p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {state === 'error' && errorMsg && (
                <p className="text-red-400 text-xs mb-4 text-left">{errorMsg}</p>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleUpload() }}
                disabled={state === 'uploading'}
                className={`
                  w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium
                  transition-all duration-150
                  ${state === 'uploading'
                    ? 'bg-accent/50 text-white/50 cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-hover text-white cursor-pointer'
                  }
                `}
              >
                {state === 'uploading' ? (
                  <>
                    <Spinner />
                    Uploading…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload file
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-10 text-center bg-surface animate-slide-up">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-text-primary text-sm font-medium mb-1">File uploaded successfully</p>
          <p className="text-text-secondary text-xs mb-1">{result?.filename}</p>
          {result?.chunk_count !== undefined && (
            <p className="text-text-muted text-xs mb-6">{result.chunk_count} chunks indexed</p>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleReset}
              className="py-2 px-4 rounded-md text-xs font-medium text-text-secondary border border-border hover:border-[#2a2a2a] hover:text-text-primary transition-all"
            >
              Upload another
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="py-2 px-4 rounded-md text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-all flex items-center gap-1.5"
            >
              Start chatting
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {state === 'error' && !selectedFile && errorMsg && (
        <p className="mt-3 text-red-400 text-xs text-center">{errorMsg}</p>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
