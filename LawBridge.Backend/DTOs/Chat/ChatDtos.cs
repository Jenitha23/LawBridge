namespace LawBridge.Backend.DTOs.Chat;


public class AskQuestionDto
{

    public string Question { get; set; } = string.Empty;

    // "English" | "Sinhala" | "Tamil" — FR-05
    public string Language { get; set; } = "English";

    // Recent turns from the same on-screen conversation, oldest first.
    // Sent by the frontend from its client-side thread state — capped
    // to the last few exchanges so the prompt doesn't grow unbounded.
    public List<ChatContextItemDto>? History { get; set; }

}


public class ChatContextItemDto
{

    public string Question { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

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

    // When true, the model judged the question too vague to answer
    // reliably and is asking for more detail instead of guessing —
    // the other answer fields are empty in that case.
    public bool NeedsClarification { get; set; }

    public string? ClarifyingQuestion { get; set; }

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
