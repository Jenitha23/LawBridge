namespace LawBridge.Backend.DTOs.Documents;


public class LegalDocumentListItemDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    // "Processed" | "Processing" | "Failed"
    // Derived from LegalChunks in the RAG database rather than stored,
    // since chunking + embedding happens synchronously during upload.
    public string Status { get; set; } = "Processing";

}
