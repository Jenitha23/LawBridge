namespace LawBridge.Backend.Models;


public class LegalChunk
{

    public int Id { get; set; }



    public string Text { get; set; }
        = string.Empty;



    public int DocumentId { get; set; }



    public LegalDocument Document { get; set; }



}