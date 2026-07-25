using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface IChatRepository
{

    Task Add(ChatMessage message);


    Task<List<ChatMessage>> GetByUser(int userId);


    Task<List<ChatMessage>> GetSaved(int userId);


    Task<ChatMessage?> GetByIdForUser(int id, int userId);


    // All turns in one thread, oldest first — the full chat view.
    Task<List<ChatMessage>> GetByConversation(Guid conversationId, int userId);


    // Deletes every turn belonging to one thread ("My Chats" delete).
    Task DeleteConversation(Guid conversationId, int userId);


    Task Update(ChatMessage message);


    Task Delete(ChatMessage message);

}