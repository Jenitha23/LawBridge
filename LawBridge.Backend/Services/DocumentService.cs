using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;


namespace LawBridge.Backend.Services;


public class DocumentService
{

    private readonly ILegalDocumentRepository _repository;


    public DocumentService(
        ILegalDocumentRepository repository
    )
    {
        _repository=repository;
    }



    public async Task Upload(
        LegalDocument document
    )
    {

        await _repository.Add(document);

    }

}