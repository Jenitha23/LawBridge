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

}
