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
    public async Task<User?> GetByIdAsync(int id)
{
    return await _context.Users.FindAsync(id);
}
public Task UpdateAsync(User user)
{
    _context.Users.Update(user);
    return Task.CompletedTask;
}
 public async Task<User> Add(User user)
    {

        await _context.Users.AddAsync(user);

        await _context.SaveChangesAsync();

        return user;

    }
public async Task Update(User user)
{

    _context.Users.Update(user);

    await _context.SaveChangesAsync();

}



    public async Task<User?> GetByEmail(string email)
    {

        return await _context.Users
            .FirstOrDefaultAsync(
                x => x.Email == email
            );

    }

}