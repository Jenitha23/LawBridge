# ⚖️ LawBridge – AI-Powered Multilingual Legal Awareness Platform

## IDEALIZE 2026 – Open Category Prototype

LawBridge is an AI-powered multilingual legal awareness web application designed to help Sri Lankan citizens understand basic legal issues and identify the correct first step before seeking professional legal advice.

The prototype focuses on three legal domains:

- Labour Law
- Tenancy Issues
- Consumer Protection

Instead of providing generic chatbot responses, LawBridge uses a Retrieval-Augmented Generation (RAG) architecture with a Goal-Based AI Legal Guidance Agent to retrieve verified legal information from Sri Lankan legal documents before generating structured legal guidance.

---

# Problem Statement

Many Sri Lankan citizens struggle to understand their legal rights because:

- Legal language is difficult to understand
- Legal consultation is expensive
- Legal guidance is not easily available in Sinhala, Tamil and English
- Citizens often delay taking action or make incorrect legal decisions

LawBridge addresses these challenges by providing accessible, multilingual, AI-assisted legal awareness.

---

# Key Features

## User Features

- User Registration & Login
- Secure JWT Authentication
- AI Legal Chat Assistant
- Legal Issue Classification
- OCR-based Legal Document Upload
- AI-powered Document Explanation
- Legal Topics Browser
- Save Legal Answers
- Chat History
- User Profile Management
- Multilingual Support
  - English
  - Sinhala
  - Tamil

---

## Admin Features

- Admin Dashboard
- User Management
- Legal Document Management
- Category Management
- Analytics Dashboard
- Chat Log Monitoring
- Knowledge Base Management

---

# AI Agent Workflow

Unlike a traditional chatbot, LawBridge follows a multi-step AI agent workflow.

```
User Question
      │
      ▼
Understand User Query
      │
      ▼
Classify Legal Category
      │
      ▼
Generate Semantic Embedding
      │
      ▼
Retrieve Relevant Legal Chunks
(pgvector Vector Search)
      │
      ▼
Build Verified Legal Context
      │
      ▼
AI Legal Reasoning
(Gemini + RAG)
      │
      ▼
Generate Structured Legal Guidance
      │
      ▼
Store Chat History & Sources
```

### AI Agent Capabilities

- Context-aware conversations
- Legal issue classification
- Retrieval-Augmented Generation (RAG)
- Vector similarity search using pgvector
- OCR-based document processing
- Multi-step reasoning
- Conversation memory
- Source-grounded responses

---

# System Architecture

```
React Frontend
        │
        ▼
ASP.NET Core Web API
        │
 ┌──────┴─────────┐
 │                │
 ▼                ▼
OCR Service     AI Agent
(Tesseract)    (Gemini)
 │                │
 └──────┬─────────┘
        ▼
Embedding Service
        │
        ▼
pgvector Legal Knowledge Base
        │
        ▼
Structured Legal Response
```

---

# Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- CSS

## Backend

- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication
- BCrypt Password Hashing

## AI Technologies

- Google Gemini API
- Gemini Embedding Model
- Retrieval-Augmented Generation (RAG)
- Goal-Based AI Agent

## OCR

- Tesseract OCR
- English
- Sinhala
- Tamil

## Database

- PostgreSQL
- pgvector

---

# Project Structure

```
LawBridge

├── Frontend
│   ├── Components
│   ├── Pages
│   ├── Services
│   └── Contexts
│
├── Backend
│   ├── Controllers
│   ├── Services
│   ├── Models
│   ├── Repositories
│   ├── Middleware
│   ├── Data
│   └── AI
│
└── Database
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-repository.git
```

---

## Backend

```bash
cd LawBridge.Backend

dotnet restore

dotnet ef database update

dotnet run
```

---

## Frontend

```bash
cd LawBridge.Frontend

npm install

npm run dev
```

---

# Environment Variables

Backend

```
GEMINI_API_KEY=

ConnectionStrings__DefaultConnection=

JWT_SECRET=

JWT_ISSUER=

JWT_AUDIENCE=
```

---

# Prototype Scope

Current prototype focuses on:

- Labour Law
- Tenancy Issues
- Consumer Protection

The system provides legal awareness and first-step guidance only.

---

# Future Improvements

- Family Law
- Land Law
- Business Law
- Mobile Application
- Voice-based Legal Assistant
- Government Service Integration
- Lawyer Referral System
- Knowledge Base Expansion
- Advanced AI Planning
- Offline Legal Knowledge Support

---

# Team

CodeNova

IDEALIZE 2026

LawBridge

---

# Disclaimer

LawBridge provides legal awareness and first-step guidance using verified legal information.

The application does **not** provide professional legal advice and should not be considered a substitute for consulting a qualified legal professional.

---

# License

This project was developed for the IDEALIZE 2026 Innovation Competition.

Educational Prototype.
