using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.DTOs.UserDocuments;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Services;

namespace LawBridge.Backend.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentController : ControllerBase
{
    private static readonly string[] AllowedExtensions =
    {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    };

    private const long MaxFileSizeBytes =
        10 * 1024 * 1024; // 10 MB

    private readonly UserDocumentService _documentService;
    private readonly IUserDocumentRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly BlobStorageService _blobStorageService;

    public DocumentController(
        UserDocumentService documentService,
        IUserDocumentRepository repository,
        IUserRepository userRepository,
        BlobStorageService blobStorageService)
    {
        _documentService = documentService;
        _repository = repository;
        _userRepository = userRepository;
        _blobStorageService = blobStorageService;
    }

    // ============================================================
    // POST: api/documents/upload
    // FR-09, FR-10, FR-11
    // ============================================================

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string title,
        [FromForm] string language)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please choose a file to upload."
            });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new
            {
                message =
                    "File is too large — max size is 10MB."
            });
        }

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message =
                    "Unsupported file type. Please upload a PDF, JPG, or PNG file."
            });
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            return BadRequest(new
            {
                message = "Title is required."
            });
        }

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        // ========================================================
        // Generate unique Blob filename
        // ========================================================

        var fileName =
            $"{Guid.NewGuid()}{extension}";

        try
        {
            // ====================================================
            // Upload directly to Azure Blob Storage
            // ====================================================

            await using (var uploadStream =
                file.OpenReadStream())
            {
                await _blobStorageService.UploadDocumentAsync(
                    uploadStream,
                    fileName,
                    string.IsNullOrWhiteSpace(file.ContentType)
                        ? GetContentType(extension)
                        : file.ContentType
                );
            }

            // ====================================================
            // Temporary local file
            //
            // UserDocumentService.Process currently expects
            // a physical file path.
            //
            // We therefore download the Blob temporarily,
            // process it, and delete the temporary file.
            // ====================================================

            var tempFilePath =
                Path.Combine(
                    Path.GetTempPath(),
                    fileName
                );

            try
            {
                // =================================================
                // Download Blob temporarily
                // =================================================

                await using (var blobStream =
                    await _blobStorageService
                        .DownloadDocumentAsync(fileName))
                {
                    await using var tempFileStream =
                        new FileStream(
                            tempFilePath,
                            FileMode.Create,
                            FileAccess.Write,
                            FileShare.None
                        );

                    await blobStream.CopyToAsync(
                        tempFileStream);
                }

                // =================================================
                // Determine file type
                // =================================================

                var fileType =
                    extension == ".pdf"
                        ? "pdf"
                        : "image";

                // =================================================
                // IMPORTANT:
                //
                // Store only the Blob filename in the database.
                // Do NOT store /uploads/... anymore.
                // =================================================

                var blobPath = fileName;

                // =================================================
                // Process document
                // =================================================

                var result =
                    await _documentService.Process(
                        userId.Value,
                        title,
                        tempFilePath,
                        blobPath,
                        file.FileName,
                        fileType,
                        string.IsNullOrWhiteSpace(language)
                            ? "English"
                            : language
                    );

                return Ok(
                    ToDetailDto(
                        result.Document,
                        result.Trace
                    )
                );
            }
            finally
            {
                // ================================================
                // Delete temporary local file
                // ================================================

                if (System.IO.File.Exists(tempFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(
                            tempFilePath);
                    }
                    catch
                    {
                        // Ignore cleanup failure.
                    }
                }
            }
        }
        catch (HttpRequestException)
        {
            // ====================================================
            // AI service unavailable
            // ====================================================

            // Remove uploaded Blob because processing failed.
            try
            {
                await _blobStorageService
                    .DeleteDocumentAsync(fileName);
            }
            catch
            {
                // Do not hide original exception.
            }

            return StatusCode(
                503,
                new
                {
                    message =
                        "The AI assistant is unavailable right now. Please check the OpenAI API key/connection and try again."
                }
            );
        }
        catch
        {
            // ====================================================
            // Any other processing failure
            // ====================================================

            // Remove Blob so we don't leave an orphaned file.
            try
            {
                await _blobStorageService
                    .DeleteDocumentAsync(fileName);
            }
            catch
            {
                // Do not hide original exception.
            }

            throw;
        }
    }

    // ============================================================
    // GET: api/documents/file/{fileName}
    //
    // Streams the original uploaded file back so it can be viewed.
    // Documents moved to private Blob Storage (see Upload above —
    // only the Blob filename is stored, not a public path), so
    // there was previously no way to actually fetch this content;
    // the frontend's getAssetUrl() pointed at a file that was never
    // reachable by URL. This endpoint (same auth model as the
    // existing profile-image download endpoints) fixes that.
    //
    // Shared with LegalDocument.Source, which is stored the same
    // way in the same Blob container — any authenticated user can
    // view either their own uploaded document or a legal reference
    // document by filename.
    // ============================================================

    [HttpGet("file/{fileName}")]
    public async Task<IActionResult> GetFile(string fileName)
    {
        try
        {
            var (stream, contentType) =
                await _blobStorageService
                    .DownloadDocumentWithContentTypeAsync(fileName);

            return File(stream, contentType);
        }
        catch (FileNotFoundException)
        {
            return NotFound(new
            {
                message = "File not found."
            });
        }
    }

    // ============================================================
    // GET: api/documents
    // FR-12
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var documents =
            await _repository.GetByUser(
                userId.Value
            );

        var result =
            documents.Select(d =>
                new UserDocumentListItemDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    FileName = d.FileName,
                    FileType = d.FileType,
                    Language = d.Language,
                    Status = d.Status,
                    CreatedAt = d.CreatedAt
                })
            .ToList();

        return Ok(result);
    }

    // ============================================================
    // GET: api/documents/{id}
    // FR-12
    // ============================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var document =
            await _repository.GetById(id);

        if (document == null ||
            document.UserId != userId.Value)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }

        return Ok(
            ToDetailDto(document)
        );
    }

    // ============================================================
    // DELETE: api/documents/{id}
    // ============================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var document =
            await _repository.GetById(id);

        if (document == null ||
            document.UserId != userId.Value)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }

        // ========================================================
        // Delete file from Azure Blob Storage
        // ========================================================

        if (!string.IsNullOrWhiteSpace(
                document.FilePath))
        {
            try
            {
                await _blobStorageService
                    .DeleteDocumentAsync(
                        document.FilePath
                    );
            }
            catch
            {
                // Don't prevent database deletion
                // if Blob cleanup fails.
            }
        }

        // ========================================================
        // Delete database record
        // ========================================================

        await _repository.Delete(document);

        return Ok(new
        {
            message =
                "Document deleted successfully"
        });
    }

    // ============================================================
    // Convert entity to DTO
    // ============================================================

    private static UserDocumentDetailDto ToDetailDto(
        Models.UserDocument d,
        List<DocumentAgentTraceStepDto>? trace = null)
    {
        return new UserDocumentDetailDto
        {
            Id = d.Id,
            Title = d.Title,
            FileName = d.FileName,

            // FilePath now contains the Blob filename
            FilePath = d.FilePath,

            FileType = d.FileType,
            Language = d.Language,
            ExtractedText = d.ExtractedText,
            Explanation = d.Explanation,
            Status = d.Status,
            ErrorMessage = d.ErrorMessage,
            CreatedAt = d.CreatedAt,

            Trace =
                trace ??
                new List<DocumentAgentTraceStepDto>()
        };
    }

    // ============================================================
    // Get current user ID
    // ============================================================

    private async Task<int?> GetUserId()
    {
        var email =
            User.FindFirst(
                ClaimTypes.Email
            )?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return null;
        }

        var user =
            await _userRepository
                .GetByEmailAsync(email);

        return user?.Id;
    }

    // ============================================================
    // Content Type Helper
    // ============================================================

    private static string GetContentType(
        string extension)
    {
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
    }
}