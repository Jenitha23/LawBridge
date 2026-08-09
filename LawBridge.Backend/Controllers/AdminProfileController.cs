using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.DTOs.Admin;
using LawBridge.Backend.Services;
using BCrypt.Net;

namespace LawBridge.Backend.Controllers;

[ApiController]
[Route("api/admin/profile")]
[Authorize(Roles = "Admin")]
public class AdminProfileController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly BlobStorageService _blobStorageService;

    public AdminProfileController(
        IUserRepository userRepository,
        BlobStorageService blobStorageService)
    {
        _userRepository = userRepository;
        _blobStorageService = blobStorageService;
    }

    // =========================================================
    // GET: api/admin/profile
    // Get Admin Profile
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var email = User.Claims
            .FirstOrDefault(x => x.Type.Contains("email"))
            ?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user =
            await _userRepository.GetByEmail(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Admin not found."
            });
        }

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.PhoneNumber,
            user.Address,
            user.ProfileImage,
            user.PreferredLanguage,
            user.Role
        });
    }

    // =========================================================
    // PUT: api/admin/profile
    // Update Admin Profile
    // =========================================================

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileDto dto)
    {
        var email = User.Claims
            .FirstOrDefault(x => x.Type.Contains("email"))
            ?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user =
            await _userRepository.GetByEmail(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Admin not found."
            });
        }

        user.Name = dto.Name;
        user.PhoneNumber = dto.PhoneNumber;
        user.Address = dto.Address;
        user.PreferredLanguage = dto.PreferredLanguage;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.Update(user);

        return Ok(new
        {
            message = "Admin profile updated successfully"
        });
    }

    // =========================================================
    // PUT: api/admin/profile/password
    // Change Admin Password
    // =========================================================

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordDto dto)
    {
        var email = User.Claims
            .FirstOrDefault(x => x.Type.Contains("email"))
            ?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user =
            await _userRepository.GetByEmail(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Admin not found."
            });
        }

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                user.PasswordHash
            );

        if (!passwordValid)
        {
            return BadRequest(new
            {
                message = "Current password is incorrect"
            });
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                dto.NewPassword
            );

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.Update(user);

        return Ok(new
        {
            message = "Password changed successfully"
        });
    }

    // =========================================================
    // POST: api/admin/profile/image
    // Upload Admin Profile Image
    // =========================================================

    [HttpPost("image")]
    public async Task<IActionResult> UploadProfileImage(
        IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest(new
            {
                message = "Image is required"
            });
        }

        // -----------------------------------------------------
        // Validate file size
        // -----------------------------------------------------

        if (image.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new
            {
                message = "Image must be less than 5 MB."
            });
        }

        // -----------------------------------------------------
        // Validate extension
        // -----------------------------------------------------

        var extension =
            Path.GetExtension(image.FileName)
                .ToLowerInvariant();

        var allowedExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message =
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            });
        }

        // -----------------------------------------------------
        // Get current admin
        // -----------------------------------------------------

        var email = User.Claims
            .FirstOrDefault(x => x.Type.Contains("email"))
            ?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }

        var user =
            await _userRepository.GetByEmail(email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Admin not found."
            });
        }

        // -----------------------------------------------------
        // Delete old profile image
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(user.ProfileImage))
        {
            await _blobStorageService
                .DeleteProfileImageAsync(
                    user.ProfileImage
                );
        }

        // -----------------------------------------------------
        // Generate unique blob filename
        // -----------------------------------------------------

        var fileName =
            $"{Guid.NewGuid()}{extension}";

        // -----------------------------------------------------
        // Upload to Azure Blob Storage
        // -----------------------------------------------------

        using var stream =
            image.OpenReadStream();

        var blobName =
            await _blobStorageService
                .UploadProfileImageAsync(
                    stream,
                    fileName,
                    string.IsNullOrWhiteSpace(image.ContentType)
                        ? GetContentType(extension)
                        : image.ContentType
                );

        // -----------------------------------------------------
        // Store ONLY blob filename in database
        // -----------------------------------------------------

        user.ProfileImage = blobName;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.Update(user);

        // -----------------------------------------------------
        // Return backend image endpoint
        // -----------------------------------------------------

        return Ok(new
        {
            message =
                "Profile image updated successfully",

            imageUrl =
                $"/api/admin/profile/image/{blobName}"
        });
    }

    // =========================================================
    // GET: api/admin/profile/image/{fileName}
    // Serve Admin Profile Image from Azure Blob Storage
    // =========================================================

    [HttpGet("image/{fileName}")]
    public async Task<IActionResult> GetProfileImage(
        string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return BadRequest(new
            {
                message = "Invalid file name."
            });
        }

        try
        {
            var result =
                await _blobStorageService
                    .DownloadProfileImageAsync(
                        fileName
                    );

            return File(
                result.Stream,
                result.ContentType
            );
        }
        catch (FileNotFoundException)
        {
            return NotFound(new
            {
                message = "Profile image not found."
            });
        }
        catch
        {
            return StatusCode(500, new
            {
                message =
                    "Unable to retrieve profile image."
            });
        }
    }

    // =========================================================
    // Helper: Content Type
    // =========================================================

    private static string GetContentType(
        string extension)
    {
        return extension switch
        {
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}