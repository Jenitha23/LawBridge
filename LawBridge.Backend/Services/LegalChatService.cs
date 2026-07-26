using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Chat;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;

namespace LawBridge.Backend.Services;


public class LegalChatService
{

    private readonly EmbeddingService _embeddingService;
    private readonly LegalSearchService _searchService;
    private readonly AiChatService _aiChatService;
    private readonly IChatRepository _chatRepository;
    private readonly AppDbContext _appContext;
    private readonly ILogger<LegalChatService> _logger;


    public LegalChatService(
        EmbeddingService embeddingService,
        LegalSearchService searchService,
        AiChatService aiChatService,
        IChatRepository chatRepository,
        AppDbContext appContext,
        ILogger<LegalChatService> logger
    )
    {
        _embeddingService = embeddingService;
        _searchService = searchService;
        _aiChatService = aiChatService;
        _chatRepository = chatRepository;
        _appContext = appContext;
        _logger = logger;
    }



    public async Task<ChatAnswerDto> Ask(int userId, AskQuestionDto dto)
    {

        // ---- Real, timed trace of every step this specific request takes ----
        //
        // Purely additive: the pipeline's behavior below is unchanged. Each
        // stage records what actually happened (real category, real match
        // count, real timings, real guardrail decisions) so the frontend
        // can show the true agentic flow — classify -> retrieve -> reason
        // -> guardrail? -> (clarify | translate) -> persist — for this
        // exact question, not a scripted animation.

        var trace = new List<AgentTraceStepDto>();

        void AddStep(string key, string title, string detail, string status, long durationMs)
        {
            trace.Add(new AgentTraceStepDto
            {
                Step = trace.Count + 1,
                Key = key,
                Title = title,
                Detail = detail,
                Status = status,
                DurationMs = durationMs
            });
        }


        // Reuse the thread's id if this is a follow-up in the same
        // on-screen chat; otherwise this is a new chat, so start one.
        var isNewConversation =
            !dto.ConversationId.HasValue || dto.ConversationId.Value == Guid.Empty;

        var conversationId =
            isNewConversation ? Guid.NewGuid() : dto.ConversationId!.Value;

        AddStep(
            "understand",
            "Understanding the question",
            $"Received a {dto.Question.Length}-character question, answer requested in {dto.Language}. " +
                (isNewConversation
                    ? "Starting a new conversation thread."
                    : $"Continuing conversation thread {conversationId} with {dto.History?.Count ?? 0} prior turn(s) of context."),
            "done",
            0
        );


        // ---- 1. Classify the question into a known legal category first ----
        //
        // This narrows retrieval to documents in that category, so the
        // model reasons over more relevant context. If classification is
        // inconclusive (or nothing in that category exists), we fall back
        // to an unrestricted search rather than returning nothing.

        var classifySw = Stopwatch.StartNew();

        var classifiedCategory =
            await ClassifyCategory(dto.Question);

        classifySw.Stop();

        List<int>? allowedDocumentIds = null;

        if (classifiedCategory != null)
        {

            allowedDocumentIds = await _appContext.LegalDocuments
                .Where(d => d.Category != null && d.Category.Name == classifiedCategory)
                .Select(d => d.Id)
                .ToListAsync();

            AddStep(
                "classify",
                "Classifying legal category",
                $"Gemini classified this question as \"{classifiedCategory}\" — retrieval will be narrowed to that category first.",
                "done",
                classifySw.ElapsedMilliseconds
            );

        }
        else
        {

            AddStep(
                "classify",
                "Classifying legal category",
                "No confident single-category match — falling back to an unrestricted search across every legal category.",
                "fallback",
                classifySw.ElapsedMilliseconds
            );

        }


        // ---- 2. Embed the question and retrieve relevant chunks (FR-07) ----

        var embedSw = Stopwatch.StartNew();

        var queryEmbedding =
            await _embeddingService.GenerateEmbedding(dto.Question);

        embedSw.Stop();

        var embeddingDimensions = queryEmbedding.ToArray().Length;

        AddStep(
            "embed",
            "Generating embedding",
            $"Converted the question into a {embeddingDimensions}-dimension vector using gemini-embedding-001.",
            "done",
            embedSw.ElapsedMilliseconds
        );


        var retrieveSw = Stopwatch.StartNew();

        var matches =
            await _searchService.Search(queryEmbedding, topK: 5, allowedDocumentIds: allowedDocumentIds);

        // Classification matched a category, but nothing in it was
        // relevant enough / no chunks — widen back out rather than
        // answering from nothing.
        var widenedSearch = false;

        if (matches.Count == 0 && allowedDocumentIds != null)
        {
            matches = await _searchService.Search(queryEmbedding, topK: 5);
            widenedSearch = true;
        }

        retrieveSw.Stop();

        if (widenedSearch)
        {

            AddStep(
                "retrieve",
                "Searching legal database",
                $"Zero matches inside \"{classifiedCategory}\" — widened to a full-database pgvector cosine-similarity search and found {matches.Count} chunk(s).",
                "fallback",
                retrieveSw.ElapsedMilliseconds
            );

        }
        else
        {

            AddStep(
                "retrieve",
                "Searching legal database",
                $"pgvector cosine-similarity search over embedded legal chunks{(allowedDocumentIds != null ? $" (scoped to \"{classifiedCategory}\")" : " (all categories)")} returned {matches.Count} of top-5 requested match(es).",
                matches.Count > 0 ? "done" : "warning",
                retrieveSw.ElapsedMilliseconds
            );

        }


