namespace LawBridge.Backend.DTOs.UserDocuments;


public class UserDocumentListItemDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

}


// One real, timed step the backend agent actually performed while
// processing a specific uploaded document — not scripted copy. Returned
// only on the live /api/documents/upload response (not persisted) so the
// frontend can render the true agentic pipeline for that upload.
public class DocumentAgentTraceStepDto
{

    public int Step { get; set; }

    // Stable key the frontend maps to an icon: understand, extract,
    // explain, translate, memory.
    public string Key { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    // Real, request-specific detail describing what actually happened.
    public string Detail { get; set; } = string.Empty;

    // "done" | "fallback" | "warning"
    public string Status { get; set; } = "done";

    public long DurationMs { get; set; }

}


public class UserDocumentDetailDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string ExtractedText { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; }

    // Real, timed trace of the steps the agent took while processing THIS
    // upload (text extraction, AI explanation, translation, memory write).
    // Empty when re-fetching a previously processed document.
    public List<DocumentAgentTraceStepDto> Trace { get; set; } = new();

}