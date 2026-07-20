using LawBridge.Backend.DTOs.Auth;
using LawBridge.Backend.Models;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Repositories;
using LawBridge.Backend.Helpers;

namespace LawBridge.Backend.Services;

public class AuthService:IAuthService
{


private readonly IUserRepository _repository;
private readonly IJwtService _jwt;



public AuthService(
IUserRepository repository,
IJwtService jwt)
{

_repository=repository;
_jwt=jwt;

}



public async Task<AuthResponseDto> Register(
RegisterDto dto)
{


var existing =
await _repository.GetByEmailAsync(dto.Email);



if(existing!=null)
throw new Exception(
"Email already exists");



var user=new User
{

Name=dto.Name,

Email=dto.Email,

PasswordHash=
PasswordHelper.HashPassword(dto.Password),

PreferredLanguage=
dto.PreferredLanguage,

CreatedAt=DateTime.UtcNow,

UpdatedAt=DateTime.UtcNow

};



await _repository.AddAsync(user);

await _repository.SaveChangesAsync();



return new AuthResponseDto
{
    
Token = _jwt.GenerateToken(user),
Message="Registration successful"

};


}




public async Task<AuthResponseDto> Login(
LoginDto dto)
{


var user=
await _repository.GetByEmailAsync(dto.Email);



if(user==null ||
!PasswordHelper.Verify(
dto.Password,
user.PasswordHash))
{

throw new Exception(
"Invalid credentials");

}


if(!user.IsActive)
{

throw new Exception(
"This account has been disabled. Please contact support.");

}



return new AuthResponseDto
{

Token=_jwt.GenerateToken(user),

Message="Login successful"

};


}


}