        var documentIds =
            matches.Select(m => m.DocumentId).Distinct().ToList();

        var documents = await _appContext.LegalDocuments
            .Include(d => d.Category)
            .Where(d => documentIds.Contains(d.Id))
            .ToListAsync();

        var documentsById =
            documents.ToDictionary(d => d.Id);


        var sourceTitles = documentIds
            .Where(id => documentsById.ContainsKey(id))
            .Select(id => documentsById[id].Title)
            .Distinct()
            .ToList();

        AddStep(
            "sources",
            "Retrieved legal sections",
            sourceTitles.Count > 0
                ? $"Found {sourceTitles.Count} source document(s): {string.Join(", ", sourceTitles)}."
                : "No source documents matched closely enough to cite.",
            sourceTitles.Count > 0 ? "done" : "warning",
            0
        );


        var contextSw = Stopwatch.StartNew();

        var contextText = BuildContext(matches, documentsById);

        contextSw.Stop();

        AddStep(
            "context",
            "Building legal context",
            $"Assembled {matches.Count} retrieved chunk(s) into {contextText.Length} characters of grounding context for the model.",
            "done",
            contextSw.ElapsedMilliseconds
        );


        // ---- 3. Ask the local LLM for a structured answer (FR-06, FR-07, FR-08) ----
        //
        // The model reasons and answers in English first, regardless of the
        // requested language — a small local model is far more reliable at
        // legal reasoning in English than at reasoning AND writing fluent
        // Sinhala/Tamil at the same time. If the person asked for another
        // language, we translate the finished English answer as a separate,
        // narrower step (translation-only tasks are more reliable for small
        // models than combined reasoning + generation).

        // Once the conversation already has a couple of exchanges, force an
        // answer instead of allowing another clarifying question — this is
        // the hard stop against the model clarifying indefinitely. (The
        // prompt itself also gets a matching instruction below.)
        var historyRounds = dto.History?.Count ?? 0;
        var mustAnswerNow = historyRounds >= 2;

        var prompt = BuildPrompt(dto.Question, contextText, dto.History, mustAnswerNow);

        var reasonSw = Stopwatch.StartNew();

        var rawResponse =
            await _aiChatService.Generate(prompt);

        reasonSw.Stop();

        var englishAnswer = ParseAnswer(rawResponse);

        AddStep(
            "reason",
            "AI legal reasoning",
            englishAnswer.IsFollowUp
                ? "Gemini (gemini-3.1-flash-lite) judged this as a conversational follow-up rather than a new legal question and drafted a short natural reply."
                : englishAnswer.NeedsClarification
                    ? "Gemini (gemini-3.1-flash-lite) judged the question too vague to answer reliably and is asking a clarifying follow-up instead of guessing."
                    : $"Gemini (gemini-3.1-flash-lite) reasoned over the retrieved context and produced a structured answer categorized as \"{englishAnswer.Category}\".",
            "done",
            reasonSw.ElapsedMilliseconds
        );

