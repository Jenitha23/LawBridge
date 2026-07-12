using System.ComponentModel.DataAnnotations;


namespace LawBridge.Backend.Models;


public class LegalCategory
{

    public int Id { get; set; }


    [Required]
    public string Name { get; set; } = string.Empty;



    public string Description { get; set; } = string.Empty;



    // Navigation property

    public ICollection<LegalDocument> LegalDocuments { get; set; }
        = new List<LegalDocument>();

}