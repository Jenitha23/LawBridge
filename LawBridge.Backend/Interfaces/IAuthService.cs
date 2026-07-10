using LawBridge.Backend.DTOs.Auth;


namespace LawBridge.Backend.Interfaces;


public interface IAuthService
{

    Task<AuthResponseDto> Register(RegisterDto dto);


    Task<AuthResponseDto> Login(LoginDto dto);

}