# DocAI

A document-grounded AI assistant. Upload a PDF or TXT file, ask questions, and get answers grounded in your content with source citations.

---

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- Or, if running locally: Python 3.10+ and Node.js 20+

---

## Project Structure

```
/
├── backend/          # FastAPI app
│   ├── .env          # backend environment variables (create this)
│   └── Dockerfile
├── frontend/         # Next.js 14 app
│   └── Dockerfile
└── docker-compose.yml
```

---

## Running with Docker (recommended)

**1. Clone the repo**

```bash
git clone <your-repo-url>
cd <your-repo>
```

**2. Create the backend environment file**

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your values (API keys, model config, etc.).

**3. Build and start everything**

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**4. Stopping**

```bash
docker compose down
```

To also remove the persisted Chroma vector store:

```bash
docker compose down -v
```

---

## Running Locally (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000) and expects the backend at `http://localhost:8000` by default.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key — get one free at [console.groq.com](https://console.groq.com) |
| `CHROMA_PATH` | `./chroma_db` |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` |
| `LLM_MODEL` | `llama-3.3-70b-versatile` |
### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL — set automatically in Docker |

---

## Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Upload a `.pdf` or `.txt` file
3. Wait for the upload to complete — you'll see the chunk count once it's indexed
4. Click **Start chatting** and ask questions about your document

---

## Known Limitations

- Session state is not persisted — refreshing the page resets the document list and chat history
- `session_id` is not currently sent in query requests
- Mobile sidebar is hidden; uploaded documents are not visible on small screens
