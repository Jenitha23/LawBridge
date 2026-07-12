namespace LawBridge.Backend.DTOs.Documents;


public class UploadDocumentDto
{

    public string Title {get;set;} = string.Empty;


    public string Language {get;set;} = "English";


    public int CategoryId {get;set;}


    public IFormFile File {get;set;} = null!;

}