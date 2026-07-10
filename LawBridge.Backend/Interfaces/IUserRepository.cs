using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface IUserRepository
{

    Task<User?> GetByEmailAsync(string email);


    Task AddAsync(User user);


    Task SaveChangesAsync();

}