        if (mustAnswerNow && englishAnswer.NeedsClarification)
        {
            // Model ignored the "answer now" instruction — override rather
            // than let the loop continue. Fall back to whatever the RAG
            // context contains so the person still gets something useful.
            englishAnswer.NeedsClarification = false;

            var hadNoDraftAnswer = string.IsNullOrWhiteSpace(englishAnswer.Explanation);

            if (hadNoDraftAnswer)
            {
                englishAnswer.Category = classifiedCategory ?? "General";
                englishAnswer.Explanation =
                    "Based on what you've shared so far, here's general guidance on this — for anything more specific to your exact situation, it's best to confirm with the relevant authority or a lawyer.";
                englishAnswer.WhenToConsultLawyer =
                    "If your situation has details not covered here, consult a qualified lawyer or the relevant government department directly.";
            }

            AddStep(
                "guardrail",
                "Preventing a clarification loop",
                $"{historyRounds} clarifying round(s) already happened in this thread, so the agent overrode the model's request for yet another clarifying question and forced a real answer" +
                    (hadNoDraftAnswer ? " using general fallback guidance." : " using the model's own draft."),
                "fallback",
                0
            );

        }


        // ---- 4. If the model needs more detail, ask instead of guessing ----

        if (englishAnswer.NeedsClarification && !string.IsNullOrWhiteSpace(englishAnswer.ClarifyingQuestion))
        {

            var clarifyingQuestion = englishAnswer.ClarifyingQuestion;

            var wantsClarificationTranslation =
                !string.IsNullOrWhiteSpace(dto.Language)
                && !dto.Language.Equals("English", StringComparison.OrdinalIgnoreCase);

            if (wantsClarificationTranslation)
            {

                var clarifyTranslateSw = Stopwatch.StartNew();

                try
                {

                    var translated = await TranslateAnswer(
                        new ChatAnswerDto { Explanation = clarifyingQuestion },
                        dto.Language
                    );

                    clarifyTranslateSw.Stop();

                    if (LooksTranslated(translated, dto.Language))
                    {
                        clarifyingQuestion = translated.Explanation;

                        AddStep(
                            "translate",
                            "Translating clarifying question",
                            $"Translated the clarifying question into {dto.Language} via a separate Gemini translation-only call.",
                            "done",
                            clarifyTranslateSw.ElapsedMilliseconds
                        );
                    }
                    else
                    {

                        AddStep(
                            "translate",
                            "Translating clarifying question",
                            $"Translation into {dto.Language} didn't reliably switch script — showing the English clarifying question instead.",
                            "warning",
                            clarifyTranslateSw.ElapsedMilliseconds
                        );

                    }

                }
                catch (Exception ex)
                {

                    clarifyTranslateSw.Stop();

                    AddStep(
                        "translate",
                        "Translating clarifying question",
                        $"Translation call to {dto.Language} failed — showing the English clarifying question instead.",
                        "warning",
                        clarifyTranslateSw.ElapsedMilliseconds
                    );

                    _logger.LogWarning(
                        ex,
                        "Clarifying-question translation to {Language} failed",
                        dto.Language
                    );

                }

            }


            AddStep(
                "clarify",
                "Asking a clarifying question",
                $"Question is too vague to answer reliably — asking: \"{clarifyingQuestion}\"",
                "done",
                0
            );


            var clarifyMessage = new ChatMessage
            {
                UserId = userId,
                ConversationId = conversationId,
                Question = dto.Question,
                Language = dto.Language,
                Category = classifiedCategory ?? string.Empty,
                NeedsClarification = true,
                ClarifyingQuestion = clarifyingQuestion,
                SourceDocuments = JsonSerializer.Serialize(sourceTitles),
                CreatedAt = DateTime.UtcNow
            };

            var clarifyMemorySw = Stopwatch.StartNew();

            await _chatRepository.Add(clarifyMessage);

            clarifyMemorySw.Stop();

            AddStep(
                "memory",
                "Saving to chat history",
                $"Stored this clarification turn as chat message #{clarifyMessage.Id} in thread {conversationId}.",
                "done",
                clarifyMemorySw.ElapsedMilliseconds
            );


            return new ChatAnswerDto
            {
                Id = clarifyMessage.Id,
                ConversationId = conversationId,
                Question = dto.Question,
                Language = dto.Language,
                Category = classifiedCategory ?? string.Empty,
                NeedsClarification = true,
                ClarifyingQuestion = clarifyingQuestion,
                Sources = sourceTitles,
                CreatedAt = clarifyMessage.CreatedAt,
                Trace = trace
            };

        }


        var finalAnswer = englishAnswer;
        string? translationNote = null;

        var wantsTranslation =
            !string.IsNullOrWhiteSpace(dto.Language)
            && !dto.Language.Equals("English", StringComparison.OrdinalIgnoreCase);

