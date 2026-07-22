namespace LawBridge.Backend.DTOs.Admin;


public class AdminChatLogListItemDto
{

    public int Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string UserEmail { get; set; } = string.Empty;

    public string Question { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

}


public class AdminChatLogDetailDto
{

    public int Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string UserEmail { get; set; } = string.Empty;

    public string Question { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

    public string RelevantLegalInfo { get; set; } = string.Empty;

    public List<string> PossibleActions { get; set; } = new();

    public List<string> RequiredDocuments { get; set; } = new();

    public string WhenToConsultLawyer { get; set; } = string.Empty;

    public List<string> Sources { get; set; } = new();

    public DateTime CreatedAt { get; set; }

}
