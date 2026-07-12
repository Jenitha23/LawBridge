using LawBridge.Backend.DTOs.Admin;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Models;


namespace LawBridge.Backend.Services;


public class AdminService : IAdminService
{

    private readonly IUserRepository _userRepository;

    private readonly IJwtService _jwtService;



    public AdminService(
        IUserRepository userRepository,
        IJwtService jwtService
    )
    {

        _userRepository = userRepository;

        _jwtService = jwtService;

    }




    public async Task<string?> Login(AdminLoginDto dto)
    {

        var user =
            await _userRepository.GetByEmail(dto.Email);



        if(user == null)
        {
            return null;
        }



        // Check admin role

        if(user.Role != "Admin")
        {
            return null;
        }




        bool passwordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash
            );



        if(!passwordValid)
        {
            return null;
        }



        var token =
            _jwtService.GenerateToken(user);



        return token;

    }


}