namespace LawBridge.Backend.DTOs.Documents;


public class LegalDocumentDetailDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = "Processing";

    public int ChunkCount { get; set; }

    public int EmbeddedChunkCount { get; set; }

    public int ContentLength { get; set; }

}
