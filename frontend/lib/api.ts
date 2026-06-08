const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface UploadResponse {
  document_id: string
  filename: string
  chunk_count: number
}

export interface Source {
  document_id: string
  filename: string
  excerpt: string
  chunk_index: number
}

export interface QueryResponse {
  answer: string
  sources: Source[]
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `Upload failed with status ${res.status}`)
  }

  return res.json()
}
let sessionId = "";
export async function queryDocuments(
  question: string,
  document_ids: string[]
): Promise<QueryResponse> {
  const res = await fetch(`${BASE_URL}/agent/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_ids,session_id: sessionId    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `Query failed with status ${res.status}`)
  }
  const data = await res.json();
  if (data.session_id) {
    sessionId = data.session_id;
  }

  return data;
}
