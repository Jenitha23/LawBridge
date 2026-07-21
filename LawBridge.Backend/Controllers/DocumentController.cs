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
        { ".pdf", ".jpg", ".jpeg", ".png" };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB


    private readonly UserDocumentService _documentService;
    private readonly IUserDocumentRepository _repository;
    private readonly IUserRepository _userRepository;


    public DocumentController(
        UserDocumentService documentService,
        IUserDocumentRepository repository,
        IUserRepository userRepository
    )
    {
        _documentService = documentService;
        _repository = repository;
        _userRepository = userRepository;
    }



    // ===========================
    // POST: api/documents/upload
    // FR-09, FR-10, FR-11
    // ===========================
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string title,
        [FromForm] string language
    )
    {

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Please choose a file to upload." });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new { message = "File is too large — max size is 10MB." });
        }

        var extension =
            Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message = "Unsupported file type. Please upload a PDF, JPG, or PNG file."
            });
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            return BadRequest(new { message = "Title is required." });
        }


        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }


        var fileName =
            Guid.NewGuid() + extension;

        var folder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot/uploads/user-documents"
        );

        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        var fullPath =
            Path.Combine(folder, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }


        var fileType =
            extension == ".pdf" ? "pdf" : "image";

        var publicPath =
            "/uploads/user-documents/" + fileName;

        try
        {

            var document = await _documentService.Process(
                userId.Value,
                title,
                fullPath,
                publicPath,
                file.FileName,
                fileType,
                string.IsNullOrWhiteSpace(language) ? "English" : language
            );

            return Ok(ToDetailDto(document));

        }
        catch (HttpRequestException)
        {

            return StatusCode(503, new
            {
                message = "The AI assistant is unavailable right now. Please make sure Ollama is running and try again."
            });

        }

    }



    // ===========================
    // GET: api/documents
    // FR-12
    // ===========================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }


        var documents =
            await _repository.GetByUser(userId.Value);


        var result = documents.Select(d => new UserDocumentListItemDto
        {
            Id = d.Id,
            Title = d.Title,
            FileName = d.FileName,
            FileType = d.FileType,
            Language = d.Language,
            Status = d.Status,
            CreatedAt = d.CreatedAt
        }).ToList();


        return Ok(result);

    }



    // ===========================
    // GET: api/documents/{id}
    // FR-12
    // ===========================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }


        var document =
            await _repository.GetById(id);


        if (document == null || document.UserId != userId.Value)
        {
            return NotFound(new { message = "Document not found" });
        }


        return Ok(ToDetailDto(document));

    }



    private static UserDocumentDetailDto ToDetailDto(Models.UserDocument d)
    {

        return new UserDocumentDetailDto
        {
            Id = d.Id,
            Title = d.Title,
            FileName = d.FileName,
            FilePath = d.FilePath,
            FileType = d.FileType,
            Language = d.Language,
            ExtractedText = d.ExtractedText,
            Explanation = d.Explanation,
            Status = d.Status,
            ErrorMessage = d.ErrorMessage,
            CreatedAt = d.CreatedAt
        };

    }



    private async Task<int?> GetUserId()
    {

        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return null;
        }

        var user =
            await _userRepository.GetByEmailAsync(email);

        return user?.Id;

    }

}
