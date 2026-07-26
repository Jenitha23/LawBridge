# LawBridge

**AI-powered multilingual legal awareness platform for Sri Lankan citizens**

IDEALIZE 2026 — Team CodeNova | Open Category | Web

## Purpose

Many Sri Lankan citizens face legal problems — unpaid salary, EPF issues, rental disputes, online scams, defective products — but don't clearly understand their rights or the correct first step to take. Legal language is difficult, consultation is expensive and hard to access, and guidance often isn't available in Sinhala or Tamil.

LawBridge is a multilingual legal awareness web application that lets a user describe a legal problem or upload a legal document, and returns a plain-language explanation, the relevant legal information, and practical next steps — in Sinhala, Tamil, or English. It does not replace a lawyer; it helps people understand their situation well enough to take an informed first step, including knowing when to consult a professional.

The current prototype focuses on three legal areas: **Labour Law, Tenancy Issues, and Consumer Protection.**

## Tech Stack

This matches the architecture in the team proposal.

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Axios |
| Backend | ASP.NET Core Web API (.NET 8) |
| Database | PostgreSQL, with a dedicated `pgvector`-enabled instance for embeddings |
| ORM | Entity Framework Core 9 (Npgsql) |
| AI / LLM | Gemini (`gemini-3.1-flash-lite` for reasoning, translation, and category classification; `gemini-embedding-001` for embeddings) |
| OCR | Tesseract (`eng+sin+tam` trained data) |
| Auth | JWT Bearer authentication, BCrypt password hashing |
| PDF handling | iText7 |
| Validation | FluentValidation |
| API docs | Swagger / OpenAPI |

### Licensing

All third-party tools and APIs used are properly licensed for this use case:

- **Gemini API (Google)** — used under Google's API terms, accessed via a project-issued API key.
- **Tesseract OCR** — Apache License 2.0 (open-source), bundled with `eng`, `sin`, and `tam` trained data.
- **React, ASP.NET Core, Entity Framework Core, Npgsql, Pgvector, iText7 (AGPL/commercial dual-licensed — used here under its open-source terms), FluentValidation, Swashbuckle** — all open-source, used under their respective MIT/Apache/BSD licenses.
- **BCrypt.Net-Next, System.IdentityModel.Tokens.Jwt** — open-source, MIT-licensed.

No proprietary or unlicensed third-party assets are used in this prototype.

## Core Features

- **AI Legal Chat Assistant** — ask a legal question in Sinhala, Tamil, or English and get a structured explanation with sources.
- **Legal issue classification** — questions are automatically classified into a legal category before retrieval.
- **RAG-based legal information retrieval** — answers are grounded in a `pgvector` similarity search over an embedded legal knowledge base, not the model's own memory.
- **OCR-based document explanation** — upload a notice, agreement, or contract; the system extracts the text and explains it in plain language.
- **Legal topics browsing** — browse legal categories and documents directly.
- **Saved answers & user profile management** — users can save useful answers and manage their account.
- **Chat history** — conversations are persisted per user and can be continued.
- **Admin dashboard** — review, update, and manage legal content, categories, uploaded documents, users, and chat logs, with analytics.
- **Multilingual UI** — the interface itself, not just the AI answers, supports Sinhala, Tamil, and English.

## AI Agent Workflow (Open Category)

LawBridge uses a **Goal-Based Legal Guidance Agent**. For every question, the backend (`LegalChatService`) runs a real, multi-step pipeline — not a single prompt — and returns a live trace of what actually happened for that specific request:

1. **Understand** — parses the incoming question, language, and any existing conversation thread.
2. **Classify** — Gemini classifies the question into a legal category to narrow retrieval; if classification is inconclusive, the agent falls back to an unrestricted search.
3. **Embed** — the question is converted into a vector using `gemini-embedding-001`.
4. **Retrieve** — a `pgvector` cosine-similarity search returns the top matching legal chunks, scoped to the classified category first, and automatically widened to the full database if that scope returns nothing.
5. **Build context** — retrieved chunks are assembled into grounding context for the model, together with source document titles.
6. **Reason** — Gemini reasons over the retrieved context and produces a structured JSON answer (category, plain-language explanation, relevant legal info, possible actions, required documents, and when to consult a lawyer).
7. **Guardrail** — if the model tries to ask a clarifying question indefinitely, the agent detects the repeated clarification loop and forces a real answer using the best available context instead.
8. **Clarify (conditional)** — if the question is genuinely too vague, the agent asks one targeted follow-up question instead of guessing, and remembers the answer on the next turn.
9. **Translate (conditional)** — if the user requested Sinhala or Tamil, the finished English answer is translated in a separate, narrower Gemini call, with a script check to confirm the translation actually switched script before it's shown to the user; otherwise it falls back to English.
10. **Persist** — the exchange is saved to chat history under the conversation thread.

