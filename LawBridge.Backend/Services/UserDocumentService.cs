using System.Diagnostics;
using System.Text.Json;
using LawBridge.Backend.DTOs.UserDocuments;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;

namespace LawBridge.Backend.Services;


// Wraps the persisted document together with the real, timed trace of the
// steps the agent took to produce it for THIS specific upload. The trace
// is never persisted — it's only meaningful for the request that just ran.
public class DocumentProcessResult
{

    public UserDocument Document { get; set; } = null!;

    public List<DocumentAgentTraceStepDto> Trace { get; set; } = new();

}


public class UserDocumentService
{

    private readonly PdfService _pdfService;
    private readonly OcrService _ocrService;
    private readonly AiChatService _aiChatService;
    private readonly IUserDocumentRepository _repository;
    private readonly ILogger<UserDocumentService> _logger;


    // Keep explanations from overwhelming the small local model —
    // legal documents can be long, and we only need enough to explain it.
    private const int MaxExtractedTextChars = 6000;


    public UserDocumentService(
        PdfService pdfService,
        OcrService ocrService,
        AiChatService aiChatService,
        IUserDocumentRepository repository,
        ILogger<UserDocumentService> logger
    )
    {
        _pdfService = pdfService;
        _ocrService = ocrService;
        _aiChatService = aiChatService;
        _repository = repository;
        _logger = logger;
    }



