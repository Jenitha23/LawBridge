namespace LawBridge.Backend.Models;


public class UserDocument
{

    public int Id { get; set; }


    public int UserId { get; set; }


    public string Title { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    // "pdf" | "image"
    public string FileType { get; set; } = string.Empty;


    public string ExtractedText { get; set; } = string.Empty;

    // Preferred explanation language — "English" | "Sinhala" | "Tamil"
    public string Language { get; set; } = "English";

    public string Explanation { get; set; } = string.Empty;

    // "Processing" | "Completed" | "Failed"
    public string Status { get; set; } = "Processing";

    public string? ErrorMessage { get; set; }


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}
