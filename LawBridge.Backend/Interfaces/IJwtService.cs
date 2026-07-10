using LawBridge.Backend.Models;

namespace LawBridge.Backend.Interfaces;


public interface IJwtService
{

    string GenerateToken(User user);

}