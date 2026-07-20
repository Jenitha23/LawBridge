using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface IChatRepository
{

    Task Add(ChatMessage message);


    Task<List<ChatMessage>> GetByUser(int userId);

}
