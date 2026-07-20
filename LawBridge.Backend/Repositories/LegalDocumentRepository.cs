using Microsoft.EntityFrameworkCore;
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

        return await _context.LegalDocuments
            .Include(d => d.Category)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    }



    public async Task<LegalDocument?> GetById(int id)
    {

        return await _context.LegalDocuments
            .Include(d => d.Category)
            .FirstOrDefaultAsync(d => d.Id == id);

    }



    public async Task Update(LegalDocument document)
    {

        _context.LegalDocuments.Update(document);

        await _context.SaveChangesAsync();

    }



    public async Task Delete(LegalDocument document)
    {

        _context.LegalDocuments.Remove(document);

        await _context.SaveChangesAsync();

    }

}