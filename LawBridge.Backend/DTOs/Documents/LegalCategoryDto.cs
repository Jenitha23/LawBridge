namespace LawBridge.Backend.DTOs.Documents;


public class LegalCategoryDto
{

    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? NameSinhala { get; set; }

    public string? DescriptionSinhala { get; set; }

    public string? NameTamil { get; set; }

    public string? DescriptionTamil { get; set; }

    public int DocumentCount { get; set; }

}