using LawBridge.Backend.Models;


namespace LawBridge.Backend.Interfaces;


public interface IUserDocumentRepository
{

    Task Add(UserDocument document);


    Task<List<UserDocument>> GetByUser(int userId);


    Task<UserDocument?> GetById(int id);


    Task Update(UserDocument document);

}
