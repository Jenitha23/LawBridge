using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Models;
using LawBridge.Backend.Interfaces;


namespace LawBridge.Backend.Repositories;


public class UserRepository : IUserRepository
{

    private readonly AppDbContext _context;


    public UserRepository(AppDbContext context)
    {
        _context = context;
    }



    public async Task<User?> GetByEmailAsync(string email)
    {

        return await _context.Users
            .FirstOrDefaultAsync(x => x.Email == email);

    }



    public async Task AddAsync(User user)
    {

        await _context.Users.AddAsync(user);

    }



    public async Task SaveChangesAsync()
    {

        await _context.SaveChangesAsync();

    }

}