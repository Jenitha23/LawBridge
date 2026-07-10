using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.DTOs.Auth;


namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/auth")]

public class AuthController : ControllerBase
{

    private readonly IAuthService _service;


    public AuthController(
        IAuthService service)
    {
        _service = service;
    }



    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterDto dto)
    {

        return Ok(
            await _service.Register(dto));

    }



    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginDto dto)
    {

        return Ok(
            await _service.Login(dto));

    }

    [HttpPost("logout")]
public IActionResult Logout()
{

    return Ok(new
    {
        message = "Logout successful"
    });

}

}