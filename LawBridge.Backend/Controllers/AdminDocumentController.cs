using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Models;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Services;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Documents;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/documents")]
[Authorize(Roles="Admin")]
public class AdminDocumentController : ControllerBase
{

    private readonly ILegalDocumentRepository _repository;
    private readonly PdfService _pdfService;
    private readonly ChunkService _chunkService;
    private readonly RagDbContext _ragContext;
    private readonly EmbeddingService _embeddingService;



    public AdminDocumentController(
        ILegalDocumentRepository repository,
        PdfService pdfService,
        ChunkService chunkService,
        RagDbContext ragContext,
        EmbeddingService embeddingService
    )
    {
        _repository=repository;
        _pdfService = pdfService;
        _chunkService = chunkService;
        _ragContext = ragContext;
        _embeddingService = embeddingService;
    }



    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string title,
        [FromForm] int categoryId,
        [FromForm] string language
    )
    {


        if(file == null)
        {
            return BadRequest(
                "File required"
            );
        }



        var fileName =
            Guid.NewGuid()
            + Path.GetExtension(file.FileName);



        var folder =
        Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot/uploads/documents"
        );



        if(!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }



        var path =
        Path.Combine(
            folder,
            fileName
        );



        using(var stream =
            new FileStream(
                path,
                FileMode.Create
            ))
        {

            await file.CopyToAsync(stream);
            
        }
        var extractedText =
    await _pdfService.ExtractTextAsync(path);


        var document =
        new LegalDocument
        {

            Title=title,

            Source="/uploads/documents/"+fileName,

            Language=language,

            CategoryId=categoryId,

            CreatedAt=DateTime.UtcNow,

            Content=extractedText

        };



        await _repository.Add(document);
        var chunks =
    _chunkService.CreateChunks(
        extractedText
    );


foreach(var chunk in chunks)
{

    var embedding =
        await _embeddingService
        .GenerateEmbedding(chunk);

    var legalChunk =
    new LegalChunk
    {

        Text = chunk,

        DocumentId = document.Id,
        Embedding = embedding

    };


    _ragContext.LegalChunks.Add(
    legalChunk
    );

}


await _ragContext.SaveChangesAsync();



        return Ok(new
        {
            message="Document uploaded successfully"
        });

    }



    [HttpGet]
    public async Task<IActionResult> GetAll()
    {

        var documents =
            await _repository.GetAll();


        var documentIds =
            documents.Select(d => d.Id).ToList();


        // Chunk counts per document, from the RAG database, used to
        // derive a status since it isn't stored on LegalDocument itself.
        var chunkStats = await _ragContext.LegalChunks
            .Where(c => documentIds.Contains(c.DocumentId))
            .GroupBy(c => c.DocumentId)
            .Select(g => new
            {
                DocumentId = g.Key,
                TotalChunks = g.Count(),
                EmbeddedChunks = g.Count(c => c.Embedding != null)
            })
            .ToListAsync();


        var chunkStatsByDoc =
            chunkStats.ToDictionary(c => c.DocumentId);


        var result = documents.Select(d =>
        {

            var status = "Failed";

            if (chunkStatsByDoc.TryGetValue(d.Id, out var stats))
            {

                status = stats.TotalChunks > 0
                    && stats.EmbeddedChunks == stats.TotalChunks
                        ? "Processed"
                        : "Processing";

            }


            return new LegalDocumentListItemDto
            {
                Id = d.Id,
                Title = d.Title,
                FileName = Path.GetFileName(d.Source),
                CategoryId = d.CategoryId,
                CategoryName = d.Category?.Name ?? "Uncategorized",
                Language = d.Language,
                Source = d.Source,
                CreatedAt = d.CreatedAt,
                Status = status
            };

        }).ToList();


        return Ok(result);

    }



    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {

        var document =
            await _repository.GetById(id);


        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }


        var chunks = await _ragContext.LegalChunks
            .Where(c => c.DocumentId == id)
            .ToListAsync();

        var embeddedCount =
            chunks.Count(c => c.Embedding != null);


        var status = "Failed";

        if (chunks.Count > 0)
        {
            status = embeddedCount == chunks.Count
                ? "Processed"
                : "Processing";
        }


        var result = new LegalDocumentDetailDto
        {
            Id = document.Id,
            Title = document.Title,
            FileName = Path.GetFileName(document.Source),
            CategoryId = document.CategoryId,
            CategoryName = document.Category?.Name ?? "Uncategorized",
            Language = document.Language,
            Source = document.Source,
            CreatedAt = document.CreatedAt,
            Status = status,
            ChunkCount = chunks.Count,
            EmbeddedChunkCount = embeddedCount,
            ContentLength = document.Content.Length
        };


        return Ok(result);

    }



    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDocumentDto dto)
    {

        var document =
            await _repository.GetById(id);


        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }


        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new
            {
                message = "Title is required"
            });
        }


        document.Title = dto.Title;
        document.CategoryId = dto.CategoryId;
        document.Language = dto.Language;


        await _repository.Update(document);


        return Ok(new
        {
            message = "Document updated successfully"
        });

    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {

        var document =
            await _repository.GetById(id);


        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }


        // Remove associated chunks/embeddings from the RAG database.
        var chunks = await _ragContext.LegalChunks
            .Where(c => c.DocumentId == id)
            .ToListAsync();

        _ragContext.LegalChunks.RemoveRange(chunks);

        await _ragContext.SaveChangesAsync();


        // Remove the stored PDF from disk, if present.
        var filePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            document.Source.TrimStart('/')
        );

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }


        await _repository.Delete(document);


        return Ok(new
        {
            message = "Document deleted successfully"
        });

    }

}