        if (wantsTranslation)
        {

            var translateSw = Stopwatch.StartNew();

            try
            {

                var translated =
                    await TranslateAnswer(englishAnswer, dto.Language);

                translateSw.Stop();

                if (LooksTranslated(translated, dto.Language))
                {
                    finalAnswer = translated;

                    AddStep(
                        "translate",
                        "Translating answer",
                        $"Translated the finished English answer into {dto.Language} via a separate, narrower Gemini call (script-verified).",
                        "done",
                        translateSw.ElapsedMilliseconds
                    );
                }
                else
                {
                    translationNote =
                        $"We couldn't reliably translate this answer into {dto.Language}, so it's shown in English below.";

                    AddStep(
                        "translate",
                        "Translating answer",
                        $"Translation into {dto.Language} didn't reliably switch script — falling back to the English answer.",
                        "warning",
                        translateSw.ElapsedMilliseconds
                    );
                }

            }
            catch (Exception ex)
            {

                translateSw.Stop();

                AddStep(
                    "translate",
                    "Translating answer",
                    $"Translation call to {dto.Language} failed — falling back to the English answer.",
                    "warning",
                    translateSw.ElapsedMilliseconds
                );

                _logger.LogWarning(
                    ex,
                    "Translation to {Language} failed for chat question {Question}",
                    dto.Language,
                    dto.Question
                );

                translationNote =
                    $"Translating this answer into {dto.Language} failed, so it's shown in English below.";

            }

        }


        // ---- 5. Persist to chat history ----

        // A follow-up reply isn't a new retrieval — don't attach source
        // titles to a plain "okay, I will pay" acknowledgment.
        var displaySources = finalAnswer.IsFollowUp ? new List<string>() : sourceTitles;

        var message = new ChatMessage
        {
            UserId = userId,
            ConversationId = conversationId,
            Question = dto.Question,
            Language = dto.Language,
            Category = finalAnswer.Category,
            Explanation = finalAnswer.Explanation,
            RelevantLegalInfo = finalAnswer.RelevantLegalInfo,
            PossibleActions = JsonSerializer.Serialize(finalAnswer.PossibleActions),
            RequiredDocuments = JsonSerializer.Serialize(finalAnswer.RequiredDocuments),
            WhenToConsultLawyer = finalAnswer.WhenToConsultLawyer,
            SourceDocuments = JsonSerializer.Serialize(displaySources),
            IsFollowUp = finalAnswer.IsFollowUp,
            CreatedAt = DateTime.UtcNow
        };

        var memorySw = Stopwatch.StartNew();

        await _chatRepository.Add(message);

        memorySw.Stop();

        AddStep(
            "memory",
            "Saving to chat history",
            $"Stored as chat message #{message.Id} in thread {conversationId} with {displaySources.Count} cited source(s).",
            "done",
            memorySw.ElapsedMilliseconds
        );


