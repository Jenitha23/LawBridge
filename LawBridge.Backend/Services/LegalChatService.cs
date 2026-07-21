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
    private readonly OllamaChatService _ollamaChatService;
    private readonly IChatRepository _chatRepository;
    private readonly AppDbContext _appContext;
    private readonly ILogger<LegalChatService> _logger;


    public LegalChatService(
        EmbeddingService embeddingService,
        LegalSearchService searchService,
        OllamaChatService ollamaChatService,
        IChatRepository chatRepository,
        AppDbContext appContext,
        ILogger<LegalChatService> logger
    )
    {
        _embeddingService = embeddingService;
        _searchService = searchService;
        _ollamaChatService = ollamaChatService;
        _chatRepository = chatRepository;
        _appContext = appContext;
        _logger = logger;
    }



    public async Task<ChatAnswerDto> Ask(int userId, AskQuestionDto dto)
    {

        // ---- 1. Embed the question and retrieve relevant chunks (FR-07) ----

        var queryEmbedding =
            await _embeddingService.GenerateEmbedding(dto.Question);

        var matches =
            await _searchService.Search(queryEmbedding, topK: 5);


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


        var contextText = BuildContext(matches, documentsById);


        // ---- 2. Ask the local LLM for a structured answer (FR-06, FR-07, FR-08) ----
        //
        // The model reasons and answers in English first, regardless of the
        // requested language — a small local model is far more reliable at
        // legal reasoning in English than at reasoning AND writing fluent
        // Sinhala/Tamil at the same time. If the person asked for another
        // language, we translate the finished English answer as a separate,
        // narrower step (translation-only tasks are more reliable for small
        // models than combined reasoning + generation).

        var prompt = BuildPrompt(dto.Question, contextText);

        var rawResponse =
            await _ollamaChatService.Generate(prompt);

        var englishAnswer = ParseAnswer(rawResponse);


        var finalAnswer = englishAnswer;
        string? translationNote = null;

        var wantsTranslation =
            !string.IsNullOrWhiteSpace(dto.Language)
            && !dto.Language.Equals("English", StringComparison.OrdinalIgnoreCase);

        if (wantsTranslation)
        {

            try
            {

                var translated =
                    await TranslateAnswer(englishAnswer, dto.Language);

                if (LooksTranslated(translated, dto.Language))
                {
                    finalAnswer = translated;
                }
                else
                {
                    translationNote =
                        $"We couldn't reliably translate this answer into {dto.Language}, so it's shown in English below.";
                }

            }
            catch (Exception ex)
            {

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


        // ---- 3. Persist to chat history ----

        var message = new ChatMessage
        {
            UserId = userId,
            Question = dto.Question,
            Language = dto.Language,
            Category = finalAnswer.Category,
            Explanation = finalAnswer.Explanation,
            RelevantLegalInfo = finalAnswer.RelevantLegalInfo,
            PossibleActions = JsonSerializer.Serialize(finalAnswer.PossibleActions),
            RequiredDocuments = JsonSerializer.Serialize(finalAnswer.RequiredDocuments),
            WhenToConsultLawyer = finalAnswer.WhenToConsultLawyer,
            SourceDocuments = JsonSerializer.Serialize(sourceTitles),
            CreatedAt = DateTime.UtcNow
        };

        await _chatRepository.Add(message);


        return new ChatAnswerDto
        {
            Id = message.Id,
            Question = dto.Question,
            Language = dto.Language,
            Category = finalAnswer.Category,
            Explanation = finalAnswer.Explanation,
            RelevantLegalInfo = finalAnswer.RelevantLegalInfo,
            PossibleActions = finalAnswer.PossibleActions,
            RequiredDocuments = finalAnswer.RequiredDocuments,
            WhenToConsultLawyer = finalAnswer.WhenToConsultLawyer,
            Sources = sourceTitles,
            TranslationNote = translationNote,
            CreatedAt = message.CreatedAt
        };

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
            await _ollamaChatService.Generate(prompt);


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
        string context
    )
    {

        return $$"""
You are LawBridge, a legal awareness assistant for Sri Lankan citizens.
You provide general legal information and first-step guidance, NOT professional legal advice.

Answer using ONLY the CONTEXT below. If the context does not clearly cover the
question, say so honestly in the explanation and still give sensible general
next steps (e.g. which government department or authority to contact).

Respond in English. Respond with a SINGLE JSON object and nothing else,
using EXACTLY these keys:

{
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
