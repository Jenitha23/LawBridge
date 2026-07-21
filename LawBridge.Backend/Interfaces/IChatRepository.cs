using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface IChatRepository
{

    Task Add(ChatMessage message);


    Task<List<ChatMessage>> GetByUser(int userId);


    Task<List<ChatMessage>> GetSaved(int userId);


    Task<ChatMessage?> GetByIdForUser(int id, int userId);


    Task Update(ChatMessage message);


    Task Delete(ChatMessage message);

}
