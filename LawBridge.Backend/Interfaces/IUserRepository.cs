using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface IUserRepository
{

   Task<User?> GetByEmailAsync(string email);

   Task<User?> GetByIdAsync(int id);

   Task AddAsync(User user);

   Task UpdateAsync(User user);

   Task SaveChangesAsync();
}