using LawBridge.Backend.DTOs.User;
using LawBridge.Backend.Helpers;
using LawBridge.Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LawBridge.Backend.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _repository;

    public UserController(IUserRepository repository)
    {
        _repository = repository;
    }

    // ===========================
    // GET: api/users/profile
    // View Profile
    // ===========================
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> Profile()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user = await _repository.GetByEmailAsync(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            PreferredLanguage = user.PreferredLanguage,
            ProfileImage = user.ProfileImage,
            CreatedAt = user.CreatedAt
        };

        return Ok(userDto);
    }

    // ===========================
    // PUT: api/users/profile
    // Update Profile
    // ===========================
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user = await _repository.GetByEmailAsync(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        user.Name = dto.Name;
        user.PhoneNumber = dto.PhoneNumber;
        user.Address = dto.Address;
        user.PreferredLanguage = dto.PreferredLanguage;
        user.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(user);
        await _repository.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile updated successfully."
        });
    }

    // ===========================
    // POST: api/users/profile-picture
    // Upload Profile Picture
    // ===========================
    [Authorize]
    [HttpPost("profile-picture")]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please select an image."
            });
        }

        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user = await _repository.GetByEmailAsync(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var uploadsFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "profile-images");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.ProfileImage = $"profile-images/{fileName}";
        user.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(user);
        await _repository.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile picture uploaded successfully.",
            imageUrl = user.ProfileImage
        });
    }

    // ===========================
    // PUT: api/users/change-password
    // Change Password
    // ===========================
    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user = await _repository.GetByEmailAsync(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        if (!PasswordHelper.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new
            {
                message = "Current password is incorrect."
            });
        }

        user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(user);
        await _repository.SaveChangesAsync();

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }
}