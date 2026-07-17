using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.Models;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Services;
using LawBridge.Backend.Data;

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

}