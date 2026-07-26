using System.Diagnostics;
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


        // ---- Real, timed trace of every step this specific ingestion takes ----
        //
        // Purely additive: the pipeline's behavior below is unchanged. Each
        // stage records what actually happened (real character counts, real
        // chunk/embedding counts, real timings) so the frontend can show the
        // true agentic flow — extract -> store -> chunk -> embed -> index —
        // for this exact document, not a scripted animation.

        var trace = new List<AdminDocumentTraceStepDto>();

        void AddStep(string key, string stepTitle, string detail, string status, long durationMs)
        {
            trace.Add(new AdminDocumentTraceStepDto
            {
                Step = trace.Count + 1,
                Key = key,
                Title = stepTitle,
                Detail = detail,
                Status = status,
                DurationMs = durationMs
            });
        }

        AddStep(
            "understand",
            "Understanding the upload",
            $"Received \"{file.FileName}\" for category #{categoryId}, language {language}.",
            "done",
            0
        );


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

        var extractSw = Stopwatch.StartNew();

        var extractedText =
    await _pdfService.ExtractTextAsync(path);

        extractSw.Stop();

        extractedText ??= string.Empty;

        AddStep(
            "extract",
            "Extracting text (PDF)",
            extractedText.Length > 0
                ? $"Extracted {extractedText.Length} characters of text directly from the PDF."
                : "No readable text was found in this PDF.",
            extractedText.Length > 0 ? "done" : "warning",
            extractSw.ElapsedMilliseconds
        );


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


        var storeSw = Stopwatch.StartNew();

        await _repository.Add(document);

        storeSw.Stop();

        AddStep(
            "store",
            "Saving document record",
            $"Stored document #{document.Id} (\"{title}\") in the legal document library.",
            "done",
            storeSw.ElapsedMilliseconds
        );

        var chunkSw = Stopwatch.StartNew();

        var chunks =
    _chunkService.CreateChunks(
        extractedText
    );

        chunkSw.Stop();

        AddStep(
            "chunk",
            "Splitting into chunks",
            chunks.Count > 0
                ? $"Split the document into {chunks.Count} chunk(s) of up to 1000 characters each, ready to embed."
                : "No text to split into chunks — nothing will be added to the searchable knowledge base.",
            chunks.Count > 0 ? "done" : "warning",
            chunkSw.ElapsedMilliseconds
        );


        var embedSw = Stopwatch.StartNew();

        var embeddedDimensions = 0;

foreach(var chunk in chunks)
{

    var embedding =
        await _embeddingService
        .GenerateEmbedding(chunk);

    if (embeddedDimensions == 0)
    {
        embeddedDimensions = embedding.ToArray().Length;
    }

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

        embedSw.Stop();

        if (chunks.Count > 0)
        {

            AddStep(
                "embed",
                "Generating embeddings",
                $"Called gemini-embedding-001 once per chunk to generate {chunks.Count} {embeddedDimensions}-dimension vector(s) (avg {embedSw.ElapsedMilliseconds / chunks.Count}ms/chunk).",
                "done",
                embedSw.ElapsedMilliseconds
            );

        }


var indexSw = Stopwatch.StartNew();

await _ragContext.SaveChangesAsync();

        indexSw.Stop();

        AddStep(
            "index",
            "Indexing into vector database",
            chunks.Count > 0
                ? $"Wrote {chunks.Count} embedded chunk(s) into the pgvector-backed knowledge base — now searchable by the chat agent."
                : "Nothing was indexed — the knowledge base was not updated.",
            chunks.Count > 0 ? "done" : "warning",
            indexSw.ElapsedMilliseconds
        );


        var saved =
            await _repository.GetById(document.Id);


        return Ok(new DocumentUploadResultDto
        {
            Id = document.Id,
            Title = document.Title,
            FileName = file.FileName,
            CategoryId = document.CategoryId,
            CategoryName = saved?.Category?.Name ?? "Uncategorized",
            Language = document.Language,
            Source = document.Source,
            CreatedAt = document.CreatedAt,
            Status = chunks.Count > 0 ? "Processed" : "Failed",
            ChunkCount = chunks.Count,
            EmbeddedChunkCount = chunks.Count,
            Message = "Document uploaded successfully",
            Trace = trace
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