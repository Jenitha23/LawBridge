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
[Authorize(Roles = "Admin")]
public class AdminDocumentController : ControllerBase
{
    private readonly ILegalDocumentRepository _repository;
    private readonly PdfService _pdfService;
    private readonly ChunkService _chunkService;
    private readonly RagDbContext _ragContext;
    private readonly EmbeddingService _embeddingService;
    private readonly BlobStorageService _blobStorageService;

    public AdminDocumentController(
        ILegalDocumentRepository repository,
        PdfService pdfService,
        ChunkService chunkService,
        RagDbContext ragContext,
        EmbeddingService embeddingService,
        BlobStorageService blobStorageService
    )
    {
        _repository = repository;
        _pdfService = pdfService;
        _chunkService = chunkService;
        _ragContext = ragContext;
        _embeddingService = embeddingService;
        _blobStorageService = blobStorageService;
    }

    // ============================================================
    // UPLOAD DOCUMENT
    // ============================================================

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string title,
        [FromForm] int categoryId,
        [FromForm] string language
    )
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File required");
        }

        // --------------------------------------------------------
        // Trace helper
        // --------------------------------------------------------

        var trace = new List<AdminDocumentTraceStepDto>();

        void AddStep(
            string key,
            string stepTitle,
            string detail,
            string status,
            long durationMs)
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

        // --------------------------------------------------------
        // Generate unique Blob filename
        // --------------------------------------------------------

        var fileName =
            Guid.NewGuid().ToString()
            + Path.GetExtension(file.FileName);

        // --------------------------------------------------------
        // Upload PDF to Azure Blob Storage
        // --------------------------------------------------------

        var uploadSw = Stopwatch.StartNew();

        await using (var uploadStream = file.OpenReadStream())
        {
            await _blobStorageService.UploadDocumentAsync(
                uploadStream,
                fileName,
                string.IsNullOrWhiteSpace(file.ContentType)
                    ? "application/pdf"
                    : file.ContentType
            );
        }

        uploadSw.Stop();

        AddStep(
            "upload",
            "Uploading document",
            $"Uploaded \"{file.FileName}\" to Azure Blob Storage.",
            "done",
            uploadSw.ElapsedMilliseconds
        );

        // --------------------------------------------------------
        // Temporary local file
        //
        // PdfService currently expects a physical file path.
        // Therefore we download the Blob temporarily, process it,
        // and delete the temporary file afterwards.
        // --------------------------------------------------------

        var tempFilePath = Path.Combine(
            Path.GetTempPath(),
            fileName
        );

        try
        {
            // ----------------------------------------------------
            // Download Blob temporarily
            // ----------------------------------------------------

            var downloadSw = Stopwatch.StartNew();

            await using (var blobStream =
                await _blobStorageService.DownloadDocumentAsync(fileName))
            {
                await using var tempFileStream =
                    new FileStream(
                        tempFilePath,
                        FileMode.Create,
                        FileAccess.Write,
                        FileShare.None
                    );

                await blobStream.CopyToAsync(tempFileStream);
            }

            downloadSw.Stop();

            AddStep(
                "download",
                "Preparing document for processing",
                "Downloaded the document temporarily from Azure Blob Storage for PDF processing.",
                "done",
                downloadSw.ElapsedMilliseconds
            );

            // ----------------------------------------------------
            // Extract PDF text
            // ----------------------------------------------------

            var extractSw = Stopwatch.StartNew();

            var extractedText =
                await _pdfService.ExtractTextAsync(tempFilePath);

            extractSw.Stop();

            extractedText ??= string.Empty;

            AddStep(
                "extract",
                "Extracting text (PDF)",
                extractedText.Length > 0
                    ? $"Extracted {extractedText.Length} characters of text directly from the PDF."
                    : "No readable text was found in this PDF.",
                extractedText.Length > 0
                    ? "done"
                    : "warning",
                extractSw.ElapsedMilliseconds
            );

            // ----------------------------------------------------
            // Create LegalDocument
            // ----------------------------------------------------

            var document = new LegalDocument
            {
                Title = title,

                // Store the Blob filename instead of
                // the old /uploads/documents/ path.
                Source = fileName,

                Language = language,

                CategoryId = categoryId,

                CreatedAt = DateTime.UtcNow,

                Content = extractedText
            };

            // ----------------------------------------------------
            // Store document record
            // ----------------------------------------------------

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

            // ----------------------------------------------------
            // Create chunks
            // ----------------------------------------------------

            var chunkSw = Stopwatch.StartNew();

            var chunks =
                _chunkService.CreateChunks(extractedText);

            chunkSw.Stop();

            AddStep(
                "chunk",
                "Splitting into chunks",
                chunks.Count > 0
                    ? $"Split the document into {chunks.Count} chunk(s) of up to 1000 characters each, ready to embed."
                    : "No text to split into chunks — nothing will be added to the searchable knowledge base.",
                chunks.Count > 0
                    ? "done"
                    : "warning",
                chunkSw.ElapsedMilliseconds
            );

            // ----------------------------------------------------
            // Generate embeddings
            // ----------------------------------------------------

            var embedSw = Stopwatch.StartNew();

            var embeddedDimensions = 0;

            foreach (var chunk in chunks)
            {
                var embedding =
                    await _embeddingService.GenerateEmbedding(chunk);

                if (embeddedDimensions == 0)
                {
                    embeddedDimensions =
                        embedding.ToArray().Length;
                }

                var legalChunk = new LegalChunk
                {
                    Text = chunk,

                    DocumentId = document.Id,

                    Embedding = embedding
                };

                _ragContext.LegalChunks.Add(legalChunk);
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
            else
            {
                AddStep(
                    "embed",
                    "Generating embeddings",
                    "No embeddings were generated because the document contains no chunks.",
                    "warning",
                    embedSw.ElapsedMilliseconds
                );
            }

            // ----------------------------------------------------
            // Save embeddings to Supabase / pgvector
            // ----------------------------------------------------

            var indexSw = Stopwatch.StartNew();

            await _ragContext.SaveChangesAsync();

            indexSw.Stop();

            AddStep(
                "index",
                "Indexing into vector database",
                chunks.Count > 0
                    ? $"Wrote {chunks.Count} embedded chunk(s) into the pgvector-backed knowledge base — now searchable by the chat agent."
                    : "Nothing was indexed — the knowledge base was not updated.",
                chunks.Count > 0
                    ? "done"
                    : "warning",
                indexSw.ElapsedMilliseconds
            );

            // ----------------------------------------------------
            // Get saved document
            // ----------------------------------------------------

            var saved =
                await _repository.GetById(document.Id);

            // ----------------------------------------------------
            // Return result
            // ----------------------------------------------------

            return Ok(new DocumentUploadResultDto
            {
                Id = document.Id,

                Title = document.Title,

                FileName = file.FileName,

                CategoryId = document.CategoryId,

                CategoryName =
                    saved?.Category?.Name ?? "Uncategorized",

                Language = document.Language,

                Source = document.Source,

                CreatedAt = document.CreatedAt,

                Status =
                    chunks.Count > 0
                        ? "Processed"
                        : "Failed",

                ChunkCount = chunks.Count,

                EmbeddedChunkCount = chunks.Count,

                Message = "Document uploaded successfully",

                Trace = trace
            });
        }
        catch
        {
            // ----------------------------------------------------
            // If RAG processing fails after Blob upload,
            // remove the Blob so we don't leave orphaned files.
            // ----------------------------------------------------

            try
            {
                await _blobStorageService
                    .DeleteDocumentAsync(fileName);
            }
            catch
            {
                // Don't hide the original exception.
            }

            throw;
        }
        finally
        {
            // ----------------------------------------------------
            // Delete temporary local file
            // ----------------------------------------------------

            if (System.IO.File.Exists(tempFilePath))
            {
                try
                {
                    System.IO.File.Delete(tempFilePath);
                }
                catch
                {
                    // Ignore cleanup failure.
                }
            }
        }
    }

    // ============================================================
    // GET ALL DOCUMENTS
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var documents =
            await _repository.GetAll();

        var documentIds =
            documents.Select(d => d.Id).ToList();

        // Chunk counts per document, from the RAG database,
        // used to derive status.
        var chunkStats =
            await _ragContext.LegalChunks
                .Where(c => documentIds.Contains(c.DocumentId))
                .GroupBy(c => c.DocumentId)
                .Select(g => new
                {
                    DocumentId = g.Key,

                    TotalChunks = g.Count(),

                    EmbeddedChunks =
                        g.Count(c => c.Embedding != null)
                })
                .ToListAsync();

        var chunkStatsByDoc =
            chunkStats.ToDictionary(c => c.DocumentId);

        var result =
            documents.Select(d =>
            {
                var status = "Failed";

                if (chunkStatsByDoc.TryGetValue(
                    d.Id,
                    out var stats))
                {
                    status =
                        stats.TotalChunks > 0 &&
                        stats.EmbeddedChunks ==
                            stats.TotalChunks
                            ? "Processed"
                            : "Processing";
                }

                return new LegalDocumentListItemDto
                {
                    Id = d.Id,

                    Title = d.Title,

                    FileName =
                        Path.GetFileName(d.Source),

                    CategoryId = d.CategoryId,

                    CategoryName =
                        d.Category?.Name
                        ?? "Uncategorized",

                    Language = d.Language,

                    Source = d.Source,

                    CreatedAt = d.CreatedAt,

                    Status = status
                };
            })
            .ToList();

        return Ok(result);
    }

    // ============================================================
    // GET DOCUMENT BY ID
    // ============================================================

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

        var chunks =
            await _ragContext.LegalChunks
                .Where(c => c.DocumentId == id)
                .ToListAsync();

        var embeddedCount =
            chunks.Count(c => c.Embedding != null);

        var status = "Failed";

        if (chunks.Count > 0)
        {
            status =
                embeddedCount == chunks.Count
                    ? "Processed"
                    : "Processing";
        }

        var result =
            new LegalDocumentDetailDto
            {
                Id = document.Id,

                Title = document.Title,

                FileName =
                    Path.GetFileName(document.Source),

                CategoryId = document.CategoryId,

                CategoryName =
                    document.Category?.Name
                    ?? "Uncategorized",

                Language = document.Language,

                Source = document.Source,

                CreatedAt = document.CreatedAt,

                Status = status,

                ChunkCount = chunks.Count,

                EmbeddedChunkCount = embeddedCount,

                ContentLength =
                    document.Content?.Length ?? 0
            };

        return Ok(result);
    }

    // ============================================================
    // UPDATE DOCUMENT
    // ============================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateDocumentDto dto)
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

    // ============================================================
    // DELETE DOCUMENT
    // ============================================================

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

        // --------------------------------------------------------
        // Remove associated chunks / embeddings
        // --------------------------------------------------------

        var chunks =
            await _ragContext.LegalChunks
                .Where(c => c.DocumentId == id)
                .ToListAsync();

        _ragContext.LegalChunks.RemoveRange(chunks);

        await _ragContext.SaveChangesAsync();

        // --------------------------------------------------------
        // Delete PDF from Azure Blob Storage
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(document.Source))
        {
            await _blobStorageService
                .DeleteDocumentAsync(document.Source);
        }

        // --------------------------------------------------------
        // Delete document database record
        // --------------------------------------------------------

        await _repository.Delete(document);

        return Ok(new
        {
            message = "Document deleted successfully"
        });
    }
}