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



    // Foreign key

    public int CategoryId { get; set; }



    // Navigation

    public LegalCategory Category { get; set; }



    public ICollection<LegalChunk> Chunks { get; set; }
        = new List<LegalChunk>();

}