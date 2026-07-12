using LawBridge.Backend.Data;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;


namespace LawBridge.Backend.Repositories;


public class LegalDocumentRepository 
    : ILegalDocumentRepository
{

    private readonly AppDbContext _context;


    public LegalDocumentRepository(
        AppDbContext context
    )
    {
        _context=context;
    }



    public async Task Add(
        LegalDocument document
    )
    {

        await _context.LegalDocuments.AddAsync(document);

        await _context.SaveChangesAsync();

    }



    public async Task<List<LegalDocument>> GetAll()
    {

        return _context.LegalDocuments.ToList();

    }

}