        return new ChatAnswerDto
        {
            Id = message.Id,
            ConversationId = conversationId,
            Question = dto.Question,
            Language = dto.Language,
            Category = finalAnswer.Category,
            Explanation = finalAnswer.Explanation,
            RelevantLegalInfo = finalAnswer.RelevantLegalInfo,
            PossibleActions = finalAnswer.PossibleActions,
            RequiredDocuments = finalAnswer.RequiredDocuments,
            WhenToConsultLawyer = finalAnswer.WhenToConsultLawyer,
            Sources = displaySources,
            IsFollowUp = finalAnswer.IsFollowUp,
            TranslationNote = translationNote,
            CreatedAt = message.CreatedAt,
            Trace = trace
        };

    }



    // ---- Classification-before-retrieval ----
    //
    // A short, separate OpenAI call that picks one of the admin's actual
    // legal categories (or "Unknown"). Best-effort: if it fails or doesn't
    // match a real category, callers fall back to an unrestricted search
    // rather than blocking the answer on this step.
    private async Task<string?> ClassifyCategory(string question)
    {

        var categoryNames = await _appContext.LegalCategories
            .Select(c => c.Name)
            .ToListAsync();

        if (categoryNames.Count == 0)
        {
            return null;
        }


        var prompt = $$"""
Classify the following legal question into EXACTLY ONE of these categories:
{{string.Join(", ", categoryNames)}}

If none of them clearly apply, respond with "Unknown".

Respond with a SINGLE JSON object and nothing else, using exactly this key:
{ "category": "the matching category name, or Unknown" }

QUESTION:
{{question}}
""";

        try
        {

            var raw =
                await _aiChatService.Generate(prompt);

            using var doc =
                JsonDocument.Parse(raw);

            var value = doc.RootElement.TryGetProperty("category", out var v) && v.ValueKind == JsonValueKind.String
                ? v.GetString()
                : null;

            return categoryNames.FirstOrDefault(c =>
                string.Equals(c, value, StringComparison.OrdinalIgnoreCase));

        }
        catch (Exception ex)
        {

            _logger.LogWarning(ex, "Category classification failed, falling back to unrestricted search");

            return null;

        }

    }



    private async Task<ChatAnswerDto> TranslateAnswer(ChatAnswerDto english, string language)
    {

        var payload = JsonSerializer.Serialize(new
        {
            category = english.Category,
            explanation = english.Explanation,
            relevantLegalInfo = english.RelevantLegalInfo,
            possibleActions = english.PossibleActions,
            requiredDocuments = english.RequiredDocuments,
            whenToConsultLawyer = english.WhenToConsultLawyer
        });


        var prompt = $$"""
You are a professional legal translator. Translate the JSON object below from
English into {{language}}.

Rules:
- Keep the JSON structure and keys EXACTLY as given: category, explanation,
  relevantLegalInfo, possibleActions, requiredDocuments, whenToConsultLawyer.
- Translate ONLY the text values into {{language}}.
- Keep the names of laws, ordinances, or acts in their original form if there
  is no common {{language}} legal term for them.
- Respond with a SINGLE JSON object and nothing else — no notes, no English
  commentary, no text outside the JSON.

JSON TO TRANSLATE:
{{payload}}
""";


        var raw =
            await _aiChatService.Generate(prompt);


        return ParseAnswer(raw);

    }



    // Simple script-presence check — doesn't verify translation quality,
    // only that the model actually switched script rather than silently
    // staying in English.
    private static bool LooksTranslated(ChatAnswerDto answer, string language)
    {

        var sample =
            $"{answer.Explanation} {answer.RelevantLegalInfo} {answer.Category}";

        return language.Trim().ToLowerInvariant() switch
        {
            "sinhala" => ContainsScript(sample, 0x0D80, 0x0DFF),
            "tamil" => ContainsScript(sample, 0x0B80, 0x0BFF),
            _ => true
        };

    }



    private static bool ContainsScript(
        string text,
        int rangeStart,
        int rangeEnd,
        int minChars = 5
    )
    {

        if (string.IsNullOrEmpty(text))
        {
            return false;
        }


        var count = text.Count(c => c >= rangeStart && c <= rangeEnd);


        return count >= minChars;

    }



    private static string BuildContext(
        List<LegalSearchResult> matches,
        Dictionary<int, LegalDocument> documentsById
    )
    {

        var sb = new StringBuilder();


        foreach (var match in matches)
        {

            var title = documentsById.TryGetValue(match.DocumentId, out var doc)
                ? doc.Title
                : "Unknown document";

            var category = doc?.Category?.Name ?? "Uncategorized";

            sb.AppendLine($"[Source: {title} | Category: {category}]");
            sb.AppendLine(match.Text);
            sb.AppendLine();

        }


        return sb.ToString();

    }



    private static string BuildPrompt(
        string question,
        string context,
        List<ChatContextItemDto>? history,
        bool mustAnswerNow = false
    )
    {

        var historySection = "";

        var answeringClarification = false;

        if (history != null && history.Count > 0)
        {

            var sb = new StringBuilder();

            sb.AppendLine("PREVIOUS CONVERSATION (for context only — the new question below may refer back to this):");

            foreach (var turn in history.TakeLast(3))
            {
                sb.AppendLine($"User asked: {turn.Question}");
                sb.AppendLine($"You answered: {turn.Explanation}");
                sb.AppendLine();
            }

            historySection = sb.ToString();

            // The frontend marks a clarifying-question turn with this exact
            // prefix (see ChatPanel.jsx) — if that was the LAST turn, the
            // new message below is answering it, not making small talk.
            answeringClarification =
                history[^1].Explanation.StartsWith("(I asked a clarifying question:");

        }


        var clarificationRule = mustAnswerNow
            ? """
You have ALREADY asked clarifying questions earlier in this conversation
(see PREVIOUS CONVERSATION above). Do NOT ask another clarifying question
under any circumstances — set "needsClarification" to false and answer using
everything discussed so far, even if some minor detail is still unknown.
Give the best general guidance you reasonably can.
"""
            : """
If the question is too vague to answer reliably — missing a key detail like
how or when something happened — set "needsClarification" to true and put
ONE short, specific follow-up question in "clarifyingQuestion" instead of
guessing. Only do this when truly necessary; prefer answering when you can.
""";


        var followUpRule = answeringClarification
            ? """
CONVERSATION FLOW:
The user's message below is answering the clarifying question you just asked
in PREVIOUS CONVERSATION above — it is NOT a conversational follow-up, even
though it may be short (e.g. just "monthly salary" or "yes"). Combine it with
the original question from that same turn and give the FULL structured legal
answer now (populate category, relevantLegalInfo, possibleActions,
requiredDocuments, whenToConsultLawyer as normal). Set "isFollowUp" to false.
"""
            : """
CONVERSATION FLOW:
If the user's message is a conversational follow-up rather than a new legal
question — an acknowledgment, a short reply like "okay I will pay", "thanks",
"got it", or simply continuing the same issue already covered above — set
"isFollowUp" to true. In that case:
- Put ONLY a short, natural, conversational reply in "explanation" (a couple
  of sentences — e.g. next practical step, or encouragement) instead of
  repeating the legal background, category, or list structure again.
- Leave "category", "relevantLegalInfo", and "whenToConsultLawyer" as empty
  strings, and "possibleActions"/"requiredDocuments" as empty arrays.
Only set "isFollowUp" to false — and give the full structured answer — for a
genuinely new legal question or one that needs its own legal background.
""";


        return $$"""
You are LawBridge, a legal awareness assistant for Sri Lankan citizens.
You provide general legal information and first-step guidance, NOT professional legal advice.

{{historySection}}
Answer using ONLY the CONTEXT below. If the context does not clearly cover the
question, say so honestly in the explanation and still give sensible general
next steps (e.g. which government department or authority to contact).

{{clarificationRule}}

{{followUpRule}}

Respond in English. Respond with a SINGLE JSON object and nothing else,
using EXACTLY these keys:

{
  "needsClarification": true,
  "clarifyingQuestion": "",
  "isFollowUp": false,
  "category": "short legal category/subcategory, e.g. 'Labour Law - Employment Termination'",
  "explanation": "plain-language explanation of the issue",
  "relevantLegalInfo": "the relevant legal information found in the context",
  "possibleActions": ["short action 1", "short action 2"],
  "requiredDocuments": ["document 1", "document 2"],
  "whenToConsultLawyer": "guidance on when to seek a qualified lawyer"
}

CONTEXT:
{{context}}

USER QUESTION:
{{question}}
""";

    }



    private static ChatAnswerDto ParseAnswer(string rawResponse)
    {

        try
        {

            using var doc =
                JsonDocument.Parse(rawResponse);

            var root = doc.RootElement;


            string GetString(string key) =>
                root.TryGetProperty(key, out var value) && value.ValueKind == JsonValueKind.String
                    ? value.GetString() ?? string.Empty
                    : string.Empty;


            bool GetBool(string key) =>
                root.TryGetProperty(key, out var value) && value.ValueKind == JsonValueKind.True;


            List<string> GetArray(string key)
            {

                if (!root.TryGetProperty(key, out var value) || value.ValueKind != JsonValueKind.Array)
                {
                    return new List<string>();
                }

                return value.EnumerateArray()
                    .Select(x => x.GetString() ?? string.Empty)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .ToList();

            }


            return new ChatAnswerDto
            {
                NeedsClarification = GetBool("needsClarification"),
                ClarifyingQuestion = GetString("clarifyingQuestion"),
                IsFollowUp = GetBool("isFollowUp"),
                Category = GetString("category"),
                Explanation = GetString("explanation"),
                RelevantLegalInfo = GetString("relevantLegalInfo"),
                PossibleActions = GetArray("possibleActions"),
                RequiredDocuments = GetArray("requiredDocuments"),
                WhenToConsultLawyer = GetString("whenToConsultLawyer")
            };

        }
        catch (JsonException)
        {

            // The model didn't return valid JSON — fall back to raw text
            // rather than failing the whole request.
            return new ChatAnswerDto
            {
                Category = "General",
                Explanation = rawResponse,
                RelevantLegalInfo = string.Empty,
                PossibleActions = new List<string>(),
                RequiredDocuments = new List<string>(),
                WhenToConsultLawyer = "If you're unsure, consult a qualified lawyer or the relevant government department."
            };

        }

    }

}