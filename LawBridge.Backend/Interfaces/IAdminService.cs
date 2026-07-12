using LawBridge.Backend.DTOs.Admin;


public interface IAdminService
{

    Task<string?> Login(AdminLoginDto dto);

}