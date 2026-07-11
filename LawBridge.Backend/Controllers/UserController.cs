using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/users")]

public class UserController : ControllerBase
{


    [Authorize]
    [HttpGet("profile")]

    public IActionResult Profile()
    {

        var email =
        User.Claims
        .FirstOrDefault(x =>
        x.Type == ClaimTypes.Email)
        ?.Value;


        return Ok(new
        {
            message = "Protected profile data",

            email = email
        });

    }

}