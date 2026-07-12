using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.DTOs.Admin;
using BCrypt.Net;
namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/profile")]
[Authorize(Roles="Admin")]
public class AdminProfileController : ControllerBase
{


    private readonly IUserRepository _userRepository;



    public AdminProfileController(
        IUserRepository userRepository
    )
    {
        _userRepository = userRepository;
    }



    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {

        var email =
        User.Claims
        .First(x => x.Type.Contains("email"))
        .Value;



        var user =
        await _userRepository.GetByEmail(email);



        if(user == null)
        {
            return NotFound();
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
    [HttpPut]
public async Task<IActionResult> UpdateProfile(
    UpdateProfileDto dto
)
{

    var email =
        User.Claims
        .First(x => x.Type.Contains("email"))
        .Value;



    var user =
        await _userRepository.GetByEmail(email);



    if(user == null)
    {
        return NotFound();
    }



    user.Name = dto.Name;

    user.PhoneNumber = dto.PhoneNumber;

    user.Address = dto.Address;

    user.PreferredLanguage = dto.PreferredLanguage;


    await _userRepository.Update(user);



    return Ok(new
    {
        message = "Admin profile updated successfully"
    });

}
[HttpPut("password")]
public async Task<IActionResult> ChangePassword(
    ChangePasswordDto dto
)
{

    var email =
        User.Claims
        .First(x => x.Type.Contains("email"))
        .Value;



    var user =
        await _userRepository.GetByEmail(email);



    if(user == null)
    {
        return NotFound();
    }



    bool passwordValid =
        BCrypt.Net.BCrypt.Verify(
            dto.CurrentPassword,
            user.PasswordHash
        );



    if(!passwordValid)
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
[HttpPost("image")]
public async Task<IActionResult> UploadProfileImage(
    IFormFile image
)
{

    var email =
        User.Claims
        .First(x => x.Type.Contains("email"))
        .Value;



    var user =
        await _userRepository.GetByEmail(email);



    if(user == null)
    {
        return NotFound();
    }



    if(image == null || image.Length == 0)
    {
        return BadRequest(new
        {
            message="Image is required"
        });
    }



    var extension =
        Path.GetExtension(image.FileName);



    var allowedExtensions =
        new[]
        {
            ".jpg",
            ".jpeg",
            ".png"
        };



    if(!allowedExtensions.Contains(
        extension.ToLower()
    ))
    {
        return BadRequest(new
        {
            message="Only JPG and PNG allowed"
        });
    }




    var fileName =
        Guid.NewGuid().ToString()
        + extension;



    var folderPath =
        Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "profiles"
        );



    if(!Directory.Exists(folderPath))
    {
        Directory.CreateDirectory(folderPath);
    }



    var filePath =
        Path.Combine(
            folderPath,
            fileName
        );



    using(var stream =
        new FileStream(
            filePath,
            FileMode.Create
        ))
    {

        await image.CopyToAsync(stream);

    }



    user.ProfileImage =
        "/uploads/profiles/" + fileName;



    user.UpdatedAt =
        DateTime.UtcNow;



    await _userRepository.Update(user);



    return Ok(new
    {
        message="Profile image updated successfully",
        imageUrl=user.ProfileImage
    });

}


}