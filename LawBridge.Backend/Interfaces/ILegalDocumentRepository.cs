using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface ILegalDocumentRepository
{

    Task Add(LegalDocument document);


    Task<List<LegalDocument>> GetAll();

}