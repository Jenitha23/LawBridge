namespace LawBridge.Backend.DTOs.Documents;


public class UpdateDocumentDto
{

    public string Title { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string Language { get; set; } = "English";

}
