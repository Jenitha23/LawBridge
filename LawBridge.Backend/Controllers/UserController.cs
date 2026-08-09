using LawBridge.Backend.DTOs.User;
using LawBridge.Backend.Helpers;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LawBridge.Backend.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _repository;
    private readonly BlobStorageService _blobStorageService;

    public UserController(
        IUserRepository repository,
        BlobStorageService blobStorageService)
    {
        _repository = repository;
        _blobStorageService = blobStorageService;
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
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileDto dto)
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
    public async Task<IActionResult> UploadProfilePicture(
        IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please select an image."
            });
        }

        // Validate file type
        var allowedExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        var extension =
            Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message = "Only JPG, JPEG, PNG and WEBP images are allowed."
            });
        }

        // Optional file size limit: 5 MB
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new
            {
                message = "Profile image must be less than 5 MB."
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

        // Generate unique blob name
        var fileName =
            $"{Guid.NewGuid()}{extension}";

        // Upload to Azure Blob Storage
        using var stream = file.OpenReadStream();

        var blobName =
            await _blobStorageService.UploadProfileImageAsync(
                stream,
                fileName,
                file.ContentType
            );

        // Store blob name/path in database
        user.ProfileImage = blobName;
        user.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(user);
        await _repository.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile picture uploaded successfully.",
            imageUrl = blobName
        });
    }

    // ===========================
    // PUT: api/users/change-password
    // Change Password
    // ===========================
    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordDto dto)
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

        if (!PasswordHelper.VerifyPassword(
                dto.CurrentPassword,
                user.PasswordHash))
        {
            return BadRequest(new
            {
                message = "Current password is incorrect."
            });
        }

        user.PasswordHash =
            PasswordHelper.HashPassword(dto.NewPassword);

        user.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(user);
        await _repository.SaveChangesAsync();

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }
}