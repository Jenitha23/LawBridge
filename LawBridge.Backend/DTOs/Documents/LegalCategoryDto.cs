namespace LawBridge.Backend.DTOs.Documents;


public class LegalCategoryDto
{

    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DocumentCount { get; set; }

}
