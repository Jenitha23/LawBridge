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

}
