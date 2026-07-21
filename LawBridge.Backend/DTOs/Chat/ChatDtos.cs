namespace LawBridge.Backend.DTOs.Chat;


public class AskQuestionDto
{

    public string Question { get; set; } = string.Empty;

    // "English" | "Sinhala" | "Tamil" — FR-05
    public string Language { get; set; } = "English";

}


public class ChatAnswerDto
{

    public int Id { get; set; }

    public string Question { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    // FR-06 — e.g. "Labour Law - Employment Termination"
    public string Category { get; set; } = string.Empty;

    // FR-07
    public string Explanation { get; set; } = string.Empty;

    public string RelevantLegalInfo { get; set; } = string.Empty;

    public List<string> PossibleActions { get; set; } = new();

    public List<string> RequiredDocuments { get; set; } = new();

    // FR-08
    public string WhenToConsultLawyer { get; set; } = string.Empty;

    public List<string> Sources { get; set; } = new();

    // FR-15/16
    public bool IsSaved { get; set; }

    // Set only when the person asked for Sinhala/Tamil but the local
    // model's translation didn't reliably land in that script — the
    // content shown falls back to English in that case.
    public string? TranslationNote { get; set; }

    public DateTime CreatedAt { get; set; }

}


public class ChatHistoryItemDto
{

    public int Id { get; set; }

    public string Question { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public bool IsSaved { get; set; }

    public DateTime CreatedAt { get; set; }

}


public class UpdateSavedDto
{

    public bool IsSaved { get; set; }

}
