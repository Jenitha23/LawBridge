using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Admin;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUserController : ControllerBase
{

    private readonly AppDbContext _context;


    public AdminUserController(
        AppDbContext context
    )
    {
        _context = context;
    }



    [HttpGet]
    public async Task<IActionResult> GetAll()
    {

        var users = await _context.Users
            .Where(u => u.Role == "User")
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserListItemDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                PreferredLanguage = u.PreferredLanguage,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();


        return Ok(users);

    }



    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {

        var user = await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new AdminUserDetailDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                PreferredLanguage = u.PreferredLanguage,
                ProfileImage = u.ProfileImage,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .FirstOrDefaultAsync();


        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found"
            });
        }


        return Ok(user);

    }



    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusDto dto)
    {

        var user =
            await _context.Users.FindAsync(id);


        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found"
            });
        }


        user.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = dto.IsActive
                ? "User account enabled"
                : "User account disabled"
        });

    }

}
