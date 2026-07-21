using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;


namespace LawBridge.Backend.Repositories;


public class ChatRepository : IChatRepository
{

    private readonly AppDbContext _context;


    public ChatRepository(AppDbContext context)
    {
        _context = context;
    }



    public async Task Add(ChatMessage message)
    {

        await _context.ChatMessages.AddAsync(message);

        await _context.SaveChangesAsync();

    }



    public async Task<List<ChatMessage>> GetByUser(int userId)
    {

        return await _context.ChatMessages
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

    }



    public async Task<List<ChatMessage>> GetSaved(int userId)
    {

        return await _context.ChatMessages
            .Where(m => m.UserId == userId && m.IsSaved)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

    }



    public async Task<ChatMessage?> GetByIdForUser(int id, int userId)
    {

        return await _context.ChatMessages
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);

    }



    public async Task Update(ChatMessage message)
    {

        _context.ChatMessages.Update(message);

        await _context.SaveChangesAsync();

    }



    public async Task Delete(ChatMessage message)
    {

        _context.ChatMessages.Remove(message);

        await _context.SaveChangesAsync();

    }

}
