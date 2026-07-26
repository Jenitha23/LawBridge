namespace LawBridge.Backend.DTOs.Documents;


// One real, timed step the backend agent actually performed while
// ingesting a specific admin-uploaded legal document into the RAG
// knowledge base — not scripted copy. Returned only on the live
// /api/admin/documents/upload response (not persisted).
public class AdminDocumentTraceStepDto
{

    public int Step { get; set; }

    // Stable key the frontend maps to an icon: understand, extract,
    // store, chunk, embed, index.
    public string Key { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    // Real, request-specific detail describing what actually happened.
    public string Detail { get; set; } = string.Empty;

    // "done" | "fallback" | "warning"
    public string Status { get; set; } = "done";

    public long DurationMs { get; set; }

}


public class DocumentUploadResultDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = string.Empty;

    public int ChunkCount { get; set; }

    public int EmbeddedChunkCount { get; set; }

    public string Message { get; set; } = string.Empty;

    // Real, timed trace of the steps the agent took to ingest THIS
    // document (text extraction, chunking, embedding each chunk,
    // vector-index write). Empty when re-fetching an old document.
    public List<AdminDocumentTraceStepDto> Trace { get; set; } = new();

}