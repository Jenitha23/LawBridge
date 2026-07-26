using System.ComponentModel.DataAnnotations;


namespace LawBridge.Backend.Models;


public class LegalCategory
{

    public int Id { get; set; }


    [Required]
    public string Name { get; set; } = string.Empty;



    public string Description { get; set; } = string.Empty;



    // Optional translations — the topic browser falls back to the
    // English Name/Description above when these are blank, so filling
    // them in is encouraged but not required to keep a category usable.
    public string? NameSinhala { get; set; }

    public string? DescriptionSinhala { get; set; }

    public string? NameTamil { get; set; }

    public string? DescriptionTamil { get; set; }



    // Navigation property

    public ICollection<LegalDocument> LegalDocuments { get; set; }
        = new List<LegalDocument>();

}