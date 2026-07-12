using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.DTOs.Admin;


namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/auth")]
public class AdminAuthController : ControllerBase
{

    private readonly IAdminService _adminService;



    public AdminAuthController(
        IAdminService adminService
    )
    {
        _adminService = adminService;
    }





    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] AdminLoginDto dto
    )
    {

        var token =
            await _adminService.Login(dto);



        if(token == null)
        {
            return Unauthorized(new
            {
                message = "Invalid admin credentials"
            });
        }



        return Ok(new
        {
            token = token,
            message = "Admin login successful"
        });

    }


}