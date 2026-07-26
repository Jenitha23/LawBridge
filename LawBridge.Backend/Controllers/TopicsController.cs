using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Topics;
using LawBridge.Backend.Services;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/topics")]
[Authorize]
public class TopicsController : ControllerBase
{

    private const int SnippetRadius = 120;

    // Cosine distance cutoff for a semantic match to be worth surfacing —
    // 0 is identical, 2 is opposite. Chunks past this are too weakly
    // related to the query to be a useful "did you mean" result.
    private const double SemanticRelevanceThreshold = 0.6;

    private const int MaxResults = 20;


    private readonly AppDbContext _context;
    private readonly EmbeddingService _embeddingService;
    private readonly LegalSearchService _searchService;


    public TopicsController(
        AppDbContext context,
        EmbeddingService embeddingService,
        LegalSearchService searchService
    )
    {
        _context = context;
        _embeddingService = embeddingService;
        _searchService = searchService;
    }



    // ===========================
    // GET: api/topics/categories?language=...
    // FR-13 — language is optional; when given, documentCount only counts
    // documents actually available in that language, and Name/Description
    // are localized (falling back to English when no translation exists).
    // ===========================
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories([FromQuery] string? language)
    {

        var rawCategories = await _context.LegalCategories
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                c.NameSinhala,
                c.DescriptionSinhala,
                c.NameTamil,
                c.DescriptionTamil,
                DocumentCount = string.IsNullOrWhiteSpace(language)
                    ? c.LegalDocuments.Count
                    : c.LegalDocuments.Count(d => d.Language == language)
            })
            .ToListAsync();


        var categories = rawCategories
            .Select(c => new TopicCategoryDto
            {
                Id = c.Id,
                Name = LocalizeCategoryField(c.Name, c.NameSinhala, c.NameTamil, language),
                Description = LocalizeCategoryField(c.Description, c.DescriptionSinhala, c.DescriptionTamil, language),
                DocumentCount = c.DocumentCount
            })
            .OrderBy(c => c.Name)
            .ToList();


        return Ok(categories);

    }



    // Falls back to the English value whenever no translation exists for
    // the requested language, so a category is never blank on-screen just
    // because an admin hasn't filled in every language yet.
    private static string LocalizeCategoryField(
        string english,
        string? sinhala,
        string? tamil,
        string? language
    )
    {

        return language?.Trim().ToLowerInvariant() switch
        {
            "sinhala" when !string.IsNullOrWhiteSpace(sinhala) => sinhala!,
            "tamil" when !string.IsNullOrWhiteSpace(tamil) => tamil!,
            _ => english
        };

    }



    // ===========================
    // GET: api/topics/categories/{id}/documents?language=...
    // FR-13 — the documents inside a category act as its browsable topics
    // ===========================
    [HttpGet("categories/{id}/documents")]
    public async Task<IActionResult> GetDocumentsInCategory(int id, [FromQuery] string? language)
    {

        var categoryExists =
            await _context.LegalCategories.AnyAsync(c => c.Id == id);

        if (!categoryExists)
        {
            return NotFound(new { message = "Category not found" });
        }


        var query = _context.LegalDocuments
            .Where(d => d.CategoryId == id);

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(d => d.Language == language);
        }


        var documents = await query
            .OrderBy(d => d.Title)
            .Select(d => new TopicListItemDto
            {
                Id = d.Id,
                Title = d.Title,
                Language = d.Language,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();


        return Ok(documents);

    }



    // ===========================
    // GET: api/topics/documents/{id}
    // FR-13
    // ===========================
    [HttpGet("documents/{id}")]
    public async Task<IActionResult> GetDocument(int id)
    {

        var document = await _context.LegalDocuments
            .Include(d => d.Category)
            .FirstOrDefaultAsync(d => d.Id == id);


        if (document == null)
        {
            return NotFound(new { message = "Topic not found" });
        }


        document.ViewCount++;

        await _context.SaveChangesAsync();


        return Ok(new TopicDetailDto
        {
            Id = document.Id,
            Title = document.Title,
            CategoryName = document.Category?.Name ?? "Uncategorized",
            Language = document.Language,
            Content = document.Content,
            Source = document.Source,
            CreatedAt = document.CreatedAt
        });

    }



    // ===========================
    // GET: api/topics/search?q=...&language=...
    // FR-14
    //
    // Hybrid search: a fast exact substring pass (ILIKE — catches specific
    // legal terms like "EPF" or "Rent Act" precisely) merged with a
    // semantic pass over the same pgvector embeddings the chat feature
    // already uses (catches natural-language phrasing that doesn't share
    // exact wording with the document, e.g. "landlord won't give back my
    // deposit" -> "Security Deposit Refunds"). Exact matches rank first;
    // semantic-only matches are labelled so the UI can show how they were
    // found.
    // ===========================
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] string? language)
    {

        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new List<TopicSearchResultDto>());
        }


        var term = q.Trim();


        // ---- Language scope (used by both passes) ----

        var languageFilterActive = !string.IsNullOrWhiteSpace(language);

        List<int>? languageDocumentIds = null;

        if (languageFilterActive)
        {
            languageDocumentIds = await _context.LegalDocuments
                .Where(d => d.Language == language)
                .Select(d => d.Id)
                .ToListAsync();

            if (languageDocumentIds.Count == 0)
            {
                // Nothing exists in this language at all — no point running
                // either search pass.
                return Ok(new List<TopicSearchResultDto>());
            }
        }


        // ---- Pass 1: exact substring match ----

        var exactQuery = _context.LegalDocuments
            .Include(d => d.Category)
            .Where(d =>
                EF.Functions.ILike(d.Title, $"%{term}%") ||
                EF.Functions.ILike(d.Content, $"%{term}%") ||
                EF.Functions.ILike(d.Category!.Name, $"%{term}%"));

        if (languageFilterActive)
        {
            exactQuery = exactQuery.Where(d => d.Language == language);
        }

        var exactMatches = await exactQuery
            .OrderBy(d => d.Title)
            .Take(MaxResults)
            .ToListAsync();

        var exactMatchIds =
            exactMatches.Select(d => d.Id).ToHashSet();


        var results = exactMatches.Select(d => new TopicSearchResultDto
        {
            Id = d.Id,
            Title = d.Title,
            CategoryName = LocalizeCategoryField(d.Category?.Name ?? "Uncategorized", d.Category?.NameSinhala, d.Category?.NameTamil, language),
            Language = d.Language,
            Snippet = BuildSnippet(d.Content, term),
            IsSemanticMatch = false
        }).ToList();


        // ---- Pass 2: semantic match over the same embeddings chat uses ----

        if (results.Count < MaxResults)
        {

            try
            {

                var queryEmbedding =
                    await _embeddingService.GenerateEmbedding(term);

                var chunkMatches = await _searchService.Search(
                    queryEmbedding,
                    topK: MaxResults * 2,
                    allowedDocumentIds: languageDocumentIds
                );

                // Best (lowest-distance) chunk per document, excluding
                // documents the exact pass already found.
                var bestPerDocument = chunkMatches
                    .Where(m => m.Distance <= SemanticRelevanceThreshold)
                    .Where(m => !exactMatchIds.Contains(m.DocumentId))
                    .GroupBy(m => m.DocumentId)
                    .Select(g => g.OrderBy(m => m.Distance).First())
                    .OrderBy(m => m.Distance)
                    .Take(MaxResults - results.Count)
                    .ToList();

                if (bestPerDocument.Count > 0)
                {

                    var semanticDocIds =
                        bestPerDocument.Select(m => m.DocumentId).ToList();

                    var semanticDocuments = await _context.LegalDocuments
                        .Include(d => d.Category)
                        .Where(d => semanticDocIds.Contains(d.Id))
                        .ToListAsync();

                    var semanticDocumentsById =
                        semanticDocuments.ToDictionary(d => d.Id);

                    foreach (var match in bestPerDocument)
                    {

                        if (!semanticDocumentsById.TryGetValue(match.DocumentId, out var d))
                        {
                            continue;
                        }

                        results.Add(new TopicSearchResultDto
                        {
                            Id = d.Id,
                            Title = d.Title,
                            CategoryName = LocalizeCategoryField(d.Category?.Name ?? "Uncategorized", d.Category?.NameSinhala, d.Category?.NameTamil, language),
                            Language = d.Language,
                            // Show the actual matching passage, not an
                            // arbitrary excerpt — the query term itself
                            // may not appear verbatim anywhere in it.
                            Snippet = TruncateSnippet(match.Text),
                            IsSemanticMatch = true
                        });

                    }

                }

            }
            catch (Exception)
            {
                // Semantic pass is a best-effort enhancement — if
                // embedding/search fails, exact results still stand.
            }

        }


        return Ok(results);

    }



    private static string BuildSnippet(string content, string term)
    {

        if (string.IsNullOrWhiteSpace(content))
        {
            return string.Empty;
        }


        var index =
            content.IndexOf(term, StringComparison.OrdinalIgnoreCase);

        if (index < 0)
        {
            return content.Length > SnippetRadius * 2
                ? content[..(SnippetRadius * 2)] + "…"
                : content;
        }


        var start = Math.Max(0, index - SnippetRadius);
        var end = Math.Min(content.Length, index + term.Length + SnippetRadius);

        var snippet = content[start..end];


        if (start > 0) snippet = "…" + snippet;

        if (end < content.Length) snippet += "…";


        return snippet;

    }



    private static string TruncateSnippet(string text)
    {

        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var maxLength = SnippetRadius * 2;

        return text.Length > maxLength
            ? text[..maxLength].TrimEnd() + "…"
            : text;

    }

}