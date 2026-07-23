namespace LawBridge.Backend.Models;


public class ChatMessage
{

    public int Id { get; set; }


    public int UserId { get; set; }


    public string Question { get; set; } = string.Empty;

    public string Language { get; set; } = "English";


    // ---- AI response fields (FR-06, FR-07, FR-08) ----

    public string Category { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

    public string RelevantLegalInfo { get; set; } = string.Empty;

    // JSON-serialized string[] of possible actions
    public string PossibleActions { get; set; } = "[]";

    // JSON-serialized string[] of required documents
    public string RequiredDocuments { get; set; } = "[]";

    public string WhenToConsultLawyer { get; set; } = string.Empty;

    // JSON-serialized string[] of source document titles used for RAG
    public string SourceDocuments { get; set; } = "[]";

    // FR-15/16 — person can save a useful answer to revisit later
    public bool IsSaved { get; set; } = false;

    // Set when the model asked for more detail instead of answering —
    // the fields above are left empty in that case.
    public bool NeedsClarification { get; set; } = false;

    public string? ClarifyingQuestion { get; set; }


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}
