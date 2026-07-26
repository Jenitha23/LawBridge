namespace LawBridge.Backend.DTOs.Documents;


public class CreateCategoryDto
{

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? NameSinhala { get; set; }

    public string? DescriptionSinhala { get; set; }

    public string? NameTamil { get; set; }

    public string? DescriptionTamil { get; set; }

}


public class UpdateCategoryDto
{

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? NameSinhala { get; set; }

    public string? DescriptionSinhala { get; set; }

    public string? NameTamil { get; set; }

    public string? DescriptionTamil { get; set; }

}