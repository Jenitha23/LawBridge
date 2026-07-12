using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.Interfaces;


namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles="Admin")]
public class AdminDashboardController 
    : ControllerBase
{

    private readonly IAdminDashboardService _service;



    public AdminDashboardController(
        IAdminDashboardService service
    )
    {
        _service = service;
    }



    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {

        var result =
            await _service.GetStats();


        return Ok(result);

    }

}