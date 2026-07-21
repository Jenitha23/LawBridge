using System.Text.Json;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;

namespace LawBridge.Backend.Services;


public class UserDocumentService
{

    private readonly PdfService _pdfService;
    private readonly OcrService _ocrService;
    private readonly OllamaChatService _ollamaChatService;
    private readonly IUserDocumentRepository _repository;
    private readonly ILogger<UserDocumentService> _logger;


    // Keep explanations from overwhelming the small local model —
    // legal documents can be long, and we only need enough to explain it.
    private const int MaxExtractedTextChars = 6000;


    public UserDocumentService(
        PdfService pdfService,
        OcrService ocrService,
        OllamaChatService ollamaChatService,
        IUserDocumentRepository repository,
        ILogger<UserDocumentService> logger
    )
    {
        _pdfService = pdfService;
        _ocrService = ocrService;
        _ollamaChatService = ollamaChatService;
        _repository = repository;
        _logger = logger;
    }



    // ---- FR-09, FR-10 ----
    public async Task<UserDocument> Process(
        int userId,
        string title,
        string diskPath,
        string publicPath,
        string fileName,
        string fileType,
        string language
    )
    {

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


        try
        {

            // ---- FR-10: extract text ----

            var text = fileType == "pdf"
                ? await _pdfService.ExtractTextAsync(diskPath)
                : await _ocrService.ExtractTextFromImage(diskPath, language);

            text = (text ?? string.Empty).Trim();


            if (string.IsNullOrWhiteSpace(text))
            {

                document.Status = "Failed";
                document.ErrorMessage =
                    "No readable text was found in this document. It may be a low-quality scan or a blank page.";

                await _repository.Update(document);

                return document;

            }


            if (text.Length > MaxExtractedTextChars)
            {
                text = text[..MaxExtractedTextChars];
            }

            document.ExtractedText = text;


            // ---- FR-11: AI explanation (English first, then translate) ----

            var englishExplanation =
                await GenerateExplanation(text);

            var finalExplanation = englishExplanation;

            if (!language.Equals("English", StringComparison.OrdinalIgnoreCase))
            {

                try
                {

                    var translated =
                        await TranslateExplanation(englishExplanation, language);

                    finalExplanation = LooksTranslated(translated, language)
                        ? translated
                        : englishExplanation;

                }
                catch (Exception ex)
                {

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
                "Something went wrong while processing this document. Please make sure Ollama is running and try again.";

        }


        await _repository.Update(document);


        return document;

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
            await _ollamaChatService.Generate(prompt);

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
            await _ollamaChatService.Generate(prompt);

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
