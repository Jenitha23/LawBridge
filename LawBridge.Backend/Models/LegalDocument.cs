using System.ComponentModel.DataAnnotations;


namespace LawBridge.Backend.Models;


public class LegalDocument
{

    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string Language { get; set; } = "English";

    public string Source { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    // Incremented each time a user opens this document via the Legal
    // Topics feature (not counted for admin viewing their own uploads)
    public int ViewCount { get; set; } = 0;

    // Foreign key
    public int CategoryId { get; set; }

    // Navigation
    public LegalCategory Category { get; set; }
}