    // ---- FR-09, FR-10 ----
    public async Task<DocumentProcessResult> Process(
        int userId,
        string title,
        string diskPath,
        string publicPath,
        string fileName,
        string fileType,
        string language
    )
    {

        // ---- Real, timed trace of every step this specific upload takes ----
        //
        // Purely additive: the pipeline's behavior below is unchanged. Each
        // stage records what actually happened (real character counts,
        // real timings, real success/fallback outcomes) so the frontend can
        // show the true agentic flow — extract -> explain -> translate? ->
        // persist — for this exact document, not a scripted animation.

        var trace = new List<DocumentAgentTraceStepDto>();

        void AddStep(string key, string title2, string detail, string status, long durationMs)
        {
            trace.Add(new DocumentAgentTraceStepDto
            {
                Step = trace.Count + 1,
                Key = key,
                Title = title2,
                Detail = detail,
                Status = status,
                DurationMs = durationMs
            });
        }


        var document = new UserDocument
        {
            UserId = userId,
            Title = title,
            FileName = fileName,
            FilePath = publicPath,
            FileType = fileType,
            Language = language,
            Status = "Processing",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.Add(document);

        AddStep(
            "understand",
            "Understanding the upload",
            $"Received \"{fileName}\" ({fileType.ToUpperInvariant()}), explanation requested in {language}.",
            "done",
            0
        );


        try
        {

            // ---- FR-10: extract text ----

            var extractSw = Stopwatch.StartNew();

            var text = fileType == "pdf"
                ? await _pdfService.ExtractTextAsync(diskPath)
                : await _ocrService.ExtractTextFromImage(diskPath, language);

            extractSw.Stop();

            text = (text ?? string.Empty).Trim();


            if (string.IsNullOrWhiteSpace(text))
            {

                AddStep(
                    "extract",
                    fileType == "pdf" ? "Extracting text (PDF)" : "Extracting text (OCR)",
                    "No readable text was found — this may be a low-quality scan or a blank page.",
                    "warning",
                    extractSw.ElapsedMilliseconds
                );

                document.Status = "Failed";
                document.ErrorMessage =
                    "No readable text was found in this document. It may be a low-quality scan or a blank page.";

                var failMemorySw = Stopwatch.StartNew();

                await _repository.Update(document);

                failMemorySw.Stop();

                AddStep(
                    "memory",
                    "Saving document record",
                    $"Marked document #{document.Id} as Failed — nothing to explain.",
                    "warning",
                    failMemorySw.ElapsedMilliseconds
                );

                return new DocumentProcessResult { Document = document, Trace = trace };

            }


            var truncated = text.Length > MaxExtractedTextChars;

            AddStep(
                "extract",
                fileType == "pdf" ? "Extracting text (PDF)" : "Extracting text (OCR)",
                fileType == "pdf"
                    ? $"Extracted {text.Length} characters of text directly from the PDF."
                    : $"Ran Tesseract OCR in {language} and extracted {text.Length} characters of text.",
                "done",
                extractSw.ElapsedMilliseconds
            );

            if (truncated)
            {
                text = text[..MaxExtractedTextChars];
            }

            document.ExtractedText = text;


            // ---- FR-11: AI explanation (English first, then translate) ----

            var explainSw = Stopwatch.StartNew();

            var englishExplanation =
                await GenerateExplanation(text);

            explainSw.Stop();

            AddStep(
                "explain",
                "AI plain-language explanation",
                $"Gemini (gemini-3.1-flash-lite) read {(truncated ? $"the first {MaxExtractedTextChars} characters of " : "")}the document and generated a {englishExplanation.Length}-character plain-English explanation.",
                "done",
                explainSw.ElapsedMilliseconds
            );

            var finalExplanation = englishExplanation;

            if (!language.Equals("English", StringComparison.OrdinalIgnoreCase))
            {

                var translateSw = Stopwatch.StartNew();

                try
                {

                    var translated =
                        await TranslateExplanation(englishExplanation, language);

                    translateSw.Stop();

                    if (LooksTranslated(translated, language))
                    {
                        finalExplanation = translated;

                        AddStep(
                            "translate",
                            "Translating explanation",
                            $"Translated the explanation into {language} via a separate, narrower Gemini call (script-verified).",
                            "done",
                            translateSw.ElapsedMilliseconds
                        );
                    }
                    else
                    {
                        finalExplanation = englishExplanation;

                        AddStep(
                            "translate",
                            "Translating explanation",
                            $"Translation into {language} didn't reliably switch script — falling back to the English explanation.",
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
                        "Translating explanation",
                        $"Translation call to {language} failed — falling back to the English explanation.",
                        "warning",
                        translateSw.ElapsedMilliseconds
                    );

                    _logger.LogWarning(
                        ex,
                        "Document explanation translation to {Language} failed for document {DocumentId}",
                        language,
                        document.Id
                    );

                }

            }


            document.Explanation = finalExplanation;
            document.Status = "Completed";

        }
        catch (Exception ex)
        {

            _logger.LogError(
                ex,
                "Document processing failed for document {DocumentId}",
                document.Id
            );

            document.Status = "Failed";
            document.ErrorMessage =
                "Something went wrong while processing this document. Please check the OpenAI API key/connection and try again.";

            AddStep(
                "explain",
                "AI plain-language explanation",
                "Processing failed unexpectedly — see server logs for details.",
                "warning",
                0
            );

        }


        var memorySw = Stopwatch.StartNew();

        await _repository.Update(document);

        memorySw.Stop();

        AddStep(
            "memory",
            "Saving document record",
            document.Status == "Completed"
                ? $"Stored document #{document.Id} as Completed, ready to view in My Documents."
                : $"Stored document #{document.Id} as {document.Status}.",
            document.Status == "Completed" ? "done" : "warning",
            memorySw.ElapsedMilliseconds
        );


        return new DocumentProcessResult { Document = document, Trace = trace };

    }



    private async Task<string> GenerateExplanation(string documentText)
    {

        var prompt = $$"""
You are LawBridge, an assistant that explains legal documents in simple
language for ordinary Sri Lankan citizens (not lawyers).

Read the document text below and explain, in plain simple English:
- What type of document this is
- The key clauses and what they mean in everyday language
- What obligations or rights it creates for the person
- Anything the person should be careful about before signing or acting on it

Keep it clear and practical. Do not give formal legal advice — this is
general awareness only.

Respond with a SINGLE JSON object and nothing else, using exactly this key:
{ "explanation": "your explanation here" }

DOCUMENT TEXT:
{{documentText}}
""";

        var raw =
            await _aiChatService.Generate(prompt);

        return ExtractExplanationField(raw);

    }



    private async Task<string> TranslateExplanation(string englishExplanation, string language)
    {

        var prompt = $$"""
You are a professional legal translator. Translate the text below from
English into {{language}}. Keep the meaning accurate and the tone simple
and easy to understand for an ordinary person.

Respond with a SINGLE JSON object and nothing else, using exactly this key:
{ "explanation": "the translated text" }

TEXT TO TRANSLATE:
{{englishExplanation}}
""";

        var raw =
            await _aiChatService.Generate(prompt);

        return ExtractExplanationField(raw);

    }



    private static string ExtractExplanationField(string rawResponse)
    {

        try
        {

            using var doc =
                JsonDocument.Parse(rawResponse);

            if (doc.RootElement.TryGetProperty("explanation", out var value)
                && value.ValueKind == JsonValueKind.String)
            {
                return value.GetString() ?? string.Empty;
            }

            return rawResponse;

        }
        catch (JsonException)
        {

            // Model didn't return valid JSON — fall back to the raw text
            // rather than losing the response entirely.
            return rawResponse;

        }

    }



    private static bool LooksTranslated(string text, string language)
    {

        return language.Trim().ToLowerInvariant() switch
        {
            "sinhala" => ContainsScript(text, 0x0D80, 0x0DFF),
            "tamil" => ContainsScript(text, 0x0B80, 0x0BFF),
            _ => true
        };

    }



    private static bool ContainsScript(string text, int rangeStart, int rangeEnd, int minChars = 5)
    {

        if (string.IsNullOrEmpty(text))
        {
            return false;
        }

        return text.Count(c => c >= rangeStart && c <= rangeEnd) >= minChars;

    }

}