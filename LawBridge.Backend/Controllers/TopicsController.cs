using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Topics;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/topics")]
[Authorize]
public class TopicsController : ControllerBase
{

    private const int SnippetRadius = 120;


    private readonly AppDbContext _context;


    public TopicsController(AppDbContext context)
    {
        _context = context;
    }



    // ===========================
    // GET: api/topics/categories
    // FR-13
    // ===========================
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {

        var categories = await _context.LegalCategories
            .Select(c => new TopicCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                DocumentCount = c.LegalDocuments.Count
            })
            .OrderBy(c => c.Name)
            .ToListAsync();


        return Ok(categories);

    }



    // ===========================
    // GET: api/topics/categories/{id}/documents
    // FR-13 — the documents inside a category act as its browsable topics
    // ===========================
    [HttpGet("categories/{id}/documents")]
    public async Task<IActionResult> GetDocumentsInCategory(int id)
    {

        var categoryExists =
            await _context.LegalCategories.AnyAsync(c => c.Id == id);

        if (!categoryExists)
        {
            return NotFound(new { message = "Category not found" });
        }


        var documents = await _context.LegalDocuments
            .Where(d => d.CategoryId == id)
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
            CreatedAt = document.CreatedAt
        });

    }



    // ===========================
    // GET: api/topics/search?q=...
    // FR-14
    // ===========================
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {

        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new List<TopicSearchResultDto>());
        }


        var term = q.Trim();

        var matches = await _context.LegalDocuments
            .Include(d => d.Category)
            .Where(d =>
                EF.Functions.ILike(d.Title, $"%{term}%") ||
                EF.Functions.ILike(d.Content, $"%{term}%") ||
                EF.Functions.ILike(d.Category!.Name, $"%{term}%"))
            .OrderBy(d => d.Title)
            .Take(20)
            .ToListAsync();


        var result = matches.Select(d => new TopicSearchResultDto
        {
            Id = d.Id,
            Title = d.Title,
            CategoryName = d.Category?.Name ?? "Uncategorized",
            Language = d.Language,
            Snippet = BuildSnippet(d.Content, term)
        }).ToList();


        return Ok(result);

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

}
