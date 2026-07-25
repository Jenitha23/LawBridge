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

    // Identifies which on-screen chat thread this question belongs to.
    // Null/empty on the very first question of a new chat — the backend
    // generates one and returns it for the frontend to reuse on every
    // follow-up in that same thread.
    public Guid? ConversationId { get; set; }

}


public class ChatContextItemDto
{

    public string Question { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

}


public class ChatAnswerDto
{

    public int Id { get; set; }

    public Guid ConversationId { get; set; }

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

    // Which thread this specific saved answer belongs to — used to jump
    // into the full conversation for context rather than an isolated answer.
    public Guid ConversationId { get; set; }

    public string Question { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public bool IsSaved { get; set; }

    public DateTime CreatedAt { get; set; }

}


// One row per on-screen chat thread (grouped by ConversationId) rather than
// one row per individual question — this is what "Recent Chats" / "My
// Chats" lists. Field names deliberately mirror ChatHistoryItemDto (Id,
// Question, CreatedAt, ...) so the existing history/saved-answers UI keeps
// working against a Guid-typed Id without further changes.
public class ChatConversationSummaryDto
{

    public Guid Id { get; set; }

    // The first question asked in the thread — used as its title.
    public string Question { get; set; } = string.Empty;

    // Category of the most recent turn in the thread.
    public string Category { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    // True if any answer in the thread was saved.
    public bool IsSaved { get; set; }

    // Timestamp of the most recent turn — used for sorting/relative time.
    public DateTime CreatedAt { get; set; }

    public int MessageCount { get; set; }

}


public class UpdateSavedDto
{

    public bool IsSaved { get; set; }

}