For document uploads, a parallel agentic flow applies: **OCR extraction → AI explanation in plain language → structured guidance**, using the same reasoning and translation steps described above.

This is a real, running agent — every step above executes against live services (Gemini, `pgvector`, Tesseract) for each request; no step is simulated or hard-coded to look like reasoning.

## Setup Instructions

### Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- PostgreSQL 14+ with the `pgvector` extension available
- A Gemini API key

### 1. Database

Create two PostgreSQL databases (or two instances) — one for application data, one for the RAG/embeddings store with `pgvector` enabled:

```sql
CREATE DATABASE "LawBridge";
CREATE DATABASE "LawBridgeRAG";
-- on the RAG database:
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend (`LawBridge.Backend`)

```bash
cd LawBridge.Backend
```

Set the following in `appsettings.Development.json` or environment variables (do **not** commit real secrets):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=LawBridge;Username=<user>;Password=<password>",
    "RagConnection": "Host=localhost;Port=5433;Database=LawBridgeRAG;Username=<user>;Password=<password>"
  },
  "Jwt": {
    "Key": "<a long random secret>",
    "Issuer": "LawBridge",
    "Audience": "LawBridgeUsers",
    "ExpireMinutes": 60
  },
  "Gemini": {
    "ApiKey": "<your Gemini API key>",
    "EmbeddingModel": "gemini-embedding-001",
    "EmbeddingDimensions": 1536,
    "ChatModel": "gemini-3.1-flash-lite"
  }
}
```

Then run:

```bash
dotnet restore
dotnet run
```

Database migrations are applied automatically on startup. The API is served with Swagger UI enabled for exploring endpoints. Tesseract's `tessdata` folder is bundled with the project (`eng`, `sin`, `tam`) — no separate install is required.

### 3. Frontend (`LawBridge.Frontend`)

```bash
cd LawBridge.Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default and is pre-configured (CORS) to talk to the backend. Confirm the API base URL in `src/api/axios.js` / `src/api/adminAxios.js` matches your backend's running port.

### 4. Login

Register a new user from the app's Register page, or use the admin login route for the admin dashboard (seeded/created separately depending on your setup).

## Pivots from the Original Proposal

The core tech stack, feature set, and agent concept (Goal-Based Legal Guidance Agent: classify → retrieve → reason → respond) all match the original proposal without change. One refinement was made during implementation:

- **Added a real-time agent trace and a clarification-loop guardrail.** The original proposal described the 5-step agent flow at a conceptual level. During development, the agent was extended so that each step (classify, embed, retrieve, reason, translate, etc.) is logged with real timing and status and returned to the frontend, so the AI Agent's reasoning is visible rather than only described. A guardrail was also added to stop the model from asking clarifying questions indefinitely — after a couple of clarification rounds, the agent forces a real answer using the best available context. This is an enhancement to agent *behavior*, not a change to the tech stack, the proposed features, or the problem being solved.

If any further pivots occur before the next submission stage (e.g. a change in AI provider, database, or scope beyond Labour Law/Tenancy/Consumer Protection), they will be documented here with justification, as required by the guidelines.

## Future Plans

- Expand legal coverage beyond Labour Law, Tenancy, and Consumer Protection into Family Law, Land Law, Business Law, and Traffic Law.
- Partnerships with universities, NGOs, legal aid centers, and community organizations to extend reach and keep the legal knowledge base verified and current.
- Mobile app support.
- Expert review workflow for legal content updates.

## Team

| Name | Institution |
|---|---|
| Pratheesa S | SLIIT |
| Tharumina A V G R | SLIIT |
| Viduranga H B R S | SLIIT |
| Wickramaarachchi D S | SLIIT |
| Jenitha J M | SLIIT |

## Important Note

LawBridge does not replace lawyers. It provides safe legal awareness and first-step guidance before users seek professional legal advice.
