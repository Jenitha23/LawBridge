using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;


namespace LawBridge.Backend.Repositories;


public class UserDocumentRepository : IUserDocumentRepository
{

    private readonly AppDbContext _context;


    public UserDocumentRepository(AppDbContext context)
    {
        _context = context;
    }



    public async Task Add(UserDocument document)
    {

        await _context.UserDocuments.AddAsync(document);

        await _context.SaveChangesAsync();

    }



    public async Task<List<UserDocument>> GetByUser(int userId)
    {

        return await _context.UserDocuments
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    }



    public async Task<UserDocument?> GetById(int id)
    {

        return await _context.UserDocuments
            .FirstOrDefaultAsync(d => d.Id == id);

    }



    public async Task Update(UserDocument document)
    {

        _context.UserDocuments.Update(document);

        await _context.SaveChangesAsync();

    }

}
